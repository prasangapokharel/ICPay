# Backend architecture

Motoko canister. Entry point `src/main.mo`, which wires the API modules to the
services and nothing more.

---

## Layering

`CONTRIBUTING.md` enforces this. No business logic in `api/` or
`repositories/`. Never skip a layer.

```mermaid
graph TB
    subgraph L1["api/v1/ — shape and auth only"]
        API["Health · Auth · Users · Admin<br/>Dashboard · Deposit · Withdraw<br/>Transfer · UsernameSale<br/>Transactions · Settings"]
    end

    subgraph L2["services/ — all business logic"]
        SVC["Auth · User · Admin · Dashboard<br/>Deposit · Withdraw · Transfer<br/>UsernameSale · Transaction<br/>Settings · Ledger"]
    end

    subgraph L3["repositories/ — data access only"]
        REPO["User · Transaction<br/>Settings · ReservedUsername"]
    end

    subgraph L4["storage/ — stable memory"]
        ST["UserStorage · TransactionStorage<br/>SettingsStorage<br/>ReservedUsernameStorage"]
    end

    MW["middleware/Auth.mo<br/>rejects anonymous callers"]
    VAL["validators/<br/>Principal · Username · Amount<br/>Transfer · Account"]
    LED["ledger/<br/>LedgerClient · Account · Subaccount<br/>Balance · Types · TransferError"]

    API --> MW --> SVC
    SVC --> VAL
    SVC --> REPO --> ST
    SVC --> LED --> ICP(["ICP ledger canister"])

    style L1 fill:#e3f2fd
    style L2 fill:#e8f5e9
    style L3 fill:#fff3e0
    style L4 fill:#fce4ec
```

**Why the layers are worth the ceremony.** `storage/` is stable memory — it
survives upgrades, so its shape is a migration liability. Keeping logic out of
it means a rule change never forces a data migration.

---

## Module wiring

How `main.mo` assembles the actor at init. Storage is created first because
everything else borrows a handle to it.

```mermaid
graph LR
    subgraph Storage["1 — storage"]
        US["UserStorage"]
        TS["TransactionStorage"]
        SS["SettingsStorage"]
        RS["ReservedUsernameStorage"]
    end

    subgraph Services["2 — services"]
        LS["LedgerService"]
        AuthS["AuthService"]
        UserS["UserService"]
        TxS["TransferService"]
        DepS["DepositService"]
        WdS["WithdrawService"]
        SaleS["UsernameSaleService"]
        DashS["DashboardService"]
    end

    subgraph Api["3 — api/v1"]
        AA["Auth"]
        UA["Users"]
        TA["Transfer"]
        DA["Deposit"]
        WA["Withdraw"]
        SA["UsernameSale"]
        DashA["Dashboard"]
    end

    US --> AuthS & UserS & DashS
    TS --> TxS & DepS & WdS
    RS --> SaleS
    SS --> DashS
    LS --> TxS & DepS & WdS & DashS

    AuthS --> AA
    UserS --> UA
    TxS --> TA
    DepS --> DA
    WdS --> WA
    SaleS --> SA
    DashS --> DashA

    style Storage fill:#fce4ec
    style Services fill:#e8f5e9
    style Api fill:#e3f2fd
```

---

## Endpoint map

Query vs update matters for cost and for safety. **Queries are not billed on the
IC** — only update calls and idle burn (~45k cycles/s) cost anything. Queries
are also uncertified, so nothing security-critical may depend on one.

```mermaid
graph LR
    subgraph Public["Unauthenticated — no caller check"]
        H["health"]
        RU["resolveUsername"]
        CU["checkUsername"]
        SU["searchUsers"]
        GP["getUsernamePrice"]
    end

    subgraph Auth["Requires a signed caller"]
        L["login"]
        GD["getDashboard"]
        GDA["getDepositAddress"]
        GT["getTransactions"]
    end

    subgraph Write["Update calls — move value"]
        T1["transferByUsername"]
        T2["transferByPrincipal"]
        T3["transferByAccount"]
        T4["transferByAccountId"]
        W["withdraw"]
        SD["syncDeposits"]
        BU["buyUsername"]
        SUn["setUsername"]
    end

    subgraph Admin["Controller-gated"]
        AR["reserveUsername"]
        ARl["releaseUsername"]
    end

    style Public fill:#f1f8e9
    style Auth fill:#e3f2fd
    style Write fill:#fff3e0
    style Admin fill:#ffebee
```

**The directory is world-readable on purpose.** `resolveUsername` and
`searchUsers` take no `caller` (`api/v1/Users.mo:18,22`). They have to work for
someone who has not signed in — otherwise you could not look up who to pay
before creating an account.

**Admin cannot touch funds.** `api/v1/Admin.mo` exposes reserve and release for
usernames. That is the entire admin surface.

---

## Transfer sequence

The most important path in the codebase. Note where the transaction record is
written relative to the ledger call.

```mermaid
sequenceDiagram
    participant U as User
    participant API as api/v1/Transfer
    participant SVC as TransferService
    participant V as validators
    participant R as UserRepository
    participant TX as TransactionRepository
    participant L as ICP ledger

    U->>API: transferByUsername(name, amount, memo)
    API->>SVC: caller passed through
    SVC->>V: AmountValidator.validate
    SVC->>R: getByUsername(name)
    alt username not found
        R-->>U: #err "Username not found"
    end
    SVC->>V: validateSelfTransfer(caller, recipient)
    SVC->>V: validateMemo(memo)
    SVC->>SVC: resolveSender → source subaccount from caller
    SVC->>TX: create(#transfer, pending)
    Note over TX: written BEFORE the ledger call —<br/>a crash mid-transfer leaves a<br/>pending row, not a silent loss
    SVC->>L: icrc1_transfer(from_subaccount, to, amount, fee)
    alt ledger #Ok
        L-->>SVC: blockIndex
        SVC->>TX: tx.complete(blockIndex)
        SVC->>TX: creditRecipient(...)
        SVC-->>U: #ok { blockIndex, txId }
    else ledger #Err
        L-->>SVC: TransferError
        SVC->>TX: tx.fail()
        SVC-->>U: #err describe(e)
    end
```

**Why the record is created first.** If it were written after a successful
ledger call, a trap between the two would move real funds with no record of it.
Writing first means the worst case is a pending row that reconciles against the
ledger — recoverable, and visible.

**`from_subaccount` comes from `caller`.** Not from an argument. This one line
is why an attacker cannot drain another account by crafting a request.

---

## Deposit sequence

Deposits are pulled, not pushed. The canister cannot be notified when someone
sends to a subaccount, so it reconciles on demand.

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as api/v1/Deposit
    participant SVC as DepositService
    participant L as ICP ledger
    participant TX as TransactionRepository

    U->>FE: open Deposit
    FE->>API: getDepositAddress()
    API->>SVC: derive subaccount(caller)
    SVC-->>FE: ICRC-1 account + legacy account ID
    FE-->>U: QR + copyable address

    Note over U,L: user sends ICP from anywhere — exchange,<br/>another wallet, a friend

    U->>FE: Refresh
    FE->>API: syncDeposits()
    API->>SVC: caller
    SVC->>L: account_balance(subaccount)
    SVC->>TX: diff vs recorded → create #deposit rows
    SVC-->>FE: new transactions
```

**Both address formats are returned** because exchanges are split between
ICRC-1 accounts and legacy 64-char account identifiers. Offering only one
strands users on whichever exchange doesn't support it.

---

## State and upgrades

```mermaid
stateDiagram-v2
    [*] --> Running: dfx deploy (install)
    Running --> Upgrading: dfx deploy (upgrade)
    Upgrading --> Running: stable memory preserved
    Upgrading --> Migrating: shape changed
    Migrating --> Running: src/migrations/ runs
    Running --> [*]: cycles hit zero — <b>canister deleted</b>

    note right of Running
        Only update calls and idle burn
        (~45k cycles/s) cost cycles.
        Queries are free.
    end note

    note right of Upgrading
        Upgrade only. --mode=reinstall
        erases every user, balance record
        and transaction. There is no flag
        for it in the CI tooling.
    end note
```

**Cycles are an availability risk, not just a bill.** At zero the canister is
deleted and every user record goes with it. `npm run ci cycles:balance` is the
one number to watch.
