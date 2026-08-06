# Phase 4 — Token creation

Phase 3 made every token spendable. This phase lets a user *create* one: image,
name, symbol, description, socials, supply — a real ICRC-1 ledger canister
deployed from the wallet in one screen, without touching dfx.

Launch fee: **5 ICP**, settled to the treasury already in `Config`.

Reference implementations for every module: [`code.md`](code.md).
Flow diagrams and cycle-load analysis: [`mermaid.md`](mermaid.md).
The verified step-by-step, with a worked example: [`flow.md`](flow.md).

---

## Four decisions

Settled. Everything below follows from them.

**1. No Plug. No payment proof. No `txBlockHeight`.**

The reference material routes payment through an external wallet, then passes a
block height the backend verifies against the ledger. That solves a
*non-custodial* problem: the user holds the keys, so the frontend moves the money
and proves it afterwards.

ICPay already holds the funds. `TransferService.transferByAccount` debits the
caller's subaccount inside the same update call. The payment either succeeds or
it does not, and the service has the result in hand.

So `txBlockHeight`, `query_blocks`, and the whole "Verification & Anti-Spam" step
collapse into one line of existing, audited code. There is no `window.ic`
anywhere in `frontend/` and none is being added.

**2. No factory.** The reference puts a `class` with business logic in
`api/v1/factory.mo`. That is a second architecture bolted onto this one. Token
creation is `services/TokenService.mo` behind a thin `api/v1/Token.mo` mixin,
like every other feature here.

**3. No transfer modal.** Phase 3 already ships per-token sends by username. A
launched token appears in the existing wallet list and sends through the existing
form. Better than the reference describes, and free.

**4. A launch must not spend ICPay's cycles.** See below.

---

## Funding: the fee pays for the canister

The reference does `Cycles.add(2_000_000_000_000)` — 2 T out of the calling
canister's balance, per launch. **That is a drain on the wallet holding real user
funds.** The 5 ICP lands in the treasury while the cycles leave
`icp_wallet_backend`. Opposite sides of the ledger. At zero cycles the canister is
**deleted** with every user record in it.

Route through the **Cycles Minting Canister** instead:

```
5 ICP debited once
   └─► revenue subaccount (canister-owned)
          ├─► CMC ─► mints cycles ─► child canister
          └─► TREASURY (separate controller-run sweep)
```

`TREASURY` is a plain principal, so **the canister cannot move money out of it** —
which means no failed launch could ever be auto-refunded from there. Hence the
canister-owned revenue subaccount in the middle.

**The sweep needs an endpoint, or the money is stranded.** 3 ICP per launch
accumulates in a subaccount only this canister can spend from. Without
`sweepRevenue` — controller-only, moves the balance to `TREASURY` — the revenue is
unreachable. It is four lines against an existing transfer path, and it is the
difference between a revenue model and a growing pile nobody can touch.

**One debit, before any canister work.** Charging in two parts creates a state
where the token is live and the second debit failed: a free token and lost
revenue.

### The split: 2 ICP of cycles, 3 ICP of revenue

**Fixed. Not sized from the exchange rate.**

| | |
|---|---|
| Fee debited | 5 ICP |
| → CMC, minted into the child canister | **2 ICP** |
| → net revenue | **3 ICP** (60% margin) |

The earlier design targeted a fixed *cycle* number and solved backwards for the
ICP to spend. That needed a live `get_icp_xdr_conversion_rate` call, clamping
against a glitched rate, and it silently underfunded canisters below ~$5.36 ICP.

Spending a fixed 2 ICP removes all of it: no rate call (**one fewer inter-canister
call per launch**), no clamp, no failure mode. The token gets whatever 2 ICP mints
at that moment, and the creator benefits when ICP is strong rather than the
platform pocketing the difference.

Conservative floor at $2.70/T — **VERIFY against the live rate during the spike**,
the real rate has been closer to $1.35/T, which buys roughly double:

| ICP price | 2 ICP mints | Idle runway |
|---|---|---|
| $10 | ~7.4 T | ~5 years |
| $6 | ~4.4 T | ~3 years |
| $3 | ~2.2 T | ~1.5 years |

Even the worst row beats the old design's best.

**This is what makes the 365-day freezing threshold affordable.** The threshold
*reserves* cycles, it does not add them — a year of reserve is ~1.4 T held back
from the spendable balance. Against a 2 T canister that is almost the whole
balance, so it would freeze nearly on arrival. Against 4.4 T it leaves ~3 T to
burn: **two years live, then a year frozen and recoverable.**

Keep the runway guard: read `Cycles.balance()` and refuse the launch below the
reserve. It is a local read, no inter-canister call.

---

## Call budget: 4 per launch, fixed

The largest waste in the reference design is uploading the wasm on every launch.
It is the **same wasm every time**.

`install_chunked_code` takes a `store_canister` field: chunks live in a canister
you nominate and are referenced by hash. Upload once, ever, at setup. Every launch
then installs from the store without re-sending a byte.

| | Calls |
|---|---|
| **Setup** (controller, once) | `upload_chunk` × N |
| **Per launch** | ledger debit, ledger→CMC, `notify_create_canister`, `install_chunked_code`, `update_settings` |

Four of those five are canister operations; the first is the user's payment. So a
launch costs us ~267 M cycles, about $0.001, against 3 ICP of revenue. Flat,
regardless of wasm size — without the chunk store it would grow with every byte
the wasm gained.

The payment itself adds two more update calls — `icrc1_fee` then
`icrc1_transfer`, both inside `TransferService` — bringing the whole invocation to
~401 M. That path already exists for every send in the wallet and is not new load.
See [`flow.md`](flow.md) for the per-call breakdown.

Three calls are already at their floor:

- **`get_icp_xdr_conversion_rate` is not called.** The fixed 2 ICP allocation
  needs no rate lookup — that is the fifth call, removed.
- **`canister_status` is never called.** It requires being a controller and we
  deliberately are not one. The token page shows `cyclesFunded` from our own
  record instead.
- **`update_settings` cannot be merged into creation.** We must be controller to
  install, so handing off is necessarily a separate, final call.

---

## Reuse, do not rebuild

**`UsernameSaleService.purchase` is the template.** It already solves every
problem a launch fee has: pay-first/grant-second, a non-persisted `pending` lock
around the `await` (deliberately not persisted, so an upgrade landing mid-call
cannot strand a name behind a lock nobody releases), and settlement pinned to the
ICP ledger. A symbol lock needs the same treatment for the same reason.

**`transactionsByUser` is the index precedent.** `getUserTxCount` used to walk
every user's rows to render one page — a correctness cliff. `TokensByUser` ships
in the same commit as the primary map, never a filter over the global list.

**`LedgerService` is already token-agnostic.** `actor(ledgerId)` resolves per
call, so a new ledger is callable the instant its id is known.

**`ReservedUsernameStorage`/`Repository` is the reserved-set shape.** Symbol
reservation is the same problem with a different noun.

**No migration.** Phase 4 adds *new* stable variables, which start empty. M0170
only fires on a field added to an already-persisted record. Do not write one, and
do not re-wire `StampLedgerId.mo` — its header explains why that causes the very
error it was written to fix.

---

## Treasury and fee

`Config.USERNAME_TREASURY` is the real treasury — a plain principal, so proceeds
are spendable without going through this canister. The name is wrong once it takes
token revenue: **rename to `TREASURY`**. Two call sites, both backend
(`Config.mo:29`, `UsernameSaleService.mo:53`), nothing in `frontend/`.
Compile-time only.

**The treasury never appears in frontend code.** `ne1.txt` exports it as a
frontend constant; `token.txt` hardcodes an unrelated account-ID hex
(`f895130e64…`, absent from this repo). A destination in client code is a
destination an attacker can edit. The backend reads it from `Config`; the UI may
*display* it via the existing endpoint but is never authoritative.

Five ICP prices out spam without pricing out a real launch — same as a 4-character
username.

---

## The security decision

Phase 3's allowlist is a security boundary: `actor(id)` on an unvalidated string
lets a caller point the custodian at a canister they wrote, which can return a
forged `#Ok` and write a "you received funds" row into someone else's history.

A launched token is safe at creation — known wasm, known hash. The problem is t+1.
**If the creator is the controller, they can upgrade that ledger into anything**,
including one that lies about every balance.

Scope it honestly: a hostile ledger can only lie about **its own** token. It
cannot move ICP, touch another ledger, or impersonate the custodian — the
custodian calls *it*, never the reverse. Forged history and a scam token wearing a
real symbol. Reputational, not fund loss.

### Resolution: the creator picks, ICPay controls nothing

| Mode | Controllers | Auto-allowlisted | Label |
|---|---|---|---|
| **Immutable** (default) | `[]` | yes | "Immutable — supply fixed, code frozen" |
| **Upgradeable** | `[creator]` | **no** | "Upgradeable — the creator can change the rules" |

Immutable is the only mode where auto-allowlisting is defensible: the code can
never change, so the hash recorded at creation is the code that runs forever —
stronger than any review ICPay could perform.

ICPay is controller only between creation and install, then hands off. **Never a
co-controller**: one compromised key would reach every token ever launched.

### Symbol collisions

Reject any symbol matching a chain-key or allowlisted token (`ICP`, `ckBTC`,
`ckETH`, `ckUSDC`, `ckUSDT`, every SNS symbol). Show the canister ID next to
unverified symbols. Accept that two *launched* tokens may collide — blocking that
needs a global registry and a land rush.

---

## Metadata

| Field | Cap | Rule |
|---|---|---|
| `name` | 20 | required |
| `symbol` | 10 | required, uppercased, `A–Z0–9`, not reserved |
| `description` | 256 | required |
| `logo` | 32 KB | optional, `data:image/png;base64,…` |
| `website` / `telegram` / `twitter` | 200 | optional, **`https://` only** |

Two are security items, not cosmetics.

**`https://`-only is mandatory.** These render as clickable links. Without a
scheme check, `javascript:` is XSS and anything else is phishing. Validate
backend-side — client validation is a UX nicety, not a control.

**The reference's 4 MB image cannot work.** That exceeds the ~2 MB ingress limit,
so it cannot be sent in one call. Its `uploadToCDN()` is a stub against a CDN this
project does not have, called from a static export with no server. Instead:
downscale client-side to a 128×128 PNG data URI, cap 32 KB backend-side. That is
what `icrc1:logo` expects and it renders without a fetch.

Metadata goes in the ICPay record **and** the child ledger's ICRC-1 metadata — the
record is what we list from, the ledger's own metadata is what makes the token
legible to wallets that never heard of ICPay.

---

## Initial buy: field kept, feature is Phase 5

Deferred deliberately:

- Needs **ICRC-2 `approve` + `transfer_from`**, which the backend does not
  implement. The roadmap names it as Phase 5's opening scope.
- A DEX `await` mid-sequence, after money is taken and a canister created. The
  roadmap's own note: "a trap between the approve and the swap can leave an
  approval dangling." A launch that strands 10 ICP is worse than a missing button.
- Phase 5 says **integrate** a DEX, not build one — a phase of work in itself.

`LaunchParams` carries `initialBuyE8s`, validated to reject non-zero with a
"coming with trading" message. The record keeps `var poolId: ?Text` — declared now
so Phase 5 needs no migration. Form shows the field disabled.

**Do not take liquidity ICP before there is a pool to put it in.**

---

## The ledger wasm

Use the **audited reference ICRC-1 ledger wasm**. Do not write a ledger — a
hand-rolled one holding real value is the worst idea available here.

Uploaded in chunks by a controller, held in stable memory, **installed from the
chunk store on every launch without re-uploading**. Record the sha256 and verify
the assembled bytes before the first launch: without it, "we deploy the audited
wasm" is an unverified claim — and every immutable token's safety argument rests
on exactly that claim.

---

## Launch sequence

Each step exists because the one before it can fail.

1. **Validate** — pure, no awaits. Includes `https://` check, 32 KB logo cap,
   reject non-zero `initialBuyE8s`.
2. **Reject reserved symbols.**
3. **Check runway** — `Cycles.balance()`, local. Refuse before taking money.
4. **Take the symbol lock** — non-persisted `Set`, released on every exit.
5. **Debit 5 ICP** once, whole, to the revenue subaccount.
6. **Write the `#pending` row** with the payment block index — before the canister
   call, so a trap leaves evidence.
7. **CMC** — allocation → `notify_create_canister`, ICPay as temporary controller.
8. **`install_chunked_code`** from the store. Supply minted to the creator.
9. **`update_settings`** — hand off (`[]` or `[creator]`) **and set a 365-day
   `freezing_threshold`** in the same call.
10. **Record hash**, mark `#active`, index, allowlist if immutable, unlock.

Steps 5 and 7 are both awaits with money already moved. A failure between them
means the user paid and got nothing — the same exposure `purchaseUsername` has,
handled the same way: `#failed` row keeping the payment block index, and an error
naming that block so a refund is traceable. **Not atomic, and the plan says so
rather than hiding it behind a `try`.**

### Why step 9's threshold matters

Costs nothing — those cycles are reserved, not spent. It decides what happens when
a token is forgotten:

| Cycles | Default (~30d) | With 365d |
|---|---|---|
| Low | frozen, then **deleted** | **a year** frozen, recoverable throughout |
| Zero | wasm and every holder balance wiped, permanently — `controllers = []` means nobody can reinstall | reached far later, with a year of warning |

Frozen is not dead: queries still answer, so balances stay readable and only
transfers reject. Any top-up thaws it with nothing lost — and `notify_top_up`
needs no controller rights, so **any holder can rescue it**, not just the creator.

---

## Modules

```
api/v1/Token.mo               mixin: endpoints, thin, no logic
api/v1/Analytics.mo           mixin: launch counts, platform and per-user
services/TokenService.mo      launch orchestration
services/TokenWasmService.mo  chunk store + hash verification
services/AnalyticsService.mo  counts derived from storage, never incremented
repositories/TokenRepository.mo
storage/TokenStorage.mo
validators/TokenValidator.mo  pure, returns ?Text
models/Token.mo
ledger/Cmc.mo                 narrow — notify_create_canister, notify_top_up
ledger/Management.mo          narrow — upload_chunk, install_chunked_code,
                              update_settings. NOT delete_canister/uninstall_code.
```

Both `ledger/` modules follow `SnsWasm.mo`: declare only what this canister calls.

**Analytics keeps no counter.** `getPlatformStats` and `getMyStats` derive from
`TokenStorage` and the user map — a `var tokenCount` incremented on success is a
second source of truth that drifts the first time a launch fails halfway, and
`Map.size` is already O(1). Nothing to keep in sync, nothing that can disagree.

`totalUsers` reads the **principal-keyed** `users` map, not the username map.
`UserRepository` keeps old handles as aliases, so counting usernames counts a
renamer once per handle they have ever held — and misses every user who never
claimed one.

Storage is keyed by an internal `TokenId`, with a `tokensByLedger` index for
lookup by canister id. The canister id cannot be the key: the `#pending` row is
written before the canister exists, and a trap during install would then orphan a
live canister holding the user's cycles with nothing pointing at it. See
[`flow.md`](flow.md#findings-from-this-pass). `TokensByUser` is keyed by `UserId`,
matching `Transaction.userId`.

Every read is a `query`. Queries are not billed, so the token list, symbol check
and fee lookup cost nothing and can fire as the user types (debounced for latency,
not cost). `launchToken` is the only update call.

Controller-only endpoints gate on `Principal.isController(...)` like
`Ledgers.refreshLedgers`. `listReservedSymbols` is a **shared** call, not a query,
for the reason `Admin.listReservedUsernames` documents: a query is served by one
node without consensus, so a malicious replica could hide entries from an
authorization-relevant list.

---

## Frontend

| Path | What |
|---|---|
| `app/(app)/token/launch/page.tsx` | the form |
| `app/(app)/token/[ledgerId]/` | **already exists** from Phase 3, reused unchanged |
| `components/token/launch-form.tsx` | image, name, symbol, description, socials, disabled initial-buy, cost summary |
| `services/token/launch.ts` | one call, mirroring `services/transfer/transfer.ts` |

Take the **layout** from the SunPump screenshots: square image dropzone beside the
name/symbol column, counters (0/20, 0/20, 0/256), socials under an "Optional"
disclosure, cost summary above submit.

Not the implementation:

- No `window.ic.plug` / `window.walletActor` / `window.factoryActor` — II through
  the existing actor layer.
- No hardcoded treasury. No `alert()` — shadcn/Sonner.
- No raw `<input>` with inline Tailwind. `.agents/rules/ui-components.mdc`
  requires shadcn; icons are `@hugeicons/react`, not lucide.
- Not 8 decimals hardcoded. Phase 3 established per-token decimals, parsed on the
  digit string because float math cannot hold ckETH's 18 places.
- No `uploadToCDN`.

**`services/tokens.ts` needs a merge step.** It discovers tokens from SNS-W plus
the compiled-in chain-key list. SNS-W will never know about an ICPay launch, so
discovery unions with `getMyTokens()`. The only non-obvious frontend change —
getting it wrong means a user launches a token and cannot see it.

### The canister card

On the existing `[ledgerId]` page: canister ID (copyable, linked to the IC
dashboard), controller status, cycles funded at launch, created date. All from the
stored record, so it is a `query` — free, no new endpoint.

**Label it "funded at launch", not "cycles left".** `canister_status` needs
controller rights we deliberately gave up. A frozen number under a "remaining"
label reads as live and goes stale — worse than not showing it.

One line beneath: *"A canister runs on cycles. This one was funded with 2 ICP of
cycles at launch — years of runway. Anyone can top it up, including you."*

The immutable choice needs real copy, not a checkbox: *"Frozen — nobody, including
you, can ever change this token's code or supply"* against *"You keep control and
can upgrade it later. ICPay will not list it for sending."* The second sentence
must not be buried.

New strings land in all **10** locale catalogs (`language/`: de en es fr hi ja ko
pt ru zh); `check.mjs` verifies sync. On-chain data stays English.

---

## Tests

Suite is **25 files** under `backend/testing/{category}/` — not the 24 quoted in
several docs; `upgrade/StampLedgerId.test.mo` arrived with Phase 3 and the count
was never updated. Fix that while adding:

| File | Covers |
|---|---|
| `validators/TokenValidator.test.mo` | field rules; reserved symbols; **`http://` and `javascript:` rejected**; logo over 32 KB; non-zero `initialBuyE8s` |
| `repositories/TokenRepository.test.mo` | create, find by id, find by user, index consistency |
| `services/TokenService.test.mo` | fee is exactly 5 ICP; **allocation is exactly 2 ICP, leaving 3 ICP revenue**; rejected when symbol taken; `#failed` keeps the block index |
| `models/Token.test.mo` | construction, status transitions |
| `services/AnalyticsService.test.mo` | count rises only on `#active`; a `#failed` launch does not count; per-user count matches that user's list; **a renamed user counts once, a user with no handle still counts** |

CMC and management calls cannot run under `moc` in interpreter mode. Prove them on
a local replica during the spike and **say so in the test file** — an untestable
path silently omitted reads as covered.

---

## Order of work

1. **Spike.** First the free check: compare `AccountHelper.toAccountIdentifier`
   against `dfx ledger account-id --of-principal <cmc>
   --subaccount-from-principal <self>`. Pure function, no replica, no cycles — it
   rules out the one silent-failure line in the design. Then the local replica:
   CMC mint → create → install from chunk store → hand off → `icrc1_symbol`.
2. **`Config`** — fee, cycle target, freezing threshold, reserve, `TREASURY`
   rename.
3. **Wasm chunk store + upload endpoints**, controller-only, hash verified.
4. **Storage, model, repository, validator** — `TokensByUser` from commit one.
5. **`TokenService.launch`** + `sweepRevenue`.
6. **`api/v1/Token.mo`** + `main.mo` wiring.
7. **`api/v1/Analytics.mo`** — derived counts, lands after storage exists.
8. **Tests**, same commits as the code.
9. **Frontend** — form, `tokens.ts` merge, canister card, stats, locales.

Steps 2 and 3 change no behaviour and are verifiable alone. Landing them
separately turns step 5 from a two-problem commit into ordinary work.

Backend ships separately and does not deploy on merge. **Deploy the backend before
merging the frontend**, or the UI calls a Candid signature the live canister does
not have.

---

## Done when

A user launches a token with image, description and socials, sends it to another
handle, and both see the correct symbol and decimals — with ICPay controlling
nothing.

Two properties worth demonstrating, because the design rests on them:

- **An immutable token's module hash matches the audited wasm** ICPay recorded at
  creation, verifiable by anyone querying the ledger directly.
- **A launch does not reduce `icp_wallet_backend`'s cycle balance** beyond the
  four calls. Check `dfx canister status` before and after the first mainnet
  launch. If it moved by anything near the child's balance, the CMC path is not
  wired up and launches are being paid for out of the wallet.

## Deferred

- **Initial buy / liquidity** — Phase 5, where ICRC-2 lives. Params and `poolId`
  reserved so it lands as an addition.
- **Reputation gating** instead of a flat fee, once Phase 7 brings identity.
- **`topUpToken` endpoint** — same plumbing as the launch path with a different
  memo. The card states the situation in words today; the button is additive.
- **"Add to Plug Wallet"** — no Plug integration here. The equivalent is the token
  appearing in the user's own list, which step 10 already does.
