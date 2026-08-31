# User flows

End to end, from tap to settled. Every branch shown here exists in the code.

---

## Onboarding

```mermaid
flowchart TD
    A(["visit icpay.app"]) --> B["/login"]
    B --> C{"choose provider"}
    C -->|"Connect Wallet"| D["Internet Identity<br/>id.ai"]
    C -->|"NFID"| E["NFID"]
    D --> F["delegation returned"]
    E --> F
    F --> G["login() on canister"]
    G --> H{"isNew or<br/>no username?"}
    H -->|"yes"| I["UsernamePrompt<br/><i>non-dismissable</i>"]
    H -->|"no"| K["dashboard"]
    I --> J{"5-8 chars<br/>and free?"}
    J -->|"yes"| L["setUsername — free"]
    J -->|"no, 1-4 chars"| M["buyUsername<br/>10 / 5 / 2 / 1 ICP"]
    L --> K
    M --> K

    style I fill:#fff9c4
    style E fill:#ffebee
```

**NFID derives a different principal** — it is a separate identity system, so it
is a *different wallet*. An existing II user who signs in with NFID sees an empty
balance and assumes their funds are gone. The login page says so in one line
directly under the button; that line is not decoration.

**The username prompt has no escape.** No close button, no outside click, no
escape key. A user without a handle cannot be paid by handle, which is the
entire product.

---

## Send

```mermaid
flowchart TD
    A(["Send"]) --> B{"recipient format"}
    B -->|"@handle"| C["resolveUsername"]
    B -->|"principal"| D["transferByPrincipal"]
    B -->|"ICRC-1 account"| E["transferByAccount"]
    B -->|"64-char account ID"| F["transferByAccountId"]
    C --> G{"found?"}
    G -->|"no"| H(["error: username not found"])
    G -->|"yes"| I["transferByUsername"]

    I & D & E & F --> J["validate amount · memo · self-transfer"]
    J --> K["create tx row — pending"]
    K --> L["icrc1_transfer<br/>from_subaccount = caller"]
    L --> M{"ledger result"}
    M -->|"#Ok"| N["tx.complete(blockIndex)"]
    M -->|"#Err"| O["tx.fail() + describe error"]
    N --> P["patch balance into SWR cache"]
    P --> Q(["receipt"])
    O --> R(["error shown, funds untouched"])

    style K fill:#fff9c4
    style R fill:#ffebee
    style Q fill:#e8f5e9
```

Four address formats because people paste whatever their other wallet gave
them. The memo is capped at **32 UTF-8 bytes** — counted in bytes, not
characters, because one emoji costs four and the ledger rejects an oversized
blob outright.

---

## Receive

```mermaid
flowchart TD
    A(["Receive"]) --> B["getDepositAddress()"]
    B --> C["subaccount derived from principal"]
    C --> D["QR + ICRC-1 account + legacy account ID"]
    D --> E(["sender pays from anywhere"])
    E --> F["user taps Refresh"]
    F --> G["syncDeposits()"]
    G --> H["account_balance(subaccount)"]
    H --> I{"balance ><br/>recorded?"}
    I -->|"yes"| J["create #deposit rows"]
    I -->|"no"| K(["nothing new"])
    J --> L(["balance updated"])

    style G fill:#fff9c4
```

**Deposits are pulled, not pushed.** The ICP ledger does not call back into a
canister when funds land in a subaccount, so there is no event to subscribe to.
The canister reconciles its recorded total against the real balance when asked.
That is why deposits need a Refresh and are not instant.

---

## Withdraw

```mermaid
flowchart TD
    A(["Withdraw"]) --> B["enter destination + amount"]
    B --> C["AccountValidator"]
    C --> D{"amount + fee<br/>≤ balance?"}
    D -->|"no"| E(["insufficient funds"])
    D -->|"yes"| F["create tx row — pending"]
    F --> G["icrc1_transfer<br/>from_subaccount = caller<br/>to = external account"]
    G --> H{"result"}
    H -->|"#Ok"| I["tx.complete"]
    H -->|"#Err"| J["tx.fail"]
    I --> K(["funds leave ICPay"])
    J --> L(["error, funds untouched"])

    style K fill:#e8f5e9
    style L fill:#ffebee
```

The 10_000 e8s ledger fee goes to **the ledger, not to ICPay**. ICPay takes no
cut of a transfer or a withdraw. The only revenue today is short-username sales.

---

## Buy a username

```mermaid
flowchart TD
    A(["/username"]) --> B["type a handle"]
    B --> C["checkUsername<br/><i>debounced</i>"]
    C --> D{"available?"}
    D -->|"taken"| E(["show taken"])
    D -->|"reserved"| F(["show reserved"])
    D -->|"free"| G{"length"}
    G -->|"5-8"| H["claim free"]
    G -->|"1-4"| I["getUsernamePrice"]
    I --> J["1-3 → 10 ICP<br/>4 → 5 ICP"]
    J --> K["buyUsername"]
    K --> L["transfer to USERNAME_TREASURY<br/>ni5n2-…-gqe"]
    L --> M["setUsername"]
    H --> M
    M --> N(["old handle keeps resolving<br/>as an alias"])

    style N fill:#e8f5e9
```

**Two pricing rules coexist and both are real.** 5–8 characters are free to
*claim*; any length can be *bought*. That is why the UI can show a 5-character
handle at 2.0 ICP and still be correct — buying it is a separate path from
claiming it.

**Old handles never break.** Changing a username keeps the previous one
resolving (`UserRepository.mo:73-85`), so an address published on a business
card or in a post keeps working forever.

**Proceeds go to a plain principal**, not a canister subaccount, so the treasury
owner can spend them without routing through this canister.

---

## Multi-token view

```mermaid
flowchart TD
    A(["/wallet"]) --> B["listLedgerIds()"]
    B --> C["SNS-W list_deployed_snses"]
    B --> D["+ 5 chain-key ledgers<br/><i>not SNS-launched, so not listed</i>"]
    C & D --> E["for each: icrc1_balance_of"]
    E --> F["icrc1_metadata → symbol, decimals, logo"]
    F --> G{"balance > 0?"}
    G -->|"yes"| H["show holding"]
    G -->|"no"| I["hide"]
    H --> J(["ICP: send + receive<br/><b>others: read only</b>"])

    style J fill:#fff9c4
```

**Read only, today.** `LedgerClient.mo` is bound to the ICP ledger canister ID,
so non-ICP tokens can be seen but not moved. Generalizing it is Phase 3 of the
roadmap — and it is the prerequisite for token creation, trading and merchant
payments alike.

---

## Public profile

```mermaid
flowchart TD
    A(["icpay.app/@handle"]) --> B["resolveUsername<br/><i>unauthenticated</i>"]
    B --> C{"exists?"}
    C -->|"no"| D(["404"])
    C -->|"yes"| E["public profile<br/>display name · avatar · handle"]
    E --> F{"viewer signed in?"}
    F -->|"yes"| G["Tip — prefilled transfer"]
    F -->|"no"| H["Sign in to send"]

    style B fill:#f1f8e9
```

The lookup is deliberately unauthenticated. Requiring a login to *see* a profile
would make an ICPay link useless in a bio or a post — which is the point of
having a username instead of a 63-character principal.
