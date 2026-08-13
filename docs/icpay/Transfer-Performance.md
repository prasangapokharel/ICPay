# ICPay — Transfer & Payment Performance Review

**Scope:** Backend transfer, withdraw, deposit sync, username purchase, bucket billing, swap — **not** bucket file uploads.  
**Last updated:** August 2026

---

## 1. How long does a transfer take?

Every **update call** on the IC costs roughly **one consensus round (~2–4 seconds)** per `await` to another canister.

A typical **ICP transfer by username** today:

```
User clicks Send
      │
      ▼
┌─────────────────────────────────────┐
│ 1. Backend update call starts       │
│    · rate limit, validate (sync)    │
│    · resolve sender + recipient     │
│    · write pending tx row (sync)    │
└──────────────┬──────────────────────┘
               │  ~2–4 s (one round)
               ▼
┌─────────────────────────────────────┐
│ 2. icrc1_transfer → ICP ledger      │  ← cannot skip; money moves here
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Credit recipient tx row (sync)   │
│    Return { blockIndex, txId }      │
└─────────────────────────────────────┘
```

**After PR #51 optimization:** removed the extra `getFee()` ledger call that added **~2–4 s** for display-only data. Transfers are now **one ledger round** instead of two.

---

## 2. What is already optimized

| Area | Optimization | Where |
|------|--------------|-------|
| Transfers | No balance pre-flight | `TransferService.resolveSender` — ledger rejects `#InsufficientFunds` itself |
| Transfers | `fee = null` on ICRC-1 | Ledger charges correct fee; no stale fee guess |
| Transfers | `#Duplicate` treated as success | Safe retries without double-crediting recipient |
| Dashboard | No ledger call in backend | `DashboardService.getDashboard` is sync/query; balance from client |
| Tx history | `getTransactions` is query | Not an update — cheap reads |
| Swap | **Parallel read phase** | `SwapService` — 4 futures before any await |
| Bucket pay | Reuses transfer internal | `transferByAccountInternal` — one rate-limit window |

### Swap parallel pattern (reference implementation)

```motoko
// Dispatch all independent calls first — IC runs them concurrently
let futureTokenInFee  = LedgerService.getFee(tokenIn);
let futureTokenOutFee = LedgerService.getFee(tokenOut);
let futureUserBalance = LedgerService.getBalance(tokenIn, sourceAccount);
let futurePool        = getPool(service, tokenIn, tokenOut);

let tokenInFee  = await futureTokenInFee;
let tokenOutFee = await futureTokenOutFee;
// ...
```

Evaluating an async call **without** `await` sends the request immediately. Four sequential awaits ≈ 4× latency; four parallel futures ≈ 1× latency for the read phase.

---

## 3. Bottlenecks ranked (impact × effort)

### ✅ Fixed — extra `getFee()` round trip

**Was:** `doTransfer` and `withdraw` called `await LedgerService.getFee()` before every transfer. Fee was **only stored in tx history** — the ledger call used `fee = null`.

**Fix:** `LedgerService.estimatedDisplayFee()` returns `Config.ICP_ICRC1_TRANSFER_FEE_E8S` (10_000 e8s). Saves **~2–4 seconds per transfer/withdraw**.

**Note:** `transferByAccountId` (legacy ICP path) still uses the constant in the transfer args — ICP ledger fee has been 0.0001 ICP for years.

---

### ✅ Fixed — `recipientOf` and `userByAccountIdentifier` O(n) scans

**Was:** After every successful transfer, `creditRecipient` scanned **all users** to match deposit subaccount. `transferByAccountId` did the same for 64-char account identifiers.

**Fix:** Two derived indexes in `UserStorage`, rebuilt at canister startup and updated on every new user via `AuthService`:

| Index | Key | Lookup |
|-------|-----|--------|
| `DepositSubaccountIndex` | 32-byte subaccount blob | O(1) |
| `DepositAccountIdIndex` | 64-char account-id hex | O(1) |

**Where:** `UserRepository.indexDepositAccounts`, `TransferService.recipientOf`, `main.mo` startup reindex.

**Tests:** `testing/transfer/TransferIndex.test.mo`, `testing/transfer/TransferPerf.test.mo` (200-user correctness + scan vs index benchmark print).

**Before / after (per transfer, after ledger returns):**

| Step | Before | After |
|------|--------|-------|
| Resolve recipient by subaccount | O(n) users | O(1) map |
| Resolve recipient by account-id | O(n) users | O(1) map |
| Ledger round trip | ~2–4 s | ~2–4 s (unchanged) |
| Extra `getFee()` await | ~2–4 s | **0** (removed) |

**Total wall-clock (typical ICP transfer):** ~4–8 s → **~2–4 s** (fee fix) + negligible CPU at any user count (index fix).

---

### 🔶 Medium — Swap write path is sequential

**Where:** `SwapService` — fee transfer → main account → approve → deposit → swap → transfer out. Each step depends on the previous (funds must settle). **Parallelism not possible** on writes; only reads were parallelized.

**Possible micro-optimization:** Pre-compute pool routing off-chain in frontend to skip one backend read — marginal.

---

### 🟢 Low — Deposit sync

**Where:** `DepositService.syncDeposits` — one `getUserBalance` await.

**Already minimal.** Cannot credit without knowing on-ledger balance. Client could call ledger query directly (same as dashboard balance pattern).

---

### 🟢 Low — Username / bucket purchases

**Where:** Single `transferByAccountInternal` → one ledger await.

**Already minimal** — payment must confirm before granting username or bucket.

---

## 4. What cannot be parallelized

| Operation | Why |
|-----------|-----|
| `icrc1_transfer` | Funds must settle before next step |
| Recipient credit row | Must run after ledger confirms block |
| Username assign after payment | Business rule — pay first |
| Bucket create after payment | Business rule — pay first |
| Swap approve after deposit to main | Token must be in correct account |

**Rule:** Only **independent reads** parallelize. **Writes** in a payment flow are inherently sequential.

---

## 5. Architecture — payment flow map

```
                    TransferService
                    ───────────────
 transferByUsername ─┐
 transferByPrincipal ┼──► doTransfer ──► icrc1_transfer ──► creditRecipient
 transferByAccount  ─┘         ▲
                               │
         UsernameSaleService ───┤ transferByAccountInternal (treasury)
         BucketService.create ─┤
         BucketService.renew ──┘

 WithdrawService ──────────────► icrc1_transfer (out to external account)

 DepositService.syncDeposits ──► getUserBalance (read only)

 SwapService ──────────────────► parallel reads, then sequential writes
```

All payment paths share **`LedgerService.transfer`** → official ICRC-1 ledger canisters only.

---

## 6. Config constants (transfer-related)

| Constant | Value | Purpose |
|----------|-------|---------|
| `ICP_ICRC1_TRANSFER_FEE_E8S` | 10_000 | Display fee in tx rows; legacy account-id transfers |
| `RATE_TRANSFER` | 10/min | Rate limit per principal |
| `RATE_WITHDRAW` | 10/min | Withdraw limit |
| `RATE_SYNC_DEPOSITS` | 10/min | Deposit sync limit |

---

## 7. Frontend — no extra backend calls needed

The frontend already:
- Reads balance **directly from ledger** (query, fast)
- Uses **one** `transferBy*` update per send
- Calls `useRefreshWallet()` after success to update SWR cache

**Do not add** a backend “preview transfer” or balance check endpoint — that would duplicate work the ledger already does.

---

## 8. Recommended next steps (priority order)

| # | Change | Saves | Effort |
|---|--------|-------|--------|
| 1 | ~~Remove `getFee()` from transfer/withdraw~~ | ~2–4 s | ✅ Done |
| 2 | ~~Subaccount → user index~~ | CPU at scale | ✅ Done |
| 3 | ~~Account-id → user index~~ | CPU on account-id transfers | ✅ Done |
| 4 | Document swap read parallel pattern for any new multi-ledger feature | Prevents regressions | Low |

---

## 9. Verify performance locally

```bash
# Full backend suite (48 tests — includes TransferIndex + TransferPerf)
cd backend && bash scripts/run-tests.sh

# Time a transfer on local replica (optional)
cd backend && dfx start --background --clean
# deploy, then:
npm run ci canister:call transferByUsername '("ryjl3-tyaaa-aaaaa-aaaba-cai", "alice", 1000000, null)' --update
```

On mainnet, wall-clock is dominated by **one ledger round** (~2–4 s). That is normal IC latency, not a bug.

---

## 10. Summary

- **Transfers are as fast as the IC allows** once the extra fee fetch was removed.
- **Swap already uses parallel reads** — use that pattern for any new code that needs balance + fee + metadata before a write.
- **Do not parallelize ledger writes** in a payment chain — correctness requires order.
- **Recipient lookup is O(1)** via deposit subaccount and account-id indexes (rebuilt on upgrade, updated on signup).

---

*See also: `docs/icpay/Bucket.md` for file storage (separate from payments).*
