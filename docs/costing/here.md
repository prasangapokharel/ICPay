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
| Idle (zero users) | $1.92 | $1.92 | — |
| 100 active users | $12.45 | **$2.57** | 79.4% |
| 1,000 active users | $107.25 | **$8.50** | 92.1% |
| **10,000 active users** | **$1,055.22** | **$67.75** | **93.6%** |
| 10,000 heavy users | $3,622.65 | **$331.07** | 90.9% |

**10k daily users now costs about $68/year — under $6/month.**

"Active" = 3 dashboard loads and 10 queries per day, plus a transfer every 5
days. "Heavy" = 10 dashboard loads, 30 queries, and a transfer every day.

Reads no longer appear in either figure: dashboard loads and queries are now
queries, which are not billed. The entire remaining difference between active
and heavy is **transfer volume**, which is the only thing left that scales.

At $68/year for 10k users, ICPay costs **$0.007 per user per year**. One premium
username sale (10 ICP ≈ $50) covers roughly 7,000 user-years.

---

## What actually costs money

Measured cost of one call, averaged over 10 real mainnet calls with idle burn
subtracted:

| Call | Type | Cycles | USD |
|---|---|---|---|
| `getDashboard` **before** | update + ledger cross-call | 66,800,049 | $0.0000902 |
| `getDashboard` **after** | query | **~0 (not billed)** | $0 |
| `getTransactions` | query | **~0 (not billed)** | $0 |

The endpoint was an update call for data it holds locally. The cause was a
single line — `await LedgerService.getBalance(...)` in `DashboardService.mo` —
which put the whole call on the update path. An update call pays consensus
across the subnet; a query is answered by one node.

**Correction to an earlier version of this document.** It reported ~210k cycles
per query. That figure was wrong: it was idle burn accumulated during the
measurement window, misattributed to the calls. Queries on the IC are not
charged to the canister's cycle balance at all. Measured, with the idle window
subtracted:

| Measurement | Marginal cost per call |
|---|---|
| 20× `getTransactions`, run 1 | −4,731 |
| 20× `getTransactions`, run 2 | −3,154 |
| 20× `getTransactions`, run 3 | +20,504 |

Negative values are the giveaway: the result is noise around zero, not a small
positive cost. By contrast an update call measures at 66,799,130 and 66,800,968
across two runs — a 0.003% spread. **Update calls cost cycles; queries do not.**

Idle burn was also understated. Measured over three 60-second windows: 49,671 /
44,329 cyc/s (a first outlier of 269,251 followed a deploy). Call it ~45,000
cyc/s, which is ~1.42 T/year for the backend alone.

Page size is not a cost lever either:

| `getTransactions` page size | Cycles |
|---|---|
| 10 | ~0 |
| 50 | ~0 |

**Row count does not matter for a query. Update-vs-query is the only lever.**

### Queries are free in cycles, not free in latency

Because queries are not billed, the cost of a scan inside one shows up as
**latency and instruction limit**, not as a bill. That is why the per-user
index below is a real fix even though it saves $0.

| Work to render one page of 20, at 500 users × 100 txs | Records touched |
|---|---|
| `getUserTxCount` **before** | 50,000 |
| `getUserTxCount` **after** | **1** (O(1) size read) |
| `getUserTotals` **before** | 50,000 |
| `getUserTotals` **after** | **100** (caller's own only) |

Before, every user's page load walked every other user's history, so the cost
of your dashboard grew with total platform volume. After, it grows only with
your own. A query that exceeds the instruction limit traps, so this was a
correctness cliff ahead, not only a slow path.


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
| Backend | ~3,888,000,000 | 1.42 T |
| Frontend | 1,112,489,340 | 0.41 T |
| **Total** | | **1.83 T — $2.47/year** |

Measured at ~45,000 cyc/s on the backend over repeated 60-second windows. This
is what ICPay costs with zero users. It does not scale with traffic.

---

## Cost breakdown at 10k users

Before the fix — one endpoint was 94% of the bill:

| Component | Cycles/year | USD | % |
|---|---|---|---|
| Dashboard loads (3/user/day) | 731.46 T | $987.47 | 93.6% |
| Transfers (1 per 5 days) | 48.76 T | $65.83 | 6.2% |
| Idle burn | 1.42 T | $1.92 | 0.2% |
| Queries (10/user/day) | 0 | $0 | 0% |
| Storage | 0.11 T | $0.15 | 0.0% |
| **Total** | **781.75 T** | **$1,055.22** | |

After — transfers dominate, which is correct, because a transfer genuinely has
to be an update call:

| Component | Cycles/year | USD | % |
|---|---|---|---|
| Transfers (1 per 5 days) | 48.76 T | $65.83 | 97.2% |
| Idle burn | 1.42 T | $1.92 | 2.8% |
| Dashboard loads (3/user/day) | 0 | $0 | 0% |
| Queries (10/user/day) | 0 | $0 | 0% |
| Storage | 0.11 T | $0.15 | 0.0% |
| **Total** | **50.18 T** | **$67.75** | |

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

## Fixed: the global-log scan

`TxRepo.getUserTxCount` and `getUserTotals` used to walk the **entire global
transaction list**, which was one list shared by all users. Every page load
therefore scanned every other user's transactions.

Fixed in `9126690` by indexing transactions per user. Measured at 500 users ×
100 transactions (50,000 records):

| Work to render one page of 20 | Before | After |
|---|---|---|
| `getUserTxCount` | 50,000 records | **1** (O(1) size read) |
| `getUserTotals` | 50,000 records | **100** (caller's own only) |

This saves no cycles, because these are queries and queries are not billed. It
matters because a query that exceeds the instruction limit **traps**: the old
path turned every user's dashboard into a scan of total platform volume, so it
was a correctness cliff ahead rather than a slow path.

The index stores references to the same transaction objects, not derived
counts. Status is mutated in place by `tx.complete()`/`tx.fail()` at eleven call
sites, so a counter would have drifted the first time a twelfth was added. It
is rebuilt from the global log at startup, which is what backfilled the existing
mainnet data on the upgrade.

Pagination itself was already correct and already safe: `getByUser` walks
newest-first and stops when the page fills, and `TransactionService` clamps
`pageSize` to `MAX_PAGE_SIZE = 50`, so a caller asking for a million rows gets
50.

### Still unbounded

`getById`, `completeTx` and `failTx` still search the global list by ID. They
run inside update calls on the transfer and withdraw paths, where an update
already costs 66.8M cycles, so the scan is currently noise against that. It is
worth an ID-keyed map before transaction volume reaches six figures.

---

## Cycle top-ups

Current balances:

| Canister | Balance | Runway at 10k users |
|---|---|---|
| Backend | 812 T | **~16 years** (was ~1 year) |
| Frontend | 316 T | ~770 years (idle only) |

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
| IC cycles | $68 |
| Domain | $15 |
| Vercel Pro (if commercial) | $240 |
| **Total** | **~$323** |

Vercel is now the largest line by far — **three and a half times the entire IC
bill**. If ICPay stays non-commercial and on Hobby, the real total is about
**$83/year**.

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
marginal cost of the call alone. This subtraction is what an earlier version of
this document got wrong: without it, idle burn is misread as per-call cost, and
free queries appear to cost ~210k cycles each.

Raw measurements, each an equal-length load window and idle window:

| | Value |
|---|---|
| 10× `syncDeposits` (update), run 1 | 66,799,130 per call |
| 10× `syncDeposits` (update), run 2 | 66,800,968 per call |
| 20× `getTransactions` (query), run 1 | −4,731 per call |
| 20× `getTransactions` (query), run 2 | −3,154 per call |
| 20× `getTransactions` (query), run 3 | +20,504 per call |
| Idle, three 60 s windows | 49,671 / 44,329 cyc/s |

The two update runs agree to 0.003%. The three query runs scatter around zero
and go negative, which is what a genuinely unbilled operation looks like once
idle burn is removed. **Queries are not charged to the canister.**

Per-user scan work was measured separately, by building 500 users × 100
transactions and counting records touched. Cycles cannot show this, because the
calls involved are queries and therefore free; the cost is latency and the
instruction limit.

Loops were capped at 10–30 calls — update calls burn real cycles.

Conversion: **1 T cycles = 1 XDR ≈ $1.35**. XDR/USD floats; re-check it if you
need better than ±5%. ICP figures assume $5/ICP and move with the market.

---

## Assumptions worth challenging

- **3 dashboard loads/user/day.** This no longer affects the bill at all —
  reads are queries and queries are free. **Transfer frequency is now the only
  assumption that moves the total.**
- **10k *active* users, not registered.** 10k signups with 500 daily actives
  costs about $5/year, not $68.
- Measured on the current subnet. A different subnet with more nodes costs more
  per update call.
- Queries being unbilled is a property of the current IC pricing model, not a
  guarantee. If query charging is introduced, read volume starts mattering again
  and the per-user index above becomes a cost saving as well as a latency one.
- Excludes the ledger's own 0.0001 ICP transfer fee, which the **user** pays to
  the ledger, not ICPay.
