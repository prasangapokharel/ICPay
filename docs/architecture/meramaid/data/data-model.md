# Data model

What is stored, where, and what that means for a user. Field names and types are
taken from `backend/src/types.mo` and the `storage/` modules.

---

## Entities

```mermaid
erDiagram
    USER ||--o{ TRANSACTION : "owns"
    USER ||--o| SETTINGS : "has"
    USER ||--o| USERNAME : "claims"
    USER ||--|| SUBACCOUNT : "derives"

    USER {
        Text id PK
        Principal principal UK
        opt-Username username "mutable"
        Text displayName "mutable, free text"
        Int createdAt
        Int updatedAt "mutable"
    }

    TRANSACTION {
        Text id PK "UUID"
        Text userId FK
        TxType txType "deposit withdraw transfer fee"
        Nat amount "e8s"
        Nat fee "e8s"
        Text from "account identifier"
        Text to "account id or at-handle"
        TxStatus status "mutable"
        opt-Nat64 blockIndex "mutable, set on success"
        opt-Text memo "max 32 UTF-8 bytes"
        Int createdAt
        Int updatedAt "mutable"
    }

    SETTINGS {
        Text userId PK
        Text theme
        Text language
        Bool notifications
        Int updatedAt
    }

    USERNAME {
        Text name PK "1-8 chars"
        Principal owner "old names stay mapped"
    }

    SUBACCOUNT {
        Blob bytes "derived, not stored"
    }
```

**`SUBACCOUNT` is derived, never stored.** It is computed from a length-prefixed
principal every time it is needed (`ledger/Subaccount.mo`). Nothing to migrate,
nothing to corrupt, and the same user always resolves to the same deposit
address.

---

## Storage maps

Three maps for users, because three different lookups have to be fast.

```mermaid
graph LR
    subgraph UserStorage["UserStorage"]
        UM["UserMap<br/>Principal → User"]
        UNM["UsernameMap<br/>Text → Principal"]
        UIM["UserIdMap<br/>Text → Principal"]
    end

    subgraph TxStorage["TransactionStorage"]
        TL["TxList<br/>List of Transaction"]
        TBU["TxByUser<br/>UserId → TxList"]
    end

    Q1(["who is caller?"]) --> UM
    Q2(["who is @handle?"]) --> UNM
    Q3(["who is userId?"]) --> UIM
    Q4(["my history"]) --> TBU
    Q5(["tx by id"]) --> TL

    style TL fill:#fff9c4
```

**`UsernameMap` is why old handles keep working.** Changing a username adds a
new entry without removing the old one, so a previously published address
resolves forever (`UserRepository.mo:73-85`).

**`TxList` is a known scaling issue.** `getById`, `completeTx` and `failTx` scan
it linearly. Fine at current volume; quadratic later. An ID-keyed map is on the
roadmap before six-figure volume. `TxByUser` already avoids the scan for the
common per-user history read.

---

## Transaction lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending: row created BEFORE the ledger call
    pending --> completed: ledger #Ok → blockIndex recorded
    pending --> failed: ledger #Err
    pending --> cancelled: explicit cancel
    completed --> [*]
    failed --> [*]
    cancelled --> [*]

    note right of pending
        Written first on purpose.
        A trap between "call the ledger"
        and "write the record" would move
        real funds with no trace of it.
        A stuck pending row is recoverable;
        a silent transfer is not.
    end note
```

A `completed` row always carries a `blockIndex`, which is the ledger's own
receipt. That is what makes any transaction independently verifiable against the
ICP ledger — the user does not have to trust ICPay's copy.

---

## Amounts

```mermaid
graph LR
    A["1 ICP"] --> B["100_000_000 e8s"]
    C["ledger fee"] --> D["10_000 e8s<br/>0.0001 ICP"]
    E["ICP decimals"] --> F["8"]
    G["ckUSDC decimals"] --> H["6 — <b>not shared</b>"]

    style H fill:#fff9c4
```

Everything on-chain is an integer in the token's smallest unit. Floats never
touch a balance. **Decimals are per-token**, which is why Phase 3's multi-token
transfer cannot reuse ICP's formatting.

---

## What is public and permanent

The part that belongs in a privacy policy, stated as a diagram.

```mermaid
graph TB
    subgraph Pub["Public — anyone, no login"]
        U1["username"]
        U2["displayName"]
        U3["memo"]
        U4["every transaction on the ICP ledger"]
    end

    subgraph Priv["Not stored at all"]
        P1["email"]
        P2["phone"]
        P3["password / seed phrase"]
        P4["IP address"]
        P5["analytics profile"]
    end

    subgraph Perm["No deletion path exists"]
        D1["transaction history"]
        D2["old usernames"]
        D3["ledger blocks"]
    end

    style Pub fill:#fff3e0
    style Priv fill:#e8f5e9
    style Perm fill:#ffebee
```

**`displayName` and `memo` are free text, permanent, and public.** A user typing
something private into a memo is publishing it. The UI should keep saying so.

**There is no delete endpoint** in any `api/v1/*.mo`. That is not an oversight —
on-chain history cannot be rewritten, so promising erasure would be a lie.

**The directory is queryable by anyone.** `searchUsers` and `resolveUsername`
take no caller.

---

## Upgrade safety

```mermaid
graph TB
    A["stable memory<br/>storage/*"] --> B{"shape changed<br/>in this deploy?"}
    B -->|"no"| C["dfx deploy → upgrade<br/>state preserved"]
    B -->|"yes"| D["write a migration<br/>src/migrations/"]
    D --> C
    C --> E(["running, data intact"])

    F["--mode=reinstall"] -.->|"erases every user,<br/>balance record and<br/>transaction"| G(["DO NOT"])

    style G fill:#ffebee
    style F fill:#ffebee
    style E fill:#e8f5e9
```

The CI tooling has **no flag for reinstall**. `npm run ci backend:deploy` is
upgrade-only, and every mainnet write sits behind an interactive confirm that
refuses to run without a TTY.

Rollback is verifiable: a canister's module hash is exactly the sha256 of its
wasm, so `backend:rollback <ref> <hash>` rebuilds that commit in a throwaway
worktree and refuses to install on a mismatch. The IC keeps no archive of past
wasms — a hash is a fingerprint, not an artifact.
