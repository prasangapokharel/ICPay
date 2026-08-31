# ICPay — Fast trade execution plan (existing system)

**Status:** plan  
**Date:** September 2026  
**Scope:** Speed up trades using what is already deployed — no rewrite.

---

## 1. What we already have (do not throw away)

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend  /trade                                            │
│  · TradeForm · quote (client ICPSwap) · runTrade()           │
└───────────────┬─────────────────────────────────────────────┘
                │ 3 separate update calls today  ← problem
                ▼
┌─────────────────────────────────────────────────────────────┐
│  icp_wallet_backend (Motoko)                                 │
│  · depositForTrade  → ICRC out + credit_from_wallet          │
│  · withdrawFromTrade → debit_to_wallet + ICRC in             │
│  · custodial subaccounts per user                            │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│  icpay_trade (Rust)                                          │
│  · trading balance map (per user, per token)                 │
│  · execute_swap → approve + depositFromAndSwap (1 pool hop)  │
│  · 0.1% service fee                                          │
│  · get_trading_balance (query)                               │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
         ICPSwap pool canister
```

| Asset | Location |
|-------|----------|
| Swap logic | `backend/rust/trade/src/api/swap.rs` |
| Wallet bridge | `backend/src/services/TradeService.mo` |
| Frontend orchestration | `frontend/services/trade/trade.ts` → `runTrade()` |
| UI | `frontend/components/trade/trade-form.tsx` |
| Older design docs | `docs/trade/plan1`, `plan2` (plan2 = shipped) |

**Keep:** Rust trade canister, ICPSwap `depositFromAndSwap`, wallet custody, `/trade` page.

**Change:** How many times the browser waits on consensus.

---

## 2. Why it feels slow (15–20s)

The browser fires **three top-level updates** and waits for each:

```ts
// frontend/services/trade/trade.ts — today
runTrade():
  1. depositForTrade()      // ~4–8s (transfer + credit)
  2. executeTradeSwap()     // ~4–8s (swap)
  3. withdrawFromTrade()    // ~4–8s (debit + transfer)
```

Inside each step, wallet ↔ trade ↔ pool calls are already nested. The waste is **three user-visible ingress round trips**, not missing Rust or wrong pool API.

---

## 3. Target: one user call

```
User clicks Confirm
       │
       ▼  ONE update (~6–10s target)
┌──────────────────┐
│ Wallet           │
│ executeTrade()   │───────┐
└──────────────────┘       │
       │                   │
       ├─ debit user (ledger or internal)
       ├─ call trade.execute_swap(...)
       └─ credit user output
```

Frontend becomes:

```ts
// target
await wallet.executeTrade(tokenIn, tokenOut, amountIn, minOut)
```

Same custody model. Same trade canister. **One** spinner.

---

## 4. Phased plan (incremental, low risk)

### Phase 1 — Wallet orchestrator (fastest win, ~1 week)

**Goal:** 3 UI calls → 1. No trade canister upgrade required.

| Layer | Change |
|-------|--------|
| **Motoko** | Add `executeTrade(ledgerIn, ledgerOut, amountIn, minOut)` on wallet API |
| **TradeService** | Reuse existing `depositForTrade` + `withdrawFromTrade` logic inline; between them, call `TradeClient.execute_swap` |
| **Frontend** | Replace `runTrade()` with single `executeTrade()` on wallet actor |
| **Tests** | Extend `TradeService.test.mo` — happy path, swap fail → refund path |

**Flow inside one wallet update:**

```
executeTrade(user, in, out, amount, minOut):
  1. depositForTrade(in, amount)     // existing
  2. trade.execute_swap(...)         // NEW inter-canister from wallet
  3. withdrawFromTrade(out, amountOut) // existing
```

**Latency:** ~8–12s (still 3 logical steps, **1 ingress**).

**Rollback:** Frontend flag `USE_LEGACY_RUN_TRADE` for one release if needed.

---

### Phase 2 — Skip withdraw/deposit per trade (~1 week)

**Goal:** Stop moving tokens wallet ↔ trade on every swap.

Today `depositForTrade` does a **real ICRC transfer** to the trade canister principal, then `credit_from_wallet` books it. That is redundant — wallet already controls user subaccounts.

| Layer | Change |
|-------|--------|
| **Trade (Rust)** | Add `execute_swap_for_user(user, …)` — callable **only** from wallet |
| **Wallet** | New `internalDebitForTrade` / `internalCreditAfterTrade` — adjust custodial balance **without** ICRC to trade principal |
| **Trade** | `execute_swap` debits **trading balance** only; swap output stays until wallet credits user subaccount in same wallet message |

**Or simpler v2a:** Keep trade balance on trade canister but **do not withdraw to wallet after every swap** — only credit trade balance on deposit, swap in place, user balance query = wallet + trade (UI already can show holdings).

**Latency:** ~4–8s (1 ingress + pool + fewer ICRC writes).

---

### Phase 3 — Optional trade balance UI

If Phase 2 keeps funds on trade canister between swaps:

| UI | Change |
|----|--------|
| Wallet page | Show “In trade” vs “Available” |
| `/trade` | Trade from trade balance when sufficient; one-click re-swap |
| Withdraw | Explicit “Move to wallet” (rare) |

Not required for Phase 1 ship.

---

### Phase 4 — Trading UX (ICP pairs)

Execution speed is Phase 1–2. **Trading feel** is UI:

| Now (swap) | Target (trade) |
|------------|----------------|
| Two token pickers | **ICP/XXX** pair header |
| Generic form | Buy ICP / Sell ICP |
| No pair list | ICP markets sidebar |
| Tx in history | Trades filtered by pair |

Backend unchanged after Phase 2. See `plan1/readme` for terminal mockups.

---

## 5. What we explicitly do NOT do in Phase 1–2

- Merge wallet + trade into one canister
- Replace ICPSwap with another DEX
- Limit orders / order book (AMM only)
- Change fee model (keep 0.1%)
- Rewrite frontend quote path (client quote stays — it is free and fast)

---

## 6. File checklist

### Phase 1

```
backend/src/api/v1/Trade.mo              + executeTrade endpoint
backend/src/services/TradeService.mo     + executeTrade orchestration
backend/src/ledger/TradeClient.mo        + execute_swap client method
backend/testing/services/TradeService.test.mo
frontend/services/trade/trade.ts         + executeTrade(), deprecate runTrade
frontend/services/wallet/idl.ts          + candid for executeTrade
frontend/components/trade/trade-form.tsx  wire confirm to executeTrade
```

### Phase 2

```
backend/rust/trade/src/api/swap.rs       + wallet-only entry
backend/rust/trade/src/wallet/gate.rs    + assert wallet caller on new path
backend/src/services/TradeService.mo     + internal debit/credit
```

---

## 7. Success criteria

| Metric | Today | After Phase 1 | After Phase 2 |
|--------|-------|---------------|---------------|
| Browser update calls | 3 | **1** | **1** |
| P50 trade time (mainnet) | ~15s | **~8–12s** | **~4–8s** |
| ICRC transfers per swap | 2 | 2 | **0–1** |
| User stuck partial state | Possible | Same | **Reduced** (atomic wallet msg) |

---

## 8. Deploy order

1. Deploy **wallet** with `executeTrade` (trade canister unchanged).
2. Ship frontend calling wallet only.
3. Soak on mainnet with small trades.
4. Phase 2: upgrade **trade** + wallet together (IDL + caller gate).
5. Phase 4: trading UI when execution is stable.

---

## 9. Doc index

| File | Purpose |
|------|---------|
| `plan2/readme` | Rust migration — **done** |
| `plan3-latency-and-trading.md` | Full analysis + terminal vision |
| **`execution-plan.md`** | **This file** — ship faster trades on existing stack |

**Next action:** ~~implement Phase 1 `executeTrade` on wallet + frontend single call~~ **Done** — deploy wallet + trade canisters together.

## 10. Shipped (September 2026)

| Change | Status |
|--------|--------|
| `wallet.executeTrade` — one ingress call | Code ready |
| `trade.execute_swap_for_user` — wallet-only | Code ready |
| `ensureTradingBalance` — top-up only if trade balance low | Code ready |
| Frontend `runTrade()` → single wallet call | Code ready |

**Deploy:** `npm run ci backend:deploy` + trade canister deploy before production use.

