# ICPay running cost

All figures below are **measured on mainnet**, not estimated from the pricing
table. Method and raw numbers are at the bottom so anyone can re-run them.

Measured 2026-08-02 against `6vbhm-nqaaa-aaaan-q6muq-cai` (backend) and
`63dke-waaaa-aaaan-q6mvq-cai` (frontend assets).

---

## Answer first

| Scale | Cycles / year | USD / year | ICP / year @ $5 |
|---|---|---|---|
| Idle (zero users) | 0.90 T | **$1.22** | 0.24 |
| 100 active users | 8.89 T | **$12.00** | 2.40 |
| 1,000 active users | 80.81 T | **$109.10** | 21.82 |
| **10,000 active users** | **800.03 T** | **$1,080.04** | **216.01** |
| 10,000 heavy users | 2,744.56 T | **$3,705.15** | 741.03 |

**10k daily users costs roughly $1,080/year — about $90/month.**

"Active" = 3 dashboard loads and 10 queries per day, plus a transfer every 5
days. "Heavy" = 10 dashboard loads, 30 queries, and a transfer every day.

At $1,080/year for 10k users, ICPay costs **$0.108 per user per year**. A single
premium username sale (10 ICP ≈ $50) covers roughly 460 user-years.

---

## What actually costs money

Measured cost of one call, averaged over 10 real mainnet calls with idle burn
subtracted:

| Call | Type | Cycles | USD | Share of a session |
|---|---|---|---|---|
| `getDashboard` | update + ledger cross-call | **67,761,726** | $0.0000915 | dominant |
| `getTransactions` | query | **210,243** | $0.00000028 | negligible |

**One dashboard call costs 322× a query call.**

The reason is not compute — it is the `await LedgerService.getBalance(...)`
cross-canister call in `DashboardService.mo:26`. An update call carries
consensus overhead across the subnet; a query is answered by a single node with
no consensus at all.

So the cost model is effectively:

```
yearly cost ≈ (dashboard loads + transfers) × 67.8M cycles + idle
```

Queries and storage round to zero against that.

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

| Component | Cycles/year | USD | % |
|---|---|---|---|
| Dashboard loads (3/user/day) | 741.99 T | $1,001.69 | 92.7% |
| Transfers (1 per 5 days) | 49.47 T | $66.78 | 6.2% |
| Idle burn | 0.90 T | $1.22 | 0.1% |
| Queries (10/user/day) | 7.67 T | $10.35 | 1.0% |
| Storage | 0.11 T | $0.15 | 0.0% |
| **Total** | **800.03 T** | **$1,080.04** | |

**93% of the bill is one endpoint.** Everything else is rounding error.

---

## The optimisation that matters

`getDashboard` is an update call **only because it awaits the ledger balance**.
It mutates nothing — verified by reading `DashboardService.mo:22-45`, which
performs reads and returns a record.

Two options, in order of value:

1. **Split the balance out.** Serve user record, recent transactions and totals
   from a `query` (~210k cycles), and fetch the balance separately. A page load
   that shows cached balance instantly and refreshes it on demand drops the
   common case from 67.8M to 0.2M cycles.
2. **Cache the balance with a short TTL.** The frontend already dedupes at
   30–60s (`hooks/use-wallet-data.ts`); pushing balance reads to on-demand only
   would cut dashboard calls substantially.

Rough effect of option 1, if two-thirds of dashboard loads become queries:

| | Current | After |
|---|---|---|
| 10k users/year | 800 T / $1,080 | **~$362** |

That is a **66% reduction**, and it is worth doing before scale, not after.

The frontend already avoids the other trap: there is **no polling**. Every SWR
hook sets `revalidateOnFocus: false` with 30s–300s deduping, so an idle open tab
costs nothing.

---

## Cycle top-ups

Current balances:

| Canister | Balance | Runway at 10k users |
|---|---|---|
| Backend | 818 T | ~1 year |
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
| IC cycles | $1,080 |
| Domain | $15 |
| Vercel Pro (if commercial) | $240 |
| **Total** | **~$1,335** |

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
| 10× `getDashboard` | 678,903,065 cycles over 82 s |
| Idle during window | 1,285,797 cycles |
| **Per call** | **67,761,726 cycles** |
| 10× `getTransactions` | 2,384,680 cycles over 18 s |
| **Per call** | **210,243 cycles** |

Loops were capped at 10 calls — these burn real cycles.

Conversion: **1 T cycles = 1 XDR ≈ $1.35**. XDR/USD floats; re-check it if you
need better than ±5%. ICP figures assume $5/ICP and move with the market.

---

## Assumptions worth challenging

- **3 dashboard loads/user/day.** If real usage is 10, multiply the dominant
  line by 3.3. Measure this after launch rather than trusting it.
- **10k *active* users, not registered.** 10k signups with 500 daily actives
  costs about $54/year, not $1,080.
- Measured on the current subnet. A different subnet with more nodes costs more
  per update call.
- Excludes the ledger's own 0.0001 ICP transfer fee, which the **user** pays to
  the ledger, not ICPay.
