# ICPAY staking — plan

Lock ICPAY held in ICPay custody for a fixed term, earn a fixed APR paid from a
pre-funded reward pool. Custodial, like the rest of the wallet: the canister
moves the tokens, the user proves who they are with Internet Identity.

Scope is one token. ICPAY only — not a generic staking engine for every ledger
the wallet knows. A second token can be added later by widening one config
field; designing for it now buys nothing today.

---

## 0. Blocking prerequisite — ICPAY supply is not fixed

**Staking cannot ship before this is resolved.** Read from the live ledger on
2026-08-07:

| | |
|---|---|
| `icrc1_total_supply()` | `59_999_999_999_280_000` = **600,000,000 ICPAY** |
| `icrc1_minting_account()` | `mrxi6-dk5go-zznk7-c3plm-gh34v-o26vu-a6577-z7el5-senix-cezfq-jqe` |
| mint blocks in the log | **6** — blocks 0, 1, 3, 4, 5, 51 |

Block 0 minted 100M; five further mints of ~100M each brought it to 600M. Block
51 landed *after* 64 transfers had already settled, so the supply grew while
people held the token.

ICPAY's genesis block is 2026-08-06 10:03 UTC. Commit `94df3c2`, which changed
`minting_account` from the creator to `aaaaa-aa`, was committed at 17:30 local
the same day. **ICPAY was launched before that fix**, so it carries the old
behaviour: the named principal can still mint unlimited new supply.

This contradicts what the token itself promises. Its own `icrc1:description`
reads "Supply is fixed at launch and can never be increased," and the launch UI
says the same.

Paying a fixed APR in a token whose supply the operator can silently inflate is
not a savings product — the yield means nothing if the denominator can move, and
anyone who reads the block log will read it as a rug.

**Required before any staking endpoint goes live:**

1. Set ICPAY's minting account to `aaaaa-aa` (management canister, no caller, so
   nothing can ever transfer out of it) — or publicly and verifiably renounce
   the key.
2. Publish the true supply as 600,000,000. Every surface that says 500M is
   wrong, including the stale `icptokens.net` snapshot.
3. Only then wire the staking endpoints into `main.mo`.

Steps 1–2 are their own task and are **not** part of the staking commits below.
The staking code can be written and tested in parallel; it must not be included
in the actor until they are done.

---

## 1. Where rewards come from

A **pre-funded reward pool**: a fixed ICPAY balance in a canister-owned
subaccount, funded from your own allocation.

Rewards are never minted. That is the whole point — minting rewards would
require keeping the minting key alive forever, which is exactly what §0 exists
to end.

The pool is finite, so the system must never promise more than it holds. One
invariant governs this:

```
committedRewards + rewardOf(newStake) <= poolBalance
```

`committedRewards` is the sum of the **full term reward** of every active
stake — what the pool owes if every current staker holds to unlock and claims
everything. A new stake is refused when it would breach the line. That makes
the pool solvent by construction rather than by hoping few people claim.

Flexible (no lock) has no natural term, so it commits a bounded horizon —
`FLEXIBLE_COMMIT_DAYS` (365) of accrual — rather than an unbounded liability.

---

## 2. Where staked tokens sit

A dedicated **stake subaccount**, canister-owned, exactly the pattern
`REVENUE_SUBACCOUNT` already uses:

```motoko
public let STAKE_SUBACCOUNT: Blob  = "\02\00\00...";  // 32 bytes
public let REWARD_SUBACCOUNT: Blob = "\03\00\00...";
```

`\01...` is taken by `REVENUE_SUBACCOUNT`, so these continue the sequence and
collide with no user's derived subaccount — `Subaccount.fromPrincipal` is
length-prefixed and right-aligned, so a 32-byte blob whose *first* byte is
non-zero can never be produced by it.

Staking is a real `icrc1_transfer` from the user's custodial subaccount into the
stake subaccount, and unstaking is the reverse. The lock is therefore provable
on-chain and survives upgrades.

The alternative — leaving tokens in place and marking them locked in a row —
was rejected: it makes the lock invisible on-chain, and every existing spend
path (`transfer`, `withdraw`, the self-custody sweep) would have to subtract the
locked amount or the funds leak. One missed path is a total loss of the pool.

Principal and rewards are kept in **separate subaccounts**. A reward pool that
shares an account with principal cannot be audited — you could not tell whether
a balance is money owed back to stakers or yield available to pay them.

---

## 3. Layering

Follows the four-layer rule in the backend skill exactly. Calls only go
downward, and the API file touches no storage.

```
api/v1/Stake.mo          thin handlers, caller + params -> ApiResult
services/StakeService.mo  business logic, ledger calls, solvency
services/RewardEngine.mo  ONE pure reward function, no state, no async
repositories/StakeRepository.mo  find / create / update over storage
storage/StakeStorage.mo   the stable structures
models/Stake.mo           record + its mutators
validators/StakeValidator.mo  pure input checks returning ?Text
config/Config.mo          plans, subaccounts, limits (extended, not new)
```

Two deviations from `docs/stake/example`, both deliberate:

- The example puts `Validation.mo` under `services/`. This repo already has a
  `validators/` directory of pure `?Text` checks; staking uses that.
- The example names the reward module `RewardService.mo`. It performs no I/O
  and holds no state, so `RewardEngine.mo` is the honest name and keeps it
  obviously testable.

---

## 4. Data model

```motoko
public type StakeId = Text;

public type StakeStatus = {
  #active;
  #unstaked;         // principal returned, stake closed
  #unstakedEarly;    // closed before unlock, reward forfeited
};

public type Stake = {
  id: StakeId;
  userId: UserId;              // keyed by internal id, like every other row
  owner: Principal;            // who may act on it
  planId: Nat8;
  amount: Nat;                 // principal, e8s
  // The APR in force when the stake was opened. Copied onto the row so that
  // changing a plan later never re-prices a stake somebody already agreed to.
  aprBps: Nat;
  lockDays: Nat;
  startedAt: Int;
  unlockAt: Int;               // == startedAt for flexible
  var claimedReward: Nat;      // running total already paid out
  var lastClaimAt: Int;
  var status: StakeStatus;
};
```

**`aprBps: Nat`, not `apr: Float`.** The example doc uses `Float`. Basis points
(2500 = 25.00%) are used instead: floats do not compare or serialise
predictably in stable memory, and money should never be held in one. All reward
arithmetic is integer.

**`pendingReward` is never stored** — this the example gets exactly right. It is
computed from timestamps on every read. A stored, continuously-updated reward
value is the classic way these systems drift out of sync with their own ledger.

**`poolId` precedent:** `Types.Token` declares `var poolId: ?Text` with a
comment noting it was added early because adding a field to an
already-persisted record needs a migration (M0170). `Stake` is a brand-new
stable type, so it needs no migration now — but the same rule applies the
moment it ships. Fields likely to be wanted soon (e.g. `var compounded: Bool`)
are better declared now than migrated later.

### Storage

```motoko
public type StakeMap    = Map.Map<StakeId, Types.Stake>;
public type StakesByUser = Map.Map<Types.UserId, List.List<StakeId>>;
```

Mirrors `TokenStorage` precisely, including the reason for storing **ids** in
the index rather than rows: the row is mutated in place, and a second copy
would diverge the first time a claim ran.

The example proposes `HashMap<Principal, [Stake]>`. Rejected on two counts: it
keys by principal where this codebase keys by `UserId`, and an immutable array
forces a full rewrite on every claim.

---

## 5. Plans

Compiled into `Config.mo`, not stored. They are a product decision, they change
rarely, and a compiled table cannot be silently edited by a bad update call.

| id | name | lock | APR |
|---|---|---|---|
| 1 | Flexible | 0 days | 8% |
| 2 | 90 Days | 90 | 15% |
| 3 | 120 Days | 120 | 25% |
| 4 | 360 Days | 360 | 50% |

```motoko
public type StakePlan = { id: Nat8; name: Text; lockDays: Nat; aprBps: Nat };

public let STAKE_PLANS: [StakePlan] = [
  { id = 1; name = "Flexible"; lockDays = 0;   aprBps = 800 },
  { id = 2; name = "90 Days";  lockDays = 90;  aprBps = 1500 },
  { id = 3; name = "120 Days"; lockDays = 120; aprBps = 2500 },
  { id = 4; name = "360 Days"; lockDays = 360; aprBps = 5000 },
];

public let STAKE_LEDGER_ID: Text = "5fsnk-rqaaa-aaaan-q6m4q-cai";
public let MIN_STAKE_AMOUNT: Nat = 100_000_000;   // 1 ICPAY, must exceed fee
public let MAX_STAKES_PER_USER: Nat = 20;
public let FLEXIBLE_COMMIT_DAYS: Nat = 365;
```

`MAX_STAKES_PER_USER` bounds the per-user list so a dust-spam attack cannot make
one user's stake list unboundedly expensive to walk — the same reasoning behind
the existing `MAX_PAGE_SIZE` comment.

A 50% APR on a 360-day lock is a large promise. It is only safe because §1 makes
the pool refuse what it cannot pay; without that invariant these numbers are a
liability, not a product.

---

## 6. Reward engine — one function

```motoko
// The single source of truth for what a stake has earned. Pure: no state, no
// async, no reads. Everything -- dashboard, claim, unstake, solvency check --
// calls this, so there is exactly one place a rounding rule can live.
public func accrued(
  amount: Nat, aprBps: Nat, startedAt: Int, until: Int, claimedReward: Nat
): Nat
```

```
elapsedSeconds = max(0, until - startedAt)
gross = amount * aprBps * elapsedSeconds / (10_000 * SECONDS_PER_YEAR)
accrued = gross - claimedReward          // saturating at 0
```

Integer throughout. `amount * aprBps * elapsedSeconds` is multiplied **before**
dividing so precision is not lost to truncation; Motoko `Nat` is arbitrary
precision, so the intermediate cannot overflow.

Rounding always truncates, which favours the pool over the staker by at most 1
e8s per claim. That direction is deliberate: the opposite rounding lets repeated
micro-claims drain the pool a unit at a time.

`until` is a parameter rather than a `Time.now()` call inside, which is what
makes the whole engine unit-testable without a replica.

Callers pass:
- **pending reward** → `until = now`
- **full term commitment** → `until = unlockAt` (or `startedAt + 365d` flexible)

Both the display path and the solvency path therefore run identical arithmetic.

---

## 7. Endpoints

Candid methods on the actor, not HTTP routes — the canister has no HTTP router;
`api/v1/Stake.mo` is a `mixin` spliced in with `include`, like `Token.mo`. The
REST shapes in the example map one-to-one onto these names.

| Method | Kind | Notes |
|---|---|---|
| `getStakePlans()` | query | Compiled table. Frontend never hardcodes APRs. |
| `getMyStakes(limit, offset)` | query | Rows + live `pendingReward`, `remainingDays`. |
| `getStakeStats()` | query | Pool balance, committed, total staked. |
| `stake(planId, amount)` | update | Validate → solvency → ledger transfer → row. |
| `claimStake(id)` | update | Pay accrued from reward pool, bump `claimedReward`. |
| `unstake(id)` | update | After unlock: final claim + principal back. |
| `unstakeEarly(id)` | update | Before unlock: principal back, reward forfeited. |
| `fundStakePool(amount)` | update | **Controller only.** Tops up the reward pool. |
| `getStakePoolBalance()` | query | Auditable by anyone. |

Queries are free on the IC — that is why plan lookup, stake list and pending
reward are all queries, letting the UI update continuously at no cost. The same
reasoning is already written down on `isSymbolAvailable`.

Every controller-only method repeats the guard used throughout `Token.mo`:

```motoko
if (not Principal.isController(MiddlewareAuth.effectiveCaller(mwConfig, caller))) {
  return #err("Not authorized");
};
```

**No endpoint accepts a principal as a parameter.** The caller *is* the account.
The backend skill is explicit on this, and here it is what stops anyone from
unstaking someone else's position.

---

## 8. Call sequences

### stake

```
resolve userId from caller           -- reject unknown user
validate planId, amount, count       -- pure, StakeValidator
compute fullTermReward               -- RewardEngine.accrued(until = unlockAt)
check solvency                       -- committed + fullTerm <= poolBalance
icrc1_transfer  user subaccount -> STAKE_SUBACCOUNT
write #active row                    -- only after the transfer confirms
```

The row is written **after** the ledger call, the reverse of the token launch.
The launch writes first because it charges a fee before creating a canister, so
a trap must leave evidence of the payment. Here the transfer is the *first*
irreversible step, and a row written before a transfer that then failed would
credit a stake nobody funded.

### claim

```
load row, assert caller owns it, assert #active
reward = RewardEngine.accrued(..., until = now)
reject if reward == 0 or reward <= fee   -- fee-only claim burns the pool
icrc1_transfer  REWARD_SUBACCOUNT -> user subaccount
claimedReward += reward; lastClaimAt = now
```

### unstake

```
assert now >= unlockAt                 -- else caller must use unstakeEarly
final claim (same path as above)
icrc1_transfer  STAKE_SUBACCOUNT -> user subaccount   (principal)
status := #unstaked
```

### unstakeEarly

Principal returned in full, **all unclaimed reward forfeited**, status
`#unstakedEarly`. Already-claimed rewards are not clawed back — that would need
a second transfer from a user account the canister should not raid.

The forfeit is what gives the lock meaning. It must be stated plainly in the UI
before the user confirms, not discovered afterwards.

---

## 9. Failure handling

Every ledger call can fail after passing validation. Rules:

- **Transfer fails during `stake`** → no row is written, `#err` carries the
  ledger's own message. Nothing to reconcile.
- **Transfer fails during `claim`** → `claimedReward` is *not* advanced, so the
  reward is still owed and the next claim pays it. Advancing it first would
  silently destroy a user's yield on a transient failure.
- **Principal transfer fails during `unstake`** → status stays `#active`. The
  stake is unchanged and retryable. Marking it closed on a failed transfer would
  strand the principal in the stake subaccount with no row pointing at it.

The ordering rule throughout: **advance state only after the irreversible step
confirms.** That is the same lesson `TokenService.launch` records in its
`setLedgerId` comment.

No pre-flight balance read before any transfer. The ledger already checks funds
and returns the balance in `#InsufficientFunds`, a pre-read costs a consensus
round (~2–3s), and it is racy anyway. `TransferService.resolveSender` says this
explicitly and the skill says not to undo it.

---

## 10. Tests

`backend/testing/` has 24 files run by `bash scripts/run-tests.sh` — not
`npm test`, not `mops test`. Pass criteria is all of them. New endpoints add
tests in the same commit.

| File | Covers |
|---|---|
| `services/RewardEngine.test.mo` | zero elapsed → 0; exact 1-year at 25% → 25%; partial period; `claimedReward` subtraction; truncation direction; large amount, no overflow |
| `validators/StakeValidator.test.mo` | unknown plan, below minimum, zero, over `MAX_STAKES_PER_USER` |
| `repositories/StakeRepository.test.mo` | create, index by user, pagination, status transitions |
| `services/StakeService.test.mo` | solvency refusal at the boundary, early-unstake forfeit, double-claim is a no-op |
| `security/Stake.test.mo` | non-owner cannot claim/unstake; non-controller cannot fund the pool |

The reward engine is pure and takes `until` as a parameter, so all of its
timing cases are ordinary unit tests with no replica and no clock.

---

## 11. Commit sequence

Each step compiles and tests green on its own.

1. `Config.mo` — plans, subaccounts, limits. Constants only.
2. `models/Stake.mo`, `types.mo` — `Stake`, `StakePublic`, `stakeToPublic`.
3. `storage/StakeStorage.mo`, `repositories/StakeRepository.mo` + tests.
4. `services/RewardEngine.mo` + tests. Pure, so this lands fully verified.
5. `services/StakeService.mo` — ledger calls, solvency + tests.
6. `api/v1/Stake.mo` + security tests. **Not yet included in `main.mo`.**
7. Wire into `main.mo` — storage vars, `StakeService.create`, `include StakeApi`.
   **Gated on §0.**
8. Frontend: `/stake` page, `services/stake/`, SWR hook, 10 locale catalogs.

Steps 1–6 are safe to merge at any time — unincluded code changes no behaviour.
Step 7 is the one that goes live, and it must not merge until the minting key is
dead and the true supply is published.

Note that merging to `main` deploys the **frontend** automatically via Vercel.
It does **not** deploy the canister — that is always a human running
`npm run ci backend:deploy`. So step 8 can be visible while step 7 is not yet
live; the page must handle the endpoints not existing yet.

---

## 12. Frontend sketch

Static export, so everything is client-side with `@icp-sdk/core/agent`, SWR, and
no server. Matches the existing `/icpay` page structure.

```
Available: 15,250 ICPAY

[ Flexible 8% ] [ 90d 15% ] [ 120d 25% ] [ 360d 50% ]

Amount [ 5000 ] [MAX]        [ Stake ]

Active stakes
  120 Days · 5,000 ICPAY · 25% APR
  Reward +18.442 · 113 days left      [Claim] [Unstake]
```

Plans come from `getStakePlans()`, never hardcoded — the whole reason that
endpoint exists. Pending reward re-reads on an interval; queries are free, so
this costs nothing.

All 10 locale catalogs (`en hi zh ja ko es fr de pt ru`) get every new key in
the same commit — `language/check.mjs` enforces this, and a missing key throws
`MISSING_MESSAGE` at runtime rather than failing the build.

---

## Summary of decisions

| Decision | Choice | Why |
|---|---|---|
| Supply | Fix minting key first | Fixed APR on inflatable supply is meaningless |
| Rewards | Pre-funded pool | No minting; solvent by construction |
| Custody | Dedicated subaccount | Provable on-chain; no spend path can leak it |
| APR type | `Nat` basis points | Floats do not belong in stable money |
| Key | `UserId` + principal | Matches every other row in the repo |
| Pending reward | Computed | Stored values drift |
| Plans | Compiled | Cannot be silently changed by an update call |
| Reward logic | One pure function | One place for rounding to live |
