# System overview

Where ICPay runs and what it talks to. Everything here was read off the code and
the live deployment, not assumed.

---

## Context

The single most misread fact about this project: **the backend is on-chain, the
frontend is not.** The UI is a static export served by Vercel. Only
`6vbhm-nqaaa-aaaan-q6muq-cai` lives on the Internet Computer.

```mermaid
graph TB
    User(["User<br/>browser or PWA"])

    subgraph Vercel["Vercel CDN — off-chain"]
        FE["Next.js 16 static export<br/>icpay.app"]
    end

    subgraph IC["Internet Computer — on-chain"]
        BE["ICPay canister<br/>6vbhm-nqaaa-aaaan-q6muq-cai"]
        Assets["Asset canister<br/>63dke-waaaa-aaaan-q6mvq-cai<br/><i>II derivation origin</i>"]
        Ledger["ICP ledger<br/>ryjl3-tyaaa-aaaaa-aaaba-cai"]
        Index["ICP index<br/>qhbym-qaaaa-aaaaa-aaafq-cai"]
        SNSW["SNS-W registry<br/>qaa6y-5yaaa-aaaaa-aaafa-cai"]
        SNS["SNS + chain-key ledgers<br/>ckBTC · ckETH · ckUSDC · ckUSDT"]
    end

    subgraph Ext["Third parties"]
        II["Internet Identity<br/>id.ai"]
        CG["CoinGecko<br/>ICP price"]
    end

    User -->|"HTTPS"| FE
    User -->|"delegation ceremony<br/>in its own window"| II
    FE -->|"agent-js<br/>update + query calls"| BE
    FE -->|"icrc1_balance_of<br/>read only"| SNS
    FE -->|"list_deployed_snses"| SNSW
    FE -->|"price"| CG
    FE -.->|"derivation origin only —<br/>no traffic"| Assets
    BE -->|"icrc1_transfer<br/>account_balance"| Ledger
    FE -->|"transaction history"| Index

    style FE fill:#fff3e0
    style BE fill:#e8f5e9
    style II fill:#f3e5f5
    style Assets stroke-dasharray: 5 5
```

**Why the asset canister exists at all.** It never serves traffic. Its only job
is to be the Internet Identity *derivation origin*, pinned permanently to
`https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io`. II derives a user's principal
from that origin, so all three domains — `icpay.app`, `www.icpay.app`,
`ic-pay.vercel.app` — resolve to the same wallet. Change it and every user gets
a different principal and cannot reach their funds.

---

## Trust boundaries

Who can do what. The dashed line is the one that matters.

```mermaid
graph LR
    subgraph Untrusted["Untrusted — anyone can forge"]
        Browser["Browser JS<br/>frontend validation<br/>UI state"]
    end

    subgraph Boundary[" "]
        direction TB
        Cert["Certified update call<br/><b>caller principal is signed</b>"]
    end

    subgraph Trusted["Enforced on-chain"]
        Guard["middleware/Auth.mo<br/>rejects anonymous"]
        Valid["validators/<br/>amount · memo · username · account"]
        Sub["from_subaccount derived<br/><b>from caller, never a param</b>"]
    end

    Browser --> Cert --> Guard --> Valid --> Sub

    style Untrusted fill:#ffebee
    style Trusted fill:#e8f5e9
    style Cert fill:#fff9c4
```

The load-bearing property: **every withdraw and transfer derives
`from_subaccount` from `caller`.** It is never accepted as an argument. There is
no code path by which one user's call moves another user's funds, and
`api/v1/Admin.mo` exposes only username reserve/release — it cannot touch a
balance at all.

Frontend validation is a convenience. It is re-run on-chain because a browser
can be edited.

---

## Custody model

```mermaid
graph TB
    subgraph Canister["ICPay canister — holds the keys"]
        direction LR
        S1["subaccount(alice)"]
        S2["subaccount(bob)"]
        S3["subaccount(carol)"]
    end

    A(["alice"]) -->|"only alice's<br/>signed calls"| S1
    B(["bob"]) -->|"only bob's<br/>signed calls"| S2
    C(["carol"]) -->|"only carol's<br/>signed calls"| S3

    Ctrl(["Controller principal<br/>or2yr-…-lqe"]) -.->|"can upgrade the code —<br/><b>and therefore the rules</b>"| Canister

    style Canister fill:#e3f2fd
    style Ctrl fill:#ffebee
```

A subaccount is derived deterministically from a length-prefixed principal
(`ledger/Subaccount.mo`), so the same user always gets the same deposit address.

**The honest caveat, stated plainly:** custodial means the canister holds the
keys. Funds are safe from other *users*, not from a canister *upgrade*. One
controller principal can replace the code and therefore the rules. Moving that
controller to an SNS or NNS-controlled canister is Phase 6 of the roadmap.

---

## Environments

```mermaid
graph LR
    Dev["Local<br/>dfx replica + next dev"] -->|"git push"| GH["GitHub"]
    GH -->|"CI: test · typecheck · build<br/><b>never deploys</b>"| Check{"green?"}
    Check -->|"yes"| Human(["human runs<br/>npm run ci …:deploy"])
    Check -->|"no"| Dev
    GH -->|"auto"| Vercel["Vercel<br/>rebuilds on push to main"]
    Human -->|"dfx deploy --network ic<br/>upgrade only"| Mainnet["mainnet canister"]

    style Check fill:#fff9c4
    style Human fill:#e8f5e9
    style Mainnet fill:#e3f2fd
```

**CI never deploys.** Auto-deploying would require putting the canister's
controller key in a GitHub secret — a key that can also *delete* the canister,
taking every user record with it. Shipping stays a local command run by a human,
behind an interactive confirm that refuses to run without a TTY.
