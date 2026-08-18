# ICPAY presale — plan

Sell ICPAY inside ICPay at a fixed rate. The buyer pays ICP from their custodial
balance; the canister sends ICPAY from company inventory to the buyer's account.
One tap, atomic, fully auditable on-chain.

**Rate: 1 ICP = 10,000 ICPAY.**

Detailed rate economics live in [`../icpay/sell/rate.md`](../icpay/sell/rate.md).
Endpoint design lives in [`../icpay/sell/api.md`](../icpay/sell/api.md). This
document is the presale overview — flow, transparency, accounts, and ship order.

---

## What we are building

| | |
|---|---|
| Product | Fixed-price ICPAY presale inside the wallet |
| Buyer pays | ICP (custodial balance) |
| Buyer receives | ICPAY (custodial balance by default, or external principal) |
| Rate | **10,000 ICPAY per 1 ICP** — constant, no slippage |
| Opening inventory | **10,000,000 ICPAY** (1.67% of ~600M supply) |
| Max raise at full sell-out | **1,000 ICP** (~$2k at $2/ICP) |
| State | **None** — inventory is a ledger balance, not stable memory |

This is not a separate sale canister. It is one service on the existing wallet
canister (`6vbhm-nqaaa-aaaan-q6muq-cai`), same layering as username purchases.

---

## User flow

```
User (logged in, II)
        │
        ▼
  ICPay → ICPAY page → Buy
        │
        ▼
  Enter ICP amount          (min 0.1, max 50 per call)
  See ICPAY received        (amount × 10,000, computed live)
  Optional: send to another principal
        │
        ▼
  Confirm once
        │
        ├─► ICP debited  (user subaccount → revenue subaccount \01)
        └─► ICPAY sent   (sale subaccount \02 → user or named principal)
        │
        ▼
  Success: ICPAY block index shown (only durable receipt for ICPAY leg)
```

**Default destination** is the buyer's own ICPay custodial account so tokens
stay spendable in-app. An optional external principal exists so someone can buy
straight into a self-custody wallet for DEX use later.

**No quote step.** The rate is a constant compiled into the canister. The UI
computes the receive amount on every keystroke from `getIcpayRate()` (free query).

---

## Money flow (on-chain)

```
┌─────────────────────────────────────────────────────────────────┐
│  ICPay backend canister  (6vbhm-nqaaa-aaaan-q6muq-cai)          │
│                                                                 │
│  User custodial ICP          REVENUE \01          SALE \02      │
│  (derived subaccount)    ◄── proceeds      ICPAY inventory ──► │
│         │                      │                  │             │
└─────────┼──────────────────────┼──────────────────┼─────────────┘
          │                      │                  │
          │ ① ICP in             │                  │ ② ICPAY out
          ▼                      ▼                  ▼
   ICP ledger              swept to           ICPAY ledger
   ryjl3-tyaaa...          treasury           5fsnk-rqaaa...
                           (24h timer)        (company token)
```

| Leg | From | To | Mechanism |
|---|---|---|---|
| ICP (charge) | Buyer's custodial subaccount | Canister `\01` | `TransferService.transferByAccountInternal` |
| ICPAY (payout) | Canister `\02` | Buyer's custodial or external account | Raw `LedgerService.transfer` with `from_subaccount = ?\02` |
| ICP (refund) | Canister `\01` | Buyer's custodial subaccount | Only if ICPAY payout fails after ICP landed |

**ICP moves first.** If ICPAY payout fails, ICP sits in `\01` and is refundable.
If ICPAY moved first and ICP failed, inventory would be gone — unrecoverable.

**ICP proceeds** join username-sale and launch revenue in `\01`. The existing
24h sweep timer already moves `\01` → treasury (`ni5n2-efxui-…`). No new
collection path.

---

## Transparent totals (public, verifiable)

The presale is deliberately **stateless**. Totals are derived from public ledger
data plus compiled constants — anyone can verify without trusting the UI.

### What the canister exposes — `getIcpaySale()`

```motoko
public type PresaleStats = {
  rate: Nat;                 // 10_000 — ICPAY per 1 ICP (whole-token ratio)
  inventoryCap: Nat;         // 10_000_000_000_000_000 e8s (= 10M ICPAY)
  inventoryRemaining: Nat;   // live icrc1_balance_of(\02)
  icpaySold: Nat;            // inventoryCap - inventoryRemaining
  icpRaised: Nat;            // icpaySold / rate  (exact — both 8-decimal)
  percentSold: Nat;          // icpaySold * 100 / inventoryCap
  minBuyIcp: Nat;            // 0.1 ICP in e8s
  maxBuyIcp: Nat;            // 50 ICP per call in e8s
  active: Bool;              // inventoryRemaining > fee && not paused
};
```

Because the rate is fixed and both tokens use 8 decimals:

```
icpRaised_e8s = icpaySold_e8s / ICPAY_PER_ICP
```

No counters in stable memory. No migration. The `\02` balance on the ICPAY
ledger is the single source of truth for how much is left.

### What the UI shows

```
┌──────────────────────────────────────────────┐
│  ICPAY Presale                               │
│                                              │
│  ████████████░░░░░░░░  62% sold              │
│  6,200,000 / 10,000,000 ICPAY                │
│  620 ICP raised · 3,800,000 ICPAY remaining  │
│                                              │
│  1 ICP = 10,000 ICPAY                        │
│                                              │
│  Pay     [ 1.0          ] ICP                │
│  Receive   10,000 ICPAY                      │
│                                              │
│  Balance 4.12 ICP                            │
│                                              │
│  Supply ~600,000,000. Minting account is a   │
│  live key — more can be issued. Read before  │
│  you buy.                                    │
│                                              │
│              [   Buy   ]                     │
└──────────────────────────────────────────────┘
```

Progress bar uses `percentSold` from the canister. Refresh on screen open and
after a successful purchase (SWR mutate).

### Third-party verification (no login)

Anyone can audit:

| Check | How |
|---|---|
| Inventory remaining | `icrc1_balance_of` on ICPAY ledger, owner = backend canister, subaccount = `\02…` |
| Inventory cap | constant in deployed wasm / `getIcpaySale().inventoryCap` |
| ICPAY sold | cap − remaining |
| ICP raised | sold ÷ 10,000 (exact) |
| Individual purchases | ICP `#transfer` rows in buyer history + ICPAY block log memos |

Ledger: `5fsnk-rqaaa-aaaan-q6m4q-cai` · Canister owner: `6vbhm-nqaaa-aaaan-q6muq-cai`

---

## Accounts and funding

| Account | Subaccount | Holds | Purpose |
|---|---|---|---|
| User custodial | derived from principal | user's ICP + ICPAY | buyer pays from here |
| Revenue | `\01` (32 bytes) | ICP proceeds | swept to treasury daily |
| Sale inventory | `\02` (32 bytes) | ICPAY for presale | only `\02` can fund payouts |

`\02` cannot collide with user accounts: user subaccounts always start with
`\00` (length-prefixed principal derivation). `\01` and `\02` are fixed blobs.

### Funding order (human steps)

1. **Deploy** backend with `SaleService` wired into `main.mo`
2. Send **100,000 ICPAY** to `\02` — confirm with `icrc1_balance_of`
3. Buy **0.1 ICP** through the live endpoint — verify both legs
4. Top up `\02` to **10,000,000 ICPAY**

Do not fund before deploy — no code can spend from `\02` until the endpoint is
live. Tokens sent early are recoverable but stuck.

Company ICPAY currently sits in personal wallets, not the canister. Operator
transfers from treasury/company wallet → canister `\02`.

---

## Backend design (minimal)

Follows existing layering. **No repository, no storage, no migration.**

| File | Action | ~lines |
|---|---|---|
| `config/Config.mo` | add `SALE_SUBACCOUNT`, `ICPAY_PER_ICP`, `MIN_BUY_ICP`, `MAX_BUY_ICP`, `SALE_INVENTORY_CAP` | 6 |
| `services/SaleService.mo` | new — buy, quote, refund | 110 |
| `api/v1/Sale.mo` | new — 3 endpoints | 20 |
| `main.mo` | wire service + include mixin | 3 |

### Endpoints

| Method | Type | Returns |
|---|---|---|
| `getIcpayRate()` | query | `10_000` (constant) |
| `getIcpaySale()` | update | `PresaleStats` (reads `\02` balance) |
| `buyIcpay(icpAmount, ?recipient)` | update | `{ icpBlock, icpayBlock, icpAmount, icpayAmount, destination }` |

### Buy sequence

1. Validate amount (min/max, `AmountValidator`)
2. Resolve caller (registered user required)
3. Resolve destination (recipient or caller's custodial ICPAY account)
4. `icpayAmount = icpAmount * ICPAY_PER_ICP`
5. Read `\02` balance + ICPAY transfer fee — refuse if short (**before** charging)
6. ICP: user → `\01` via `transferByAccountInternal`
7. ICPAY: `\02` → destination via raw `LedgerService.transfer`
8. On step 7 failure: refund ICP from `\01` → user, return error with ICP block index

Template: `UsernameSaleService.purchase` — pay first, grant second, block index in
every error after payment.

### Config constants

```motoko
public let SALE_SUBACCOUNT: Blob = "\02\00\00...";  // 32 bytes
public let ICPAY_PER_ICP: Nat = 10_000;
public let MIN_BUY_ICP: Nat = 10_000_000;           // 0.1 ICP
public let MAX_BUY_ICP: Nat = 5_000_000_000;        // 50 ICP per call
public let SALE_INVENTORY_CAP: Nat = 10_000_000_000_000_000; // 10M ICPAY e8s
```

---

## Frontend design

| File | What |
|---|---|
| `services/wallet.ts` | IDL entries for 3 methods |
| `services/icpay/icpay.ts` | wrappers + types |
| `components/icpay/buy-icpay-drawer.tsx` | buy UI + progress bar |
| `components/icpay/icpay-token-card.tsx` | Buy button → drawer |
| `language/*/common.json` | all 10 locales, same commit |

Drawer pattern matches `send-token-drawer`: amount input, computed receive line,
one confirm button, spinner states, success chime primed on tap.

**Disclosure before confirm** (blocks ship until wording is agreed):

- Real supply ~600,000,000 (not 500M)
- Minting account is a live key — supply is not fixed
- External principal sends are irreversible

---

## Limits and abuse

| Limit | Value | Notes |
|---|---|---|
| Min buy | 0.1 ICP | → 1,000 ICPAY |
| Max buy | 50 ICP per call | not per user — looping is accepted |
| Per-user cap | none | would need storage + migration |
| Rate limit | reuse `RATE_PURCHASE_USERNAME` or add `RATE_BUY_ICPAY` | 3/min suggested |
| Real ceiling | `\02` inventory | fund only what you intend to sell |

---

## Ship order

```
1. Config + SaleService + unit tests     → commit (not live)
2. api/v1/Sale.mo + security tests       → commit (not live)
3. Wire into main.mo                     → commit (live on deploy)
4. npm run ci backend:deploy             → human
5. Fund \02 with 100K ICPAY              → human
6. Smoke buy 0.1 ICP on mainnet          → verify both legs
7. Top up \02 to 10M ICPAY               → human
8. Frontend drawer + i18n                → commit + deploy frontend
```

Frontend ships **after** backend deploy. IDL methods must exist on the live
canister before the drawer calls them.

---

## Tests (baseline + new)

Add to `backend/testing/`:

**`SaleService.test.mo`**

- payout math at 0.1, 1, 2.5, 50 ICP
- below min / above max refused
- inventory short refuses without charging ICP
- ICPAY decimals = 8 (assumption guard)

**`Sale.test.mo` (security)**

- anonymous caller refused
- external recipient honoured (not silently redirected)

Run: `bash backend/scripts/run-tests.sh` from `backend/`.

---

## After the presale

| Raised | Use |
|---|---|
| ~1,000 ICP (full sell-out) | ~500 ICP + ~5M ICPAY → DEX liquidity pool at same 10,000/ICP rate |
| Remaining ~500 ICP | treasury operational float |

The sale price is a **floor on the listing price**. Pool must open at the same
rate or early buyers are underwater on day one. See
[`rate.md`](../icpay/sell/rate.md#why-10000-and-not-1000--the-liquidity-loop-must-close).

---

## Open blockers

1. **Disclosure wording** — selling a token whose on-chain description says
   "fixed supply" when the minting key is live. Endpoint must not ship without
   buyer-facing copy agreed.
2. **ICPAY inventory transfer** — operator must move 10M ICPAY from company
   wallets to `\02` after deploy.
3. **Minting key** — separate track (`docs/stake/plan/plan.md` §0). Presale can
   ship in parallel but buyers must be informed.

---

## Quick reference

| | |
|---|---|
| Rate | 1 ICP = 10,000 ICPAY |
| Cap | 10,000,000 ICPAY |
| Max raise | 1,000 ICP |
| ICPAY ledger | `5fsnk-rqaaa-aaaan-q6m4q-cai` |
| Backend canister | `6vbhm-nqaaa-aaaan-q6muq-cai` |
| Sale inventory | subaccount `\02` on backend canister |
| ICP proceeds | subaccount `\01` → treasury (24h sweep) |
| Treasury | `ni5n2-efxui-dyqdu-2mnpr-atclq-d6snc-zdq5q-u6ibz-ibpkq-brjpj-gqe` |
| Deep dive | [`../icpay/sell/rate.md`](../icpay/sell/rate.md), [`../icpay/sell/api.md`](../icpay/sell/api.md) |
