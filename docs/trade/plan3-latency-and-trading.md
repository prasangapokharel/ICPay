# ICPay Trade — Plan 3: Latency + trading UX (ICP pairs)

**Status:** plan (not implemented)  
**Date:** September 2026  
**Builds on:** `plan1/readme` (terminal UI), `plan2/readme` (Rust trade canister — **shipped**)

---

## 1. What is already shipped (Plan 2 — done)

| Item | Status |
|------|--------|
| Motoko `SwapService` removed | Done |
| Rust `icpay_trade` canister | Done |
| Wallet bridge: `depositForTrade` / `withdrawFromTrade` | Done |
| ICPSwap `depositFromAndSwap` (one pool call per swap) | Done |
| 0.1% service fee (10 bps) | Done |
| Frontend `/trade` swap form | Done (v1 UI, not a terminal) |
| Default pair logic ICP ↔ other token | Done (`defaultSwapPair`) |

**Plan 2 goal was “swap in Rust, same UI”. That is live.**

---

## 2. What is NOT shipped (the latency analysis is correct)

Today the **frontend still orchestrates three separate ingress update calls**:

```
runTrade():
  1. depositForTrade     → wallet (ICRC transfer + credit_from_wallet)
  2. execute_swap        → trade canister (approve + depositFromAndSwap)
  3. withdrawFromTrade   → wallet (debit_to_wallet + ICRC transfer)
```

### Hop count (current production)

| # | Hop | ~Wall clock |
|---|-----|-------------|
| 1 | UI → Wallet `depositForTrade` | 2–4s |
| 2 | Wallet → Trade `credit_from_wallet` (nested) | +2–4s |
| 3 | UI → Trade `execute_swap` | 2–4s |
| 4 | Trade → Pool `depositFromAndSwap` | 2–4s |
| 5 | UI → Wallet `withdrawFromTrade` | 2–4s |
| 6 | Wallet → Trade `debit_to_wallet` + ICRC out (nested) | +2–4s |

**Total: ~12–20s** — dominated by **sequential ingress calls**, not CPU.

### Partial optimizations already in place

- `credit_from_wallet` is **in-memory** bookkeeping on the trade canister (not a second token transfer).
- Pool side uses **one** ICPSwap method (`depositFromAndSwap`), not transfer-then-swap as two UI steps.

### Still paying the “custodial bridge tax”

- Each trade does a **real ICRC transfer** wallet → trade canister on deposit.
- Each trade does a **real ICRC transfer** trade canister → user subaccount on withdraw.
- Frontend waits for all three top-level calls to finish before showing success.

**None of the “single UI call” or “skip physical escrow per trade” optimizations are implemented yet.**

---

## 3. Target: trading (not just “swap form”)

**Swap** = one-off form: pick two tokens, amount, confirm.  
**Trading** = pair-centric experience (Binance-style), starting with **ICP pairs**:

| Surface | Swap (today) | Trading (target) |
|---------|--------------|------------------|
| Default view | Generic two-token form | **ICP/XXX** pair selected (e.g. ICP/ckBTC) |
| Pair list | Token picker only | Curated **ICP markets** sidebar |
| Quote | On amount change | Live quote + **rate** + min received |
| History | Wallet tx list | **Trade history** for active pair |
| Chart / depth | None | v2: price chart; v2.1: pool depth if API exists |
| Execution | 3 UI calls | **1 UI call** `execute_trade` |

v1 trading UX does **not** require on-chain limit orders. ICPSwap is AMM-only — “trading” here means **market-style UI + fast market execution**, not a CLOB.

### ICP pair scope (v1)

- **Quote asset:** ICP (`ryjl3-tyaaa-aaaaa-aaaba-cai`)
- **Base assets:** tokens with ICPSwap pool vs ICP (ckBTC, ckETH, SNS tokens with liquidity, etc.)
- **Blocked:** ICPAY ledger (no pool liquidity)
- **UI default:** open `/trade?pair=ICP-ckBTC` or remember last pair

---

## 4. Architecture target — one ingress call

### Optimized sequence

```
User → Trade execute_trade (single update)
         ├─ Wallet: debit_user_internal(user, token_in, amount)   [bookkeeping only]
         ├─ ICPSwap: depositFromAndSwap(...)
         ├─ Wallet: credit_user_internal(user, token_out, amount)   [bookkeeping only]
         └─ return SwapResult
```

**No per-trade ICRC moves** between wallet and trade — only mutate custodial balances in wallet storage (wallet already owns user subaccounts).

### Optional later: ICRC-2 pull (non-custodial leg)

For users who hold tokens outside ICPay custody, Trade could `transfer_from` with allowance. **Out of scope for v1** — ICPay is custodial.

### Comparison

| | Today | Plan 3 |
|---|--------|--------|
| Frontend update calls | 3 | **1** |
| ICRC transfers per trade | 2 (in + out) | **0** (internal ledger) |
| Atomicity | Manual refund on swap fail | **Single call** rolls back or explicit escrow |
| Expected latency | 12–20s | **~4–8s** (1 ingress + pool + nested wallet calls) |

Nested wallet calls inside one trade update still cost time, but you stop paying **three rounds of browser → IC consensus → browser**.

---

## 5. Implementation phases

### Phase A — Backend: `execute_trade` (latency)

**Wallet (Motoko)**

- Add `executeTrade(ledgerIn, ledgerOut, amountIn, minOut)` — caller must be user principal.
- Internally: validate balance → call trade `execute_swap` with user context **or** move swap into wallet-orchestrated single message.
- Prefer: **Trade owns swap**; wallet exposes `internalDebit` / `internalCredit` callable **only** by trade canister (no ICRC).

**Trade (Rust)**

- Add `execute_trade_for_user(user, token_in, token_out, amount_in, min_out)`:
  - Called from wallet only (extend `gate.rs`).
  - Debit user **trading balance** or request wallet internal debit via inter-canister call.
  - Run existing `execute_swap` logic.
  - Request wallet internal credit for `token_out`.

**Frontend**

- Replace `runTrade()` three-call sequence with **one** `wallet.executeTrade(...)`.
- Keep quote path unchanged (still client-side ICPSwap quote for speed).

**Tests**

- PocketIC / integration: happy path, insufficient balance, slippage fail, pool fail → no stuck balance.

**Deploy**

- Upgrade trade canister + wallet canister together (IDL + caller checks).

---

### Phase B — Internal ledger (remove per-trade ICRC bridge)

- Stop using `depositForTrade` / `withdrawFromTrade` on every swap.
- Keep those endpoints only when user explicitly **moves funds to/from** trade balance (optional advanced UI) or remove from swap path entirely.
- Trade “balance” becomes a view over wallet custodial balance, or a single shared ledger table in wallet queried by trade.

**Migration:** users with funds stuck in trade canister trading balance → one-time sweep script.

---

### Phase C — Trading UI (ICP pairs)

**Route:** `/trade` (upgrade in place) or `/trade/ICP-ckBTC`

| Component | Work |
|-----------|------|
| Pair header | ICP/XXX symbol, 24h change (from quote history or external index) |
| Market list | ICP pairs with balance + last price |
| Trade panel | Buy ICP / Sell ICP tabs, amount in quote or base |
| Recent trades | User’s swap history filtered by pair |
| Mobile | Pair strip + bottom sheet order form |

**i18n:** `trade.market.*`, `trade.buy`, `trade.sell`, `trade.pair`

**Out of scope v1:** limit orders, margin, order book matching.

---

## 6. What we do not do

- Merge wallet + trade into one canister (possible later; not required for Phase A).
- Promise sub-2s trades on mainnet (IC consensus floor still applies).
- Rename product to “Swap” in nav — user-facing label stays **Trade**.

---

## 7. Success metrics

| Metric | Today | Target |
|--------|-------|--------|
| P50 trade latency (mainnet) | ~15s | **&lt;8s** |
| Frontend update calls per trade | 3 | **1** |
| ICRC ledger writes per trade | 2+ | **0** (swap path) |
| Failed trade partial state | Refund withdraw path | Single-call atomic |

---

## 8. Doc map

| File | Contents |
|------|----------|
| `plan1/readme` | Full terminal vision, order types (future) |
| `plan2/readme` | Rust migration — **implemented** |
| `plan3-latency-and-trading.md` | **This file** — latency fix + ICP pair trading UX |
| `exampleofficial/` | ICPSwap reference snippets |

---

## 9. Next step (recommended order)

1. **Phase A** — `execute_trade` single call (biggest latency win, no UI change required).
2. **Phase B** — internal ledger (remove ICRC bridge tax).
3. **Phase C** — ICP pair trading UI.

Estimate: Phase A+B = backend-only, ~1–2 focused iterations. Phase C = frontend + i18n, parallel once API is stable.
