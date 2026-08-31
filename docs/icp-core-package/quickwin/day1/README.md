# Day 1 — Frontend quick wins (no backend changes)

One-day plan to cut redundant canister calls, lighten the wallet load, and speed up repeat visits. **Motoko stays untouched** — all work is in `frontend/`.

---

## Goals

| Goal | Target |
|---|---|
| Fewer ICPay backend queries | Less CPU burn on `6vbhm-nqaaa-aaaan-q6muq-cai` |
| Faster `/wallet` open | Fewer parallel `icrc1_balance_of` calls |
| Less duplicate SNS-W traffic | One cached `listSnses` per session |
| Calmer polling | One ICP price interval app-wide |

---

## What already works (do not break)

- `SwrProvider`: `revalidateOnFocus: false` globally
- `getDashboard`: fetched once, 5 min dedupe (`FETCH_ONCE` in `useWalletData.ts`)
- Deposit + profile seeded from dashboard (`walletCache.ts`)
- Balances read from ICRC ledgers, not backend (`fetchBalances` in `tokens.ts`)
- `useRefreshWallet()` only invalidates fund-related SWR keys
- Holdings seeded from `localStorage` on reload (`holdingsCache.ts`)
- Ledger ID list cached 10 min (`ledgerIdsCache.ts`)

---

## Day 1 tasks (in order)

### 1. Tiered wallet balance sweep

**Problem:** `/wallet` calls `fetchBalances` for every discovered ledger (pinned + all SNS + launched) — often 40+ queries even when the user holds nothing in most tokens.

**Files:** `hooks/wallet/useWalletData.ts`, `services/tokens.ts`, `lib/wallet/holdingsCache.ts`

**Plan:**

1. **Tier A (blocking):** fetch balances for:
   - `PINNED_LEDGER_IDS` (ICP, ckBTC, ckETH, ckUSDC, ckUSDT)
   - Any ledger with `balance > 0` in `readHoldings(principal)` from `localStorage`
2. **Tier B (background):** remaining IDs from `getCachedLedgerIds`, batched (e.g. 5 per `requestIdleCallback` tick)
3. Merge into one `token-balances` SWR map; UI shows Tier A immediately, Tier B fills in quietly
4. After send/deposit/swap: `useRefreshWallet()` still revalidates everything

**Acceptance:**

- Cold wallet open: ≤ 10 ledger balance calls before first paint (pinned + cached non-zero)
- Full list completes within ~10s idle without blocking UI
- Send/deposit still refreshes all held balances

---

### 2. Metadata only for visible tokens

**Problem:** `metadataLedgerIds(balances)` includes every key in the balance map, including zeros — extra `icrc1_metadata` / index calls.

**Files:** `hooks/wallet/useWalletData.ts` (`useTokenHoldings`), `services/tokens.ts`

**Plan:**

```ts
// Only fetch metadata for tokens we actually render
const ids = [...balances.entries()]
  .filter(([id, bal]) => bal > 0n || PINNED_LEDGER_IDS.includes(id))
  .map(([id]) => id)
```

- Token page can still lazy-fetch metadata for a single ledger if missing from registry

**Acceptance:**

- Wallet metadata fetch count ≤ pinned count + non-zero holdings count
- Pinned zero-balance rows (ckBTC, etc.) still show name/symbol

---

### 3. Shared SNS registry cache

**Problem:** `listSnses` is called from `tokens.ts`, `governance.ts` (`fetchSnsRegistryEntry`, `snsRootForLedger`) independently.

**Files:** new `services/sns/registry.ts` + `hooks/sns/useSnsRegistryList.ts` (or extend `ledgerIdsCache.ts`)

**Plan:**

1. Single fetcher: `fetchSnsRegistryList(identity)` → cached 30 min (session or memory)
2. Replace direct `SnsWasmCanister.listSnses` in:
   - `listSnsLedgerIds` (`tokens.ts`)
   - `snsRootForLedger` / `fetchSnsRegistryEntry` (`governance.ts`)
3. SWR key: `["sns-registry-list", principal]`, `revalidateOnFocus: false`

**Acceptance:**

- One SNS-W call per session when opening wallet + governance + token SNS meta
- Governance and token pages unchanged for users

---

### 4. Unify ICP price polling

**Problem:** `market-stats.tsx` polls every **5s**; `icpPrice/ticket.tsx` uses **60s**.

**Files:** `components/auth/market-stats.tsx`, `hooks/market/useIcpPrice.ts`

**Plan:**

- Remove `refreshInterval: 5_000` from market-stats; use default **60s** (or 30s on home only)
- Keep CoinGecko primary, CMC fallback (`services/market/icpPrice.ts`)
- Single SWR key `icp-price` shared by ticket + market stats

**Acceptance:**

- Network tab: at most one price fetch per 60s per tab
- Dashboard ticket and header stats show same price

---

### 5. Trim route prefetch

**Problem:** Settings menu hover prefetches every route; governance prefetches NNS proposals aggressively.

**Files:** `lib/navigation/prefetchRoute.ts`, `app/(app)/settings/page.tsx`

**Plan:**

1. **Governance:** prefetch only when hovering the Governance tile (not all tiles)
2. **Governance SWR:** add `dedupingInterval: 300_000` on `governance-nns` / SNS keys
3. **Wallet/token:** keep deposit-address + single-ledger balance prefetch on token hover
4. Do **not** prefetch full `token-balances` sweep on hover

**Acceptance:**

- Hovering unrelated menu items does not trigger governance or SNS calls
- Hovering Governance warms NNS proposal list once per 5 min

---

## Out of scope for Day 1

| Item | When |
|---|---|
| Lazy ICRC history (intersection observer) | Day 2 |
| Governance server-side pagination | Day 2 |
| Route `dynamic()` code splitting | Week 2 |
| `useUserSearch` focus revalidation off | Day 2 |
| Backend caching or API changes | Never in this track |

---

## Verify before merge

Run from `frontend/`:

```bash
./node_modules/.bin/tsc --noEmit
npm run build
```

Manual checks:

1. Open `/wallet` — DevTools Network: count ledger `call` requests (target ≤ 10 on first paint)
2. Navigate Settings → hover Governance once — one NNS list fetch, not on other tiles
3. Send token — balances refresh after success
4. Reload wallet — holdings appear from cache immediately, then update

Optional cycle check (operator):

```bash
cd backend && npm run ci backend:logs 2>&1 | tail -20
```

Compare log volume before/after a typical session (wallet → token → settings).

---

## File touch list (Day 1)

| File | Change |
|---|---|
| `hooks/wallet/useWalletData.ts` | Tiered balances, metadata filter |
| `services/tokens.ts` | Use shared SNS list |
| `services/sns/registry.ts` | **New** — cached `listSnses` |
| `lib/wallet/holdingsCache.ts` | Optional: store non-zero ledger IDs for Tier A |
| `services/governance/governance.ts` | Read SNS list from shared cache |
| `components/auth/market-stats.tsx` | 60s price interval |
| `lib/navigation/prefetchRoute.ts` | Governance dedupe + narrower prefetch |
| `hooks/governance/useGovernance.ts` | Longer dedupe on governance keys |

---

## Success metrics

| Metric | Before (typical) | Day 1 target |
|---|---|---|
| Ledger balance calls on wallet open | 40+ | ≤ 10 first paint |
| SNS-W calls per session | 2–4 | 1 |
| ICP price fetches per minute | up to 12 | ≤ 1 |
| `getDashboard` calls per session | 1 (keep) | 1 |

---

## Related docs

| Path | Contents |
|---|---|
| `docs/icp-core-package/canister/features/README.md` | SDK module map |
| `docs/icp-core-package/canister/best-for-icpay/README.md` | What to build with `@icp-sdk/canisters` |
| `frontend/hooks/wallet/useWalletData.ts` | SWR + wallet data patterns |
| `frontend/lib/wallet/walletCache.ts` | Dashboard / deposit seeding |
