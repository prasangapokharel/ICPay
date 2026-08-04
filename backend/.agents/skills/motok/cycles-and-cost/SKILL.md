---
name: cycles-and-cost
description: >-
  Cycle cost model for ICP canisters — what actually costs cycles, how to
  measure it, and how to size runway. Use when optimizing performance,
  choosing query vs update, reviewing a hot path, estimating how long a
  canister can run, or planning for user growth.
---

# Cycles and Cost

A canister stops the moment its cycle balance hits zero. Cost is a correctness
concern, not a performance nicety.

## The one rule that dominates everything

**Queries are free. Update calls are not.**

Measured on a real canister: 10 query calls over 503 rows cost nothing beyond
idle drift, while the equivalent update cost ~70M cycles each. Every read path
that can be a `query` must be a `query`.

```motoko
public shared query ({ caller }) func getTransactions(page : Nat) : async [Tx]
public shared ({ caller }) func withdraw(amount : Nat) : async Result
```

The tradeoff is certification: a query result is served by a single node and is
not consensus-backed, so a malicious node can lie. Reads that only *display*
data are fine. Anything a fund-moving decision depends on must stay an update.

## Cost hierarchy — measure before assuming

Ranked by what actually dominated in a production wallet canister:

| Source | Typical cost | Scales with |
|---|---|---|
| Inter-canister call | ~40M cycles | fixed, per call |
| Full-collection scan | ~7.5M per scan @500 rows | rows × scans |
| Bare update call | ~7M cycles | fixed |
| Query call | ~0 | — |
| Idle (memory) | per-day baseline | bytes stored |

**A single inter-canister call can cost more than several full scans.** Do not
assume the loop is the problem. Measure first.

## How to measure

Balance delta over N calls. Always ~10 calls, never a large loop — loops burn
real cycles on mainnet.

```bash
B0=$(dfx canister status CANISTER | grep Balance | tr -dc '0-9')
for i in $(seq 10); do dfx canister call CANISTER method >/dev/null 2>&1; done
B1=$(dfx canister status CANISTER | grep Balance | tr -dc '0-9')
echo "per_call=$(( (B0-B1)/10 ))"
```

**Subtract idle drift.** The canister burns cycles while the benchmark runs.
Measure a no-call window of the same duration and subtract, or the result for
cheap methods is pure noise:

```bash
B0=...; sleep 25; B1=...   # this delta is idle, not your method
```

**Establish a baseline method.** Benchmark a trivial update (one that does no
scanning) to separate fixed call overhead from the work being studied.
`cost_of_work = measured − baseline`.

## Decomposing a result

Never report a single number. Break it into fixed and variable:

```
cost = fixed_overhead + (rows × per_row_cost)
```

Fit this by measuring at two different row counts. It tells you whether to
optimize the algorithm (variable dominates) or remove a call (fixed dominates)
— and those lead to opposite fixes.

## Runway calculation

```
usable   = balance − (idle_per_day × freezing_threshold_days)
burn/day = idle_per_day + (calls_per_day × cost_per_call)
runway   = usable ÷ burn/day
```

`dfx canister status` gives `Balance`, `Idle cycles burned per day`, and
`Freezing threshold`. **Subtract the freezing reserve** — a canister stops at
the freeze line, not at zero.

Quote runway at a stated load. "Two years" that silently assumes zero traffic
is a misleading number; the same canister can die in a week under real use.

Watch for superlinear growth: if cost/call rises with total rows *and* calls/day
rises with users, burn grows with the square of adoption. 10× the users can be
100× the burn.

## Instruction limit vs running out

Two distinct failure modes, often confused:

- **Cycle exhaustion** — balance hits the freeze line, canister stops. Usually
  hit first, by a wide margin.
- **Instruction trap** — one message exceeds the per-message limit (~16B
  cycles) and traps. A hard wall no top-up fixes.

Check which one binds before designing a fix. Optimizing against a trap that
sits 60× beyond your funding limit is wasted work.

## Optimization order

1. Convert reads to `query` — removes 100% of that path's cost.
2. Remove or move inter-canister calls — often the largest fixed cost. If a
   remote method is itself a `query`, the frontend can call it directly instead
   of paying for a backend round-trip.
3. Collapse repeated scans into one pass.
4. Index by lookup key instead of scanning.
5. Dedupe client-side refetches — an unthrottled `revalidateOnFocus` can cost
   more per day than everything else combined.

Cheapest call is the one never made. Client-side caching often beats any
backend optimization.

## Storage

Charged continuously, so it sets the idle floor. Store IDs, hashes and URLs;
put blobs in external storage. Every row stored is also a row that future scans
must walk — storage cost and compute cost compound.

## Monitoring

Track balance in CI or a cron and alert well before the freeze line. Production
canisters should auto-top-up. `dfx canister status` against mainnet requires a
secure identity — if it warns about a plaintext identity, fix the identity
rather than exporting `DFX_WARNING` permanently.
