# ICPay running cost

All figures below are **measured on mainnet**, not estimated from the pricing
table. Method and raw numbers are at the bottom so anyone can re-run them.

Measured 2026-08-02 against `6vbhm-nqaaa-aaaan-q6muq-cai` (backend) and
`63dke-waaaa-aaaan-q6mvq-cai` (frontend assets).

---

## Answer first

Measured before and after converting `getDashboard` from an update call to a
query (commit `bba0295`):

| Scale | Before | After | Cut |
|---|---|---|---|
| Idle (zero users) | $1.22 | $1.22 | — |
| 100 active users | $12.00 | **$2.02** | 83.2% |
| 1,000 active users | $109.10 | **$9.25** | 91.5% |
| **10,000 active users** | **$1,080.04** | **$81.56** | **92.4%** |
| 10,000 heavy users | $3,705.15 | **$376.87** | 89.8% |

**10k daily users now costs about $82/year — under $7/month.**

"Active" = 3 dashboard loads and 10 queries per day, plus a transfer every 5
days. "Heavy" = 10 dashboard loads, 30 queries, and a transfer every day.

At $82/year for 10k users, ICPay costs **$0.008 per user per year**. One premium
username sale (10 ICP ≈ $50) covers roughly 6,000 user-years.

---

## What actually costs money

Measured cost of one call, averaged over 10 real mainnet calls with idle burn
subtracted:

| Call | Type | Cycles | USD |
|---|---|---|---|
| `getDashboard` **before** | update + ledger cross-call | 67,761,726 | $0.0000915 |
| `getDashboard` **after** | query | **216,657** | $0.00000029 |
| `getTransactions` | query | 210,243 | $0.00000028 |

The endpoint was 322× the cost of a query for data it holds locally. The cause
was a single line — `await LedgerService.getBalance(...)` in
`DashboardService.mo` — which put the whole call on the update path. An update
call pays consensus across the subnet; a query is answered by one node.

Removing the await dropped it to **216,657 cycles, a 99.7% reduction**, and the
balance now comes from the client's own ledger query.

Page size, by contrast, is not a cost lever at all. Measured:

| `getTransactions` page size | Cycles |
|---|---|
| 10 | 210,243 |
| 50 | 199,282 |

Identical within noise. **Update-vs-query is what costs money; row count is
not.**

### Storage is not the problem

| | |
|---|---|
| Backend memory | 19,210,541 bytes |
| Frontend assets | 9,726,356 bytes |
| Storage cost | **0.11 T/year — $0.15/year** |

At IC pricing (127,000 cycles per GiB-second), storing everything ICPay has
costs about **fifteen cents a year**. Storage will not be what constrains this
project. Growth in *update calls* will.

### Idle burn is fixed and tiny

| Canister | Idle cycles/day | Per year |
|---|---|---|
| Backend | 1,354,791,686 | 0.49 T |
| Frontend | 1,112,489,340 | 0.41 T |
| **Total** | | **0.90 T — $1.22/year** |

This is what ICPay costs with zero users. It does not scale with traffic.

---

## Cost breakdown at 10k users

Before the fix — one endpoint was 93% of the bill:

| Component | Cycles/year | USD | % |
|---|---|---|---|
| Dashboard loads (3/user/day) | 741.99 T | $1,001.69 | 92.7% |
| Transfers (1 per 5 days) | 49.47 T | $66.78 | 6.2% |
| Queries (10/user/day) | 7.67 T | $10.35 | 1.0% |
| Idle burn | 0.90 T | $1.22 | 0.1% |
| Storage | 0.11 T | $0.15 | 0.0% |
| **Total** | **800.03 T** | **$1,080.04** | |

After — transfers dominate, which is correct, because a transfer genuinely has
to be an update call:

| Component | Cycles/year | USD | % |
|---|---|---|---|
| Transfers (1 per 5 days) | 49.47 T | $66.78 | 81.9% |
| Queries (10/user/day) | 7.67 T | $10.35 | 12.7% |
| Dashboard loads (3/user/day) | 2.37 T | $3.20 | 3.9% |
| Idle burn | 0.90 T | $1.22 | 1.5% |
| Storage | 0.11 T | $0.15 | 0.0% |
| **Total** | **60.41 T** | **$81.56** | |

The remaining bill is real work: moving money. There is no further large win
available without changing what ICPay does.

---

## What the fix was

`getDashboard` was an update call **only because it awaited the ledger balance**.
It mutates nothing — it reads local state and returns a record.

The frontend was already reading the same balance directly from the ledger as a
query (`useLiveBalance`), so the dashboard's copy was redundant on the two
screens that had it, and four other pages were paying for a 67.8M-cycle call to
read one number.

Done in two commits:

1. `2085700` — four pages moved to `useLiveBalance`. `useCustodian` also had to
   stop reading the dashboard, or the balance hook would have pulled in the very
   update call it exists to avoid.
2. `bba0295` — `icpBalance` dropped from `DashboardData`, the `await` removed,
   and the endpoint declared `query`.

Verified in the generated Candid:

```
getDashboard: () -> (ApiResult_12) query;
```

The frontend already avoids the other common trap: **no polling**. Every SWR
hook sets `revalidateOnFocus: false` with 30s–300s deduping, so an idle open tab
costs nothing.

---

## Still worth fixing

`TxRepo.getUserTxCount` and `getUserTotals` walk the **entire global
transaction list** with no early exit, and `TxList` is one list shared by all
users. Every page load therefore scans every other user's transactions.

At 10k users × 50 transactions, that is 500,000 records scanned to render one
page of 20. It is cheap today because both now sit behind queries, but it is
O(all users) and will show up as latency long before it shows up as cost. The
fix is a per-user counter maintained on insert, or sharding `TxList` by user.

Pagination itself is already correct and already safe: `getByUser` walks
newest-first and stops when the page fills, and `TransactionService` clamps
`pageSize` to `MAX_PAGE_SIZE = 50`, so a caller asking for a million rows gets
50.

---

## Cycle top-ups

Current balances:

| Canister | Balance | Runway at 10k users |
|---|---|---|
| Backend | 818 T | **~13 years** (was ~1 year) |
| Frontend | 316 T | ~285 years (idle only) |

The frontend canister only burns idle cycles — asset serving is a query. It
effectively never needs topping up. **The backend is the one to watch.**

```bash
# check
dfx canister --network ic status icp_wallet_backend

# top up (100 T ≈ $135)
dfx canister --network ic deposit-cycles 100000000000000 icp_wallet_backend
```

Set a reminder to check quarterly. A canister that runs out of cycles is
**deleted**, along with all state — every user record, username and transaction
history. This is the single largest operational risk in the project, larger than
the cost itself.

---

## Non-cycle costs

| Item | USD/year |
|---|---|
| `icpay.app` domain | ~$15 |
| Vercel Hobby | $0 |
| **Total** | **~$15** |

Note Vercel Hobby prohibits commercial use. If ICPay takes fees at any scale,
Pro is $20/month ($240/year) — which would then be **larger than the entire IC
bill at 1,000 users**.

### All-in, 10k users

| | USD/year |
|---|---|
| IC cycles | $82 |
| Domain | $15 |
| Vercel Pro (if commercial) | $240 |
| **Total** | **~$337** |

Vercel is now the largest line by far — **three times the entire IC bill**. If
ICPay stays non-commercial and on Hobby, the real total is about **$97/year**.

---

## Method

Cost per call was measured, not derived, because the pricing table does not
capture cross-call overhead:

```bash
export DFX_WARNING=-mainnet_plaintext_identity
B0=$(dfx canister --network ic status icp_wallet_backend | grep Balance)
for i in $(seq 1 10); do
  dfx canister --network ic call icp_wallet_backend getDashboard "()" >/dev/null
done
B1=$(dfx canister --network ic status icp_wallet_backend | grep Balance)
# per_call = (B0 - B1 - idle_burn_during_window) / 10
```

Idle burn during the measurement window is subtracted, so the figure is the
marginal cost of the call alone.

Raw measurements:

| | Value |
|---|---|
| 10× `getDashboard` **before** | 678,903,065 cycles over 82 s |
| Idle during window | 1,285,797 cycles |
| **Per call** | **67,761,726 cycles** |
| 10× `getDashboard` **after** | 2,464,502 cycles over 19 s |
| **Per call** | **216,657 cycles** |
| 10× `getTransactions` | 2,384,680 cycles over 18 s |
| **Per call** | **210,243 cycles** |

The before and after were measured the same way on the same canister, either
side of the upgrade in `bba0295`. Wall-clock fell from 82 s to 19 s for the same
10 calls, which is the same change seen from the user's side: the dashboard no
longer waits on consensus.

Loops were capped at 10 calls — these burn real cycles.

Conversion: **1 T cycles = 1 XDR ≈ $1.35**. XDR/USD floats; re-check it if you
need better than ±5%. ICP figures assume $5/ICP and move with the market.

---

## Assumptions worth challenging

- **3 dashboard loads/user/day.** This barely matters now — dashboard loads are
  3.9% of the bill. Transfer frequency is the assumption to check instead.
- **10k *active* users, not registered.** 10k signups with 500 daily actives
  costs about $5/year, not $82.
- Measured on the current subnet. A different subnet with more nodes costs more
  per update call.
- Excludes the ledger's own 0.0001 ICP transfer fee, which the **user** pays to
  the ledger, not ICPay.
