---
name: icpay-backend
description: Motoko canister work in ICPay — the API/Service/Repository/Storage layering, stable-memory upgrade safety, reserved keywords, and how to add an endpoint with tests. Read before editing any .mo file.
---

# ICPay backend — Motoko canister

`backend/src/`, entry point `main.mo`. Deployed as `icp_wallet_backend`
(`6vbhm-nqaaa-aaaan-q6muq-cai`). It custodies real ICP.

## The layering rule

Four layers, and a call may only ever go **downward**:

```
api/v1/        thin handler: takes caller + params, delegates, returns ApiResult
services/      business logic, validation orchestration, ledger calls
repositories/  find / create / update over a storage structure
storage/       the stable data structures themselves
```

An `api/` file must not read storage directly. A `repository` must not call the
ledger. Skipping a layer is the single most common way to break this codebase.

| Layer | Directory | Example files |
|---|---|---|
| API | `backend/src/api/v1/` | `Transfer.mo`, `Users.mo`, `Withdraw.mo` |
| Service | `backend/src/services/` | `TransferService.mo`, `UserService.mo`, `bucket/` (nested) |
| Repository | `backend/src/repositories/` | `UserRepository.mo`, `TransactionRepository.mo` |
| Storage | `backend/src/storage/` | `UserStorage.mo`, `TransactionStorage.mo` |

Supporting, outside the stack: `models/` (record types + their methods),
`validators/` (pure input checks), `ledger/` (ICP ledger client, subaccount
derivation, account-identifier encoding), `config/`, `utils/`, `middleware/`,
`types.mo`.

**Which file do I touch?**

- New endpoint → `api/v1/` + the service it calls + a test.
- Changed business rule → `services/`.
- New query over existing data → `repositories/`.
- New persisted field → `storage/` **and** read the upgrade-safety section below.
- New input rule → `validators/`, as a pure function returning `?Text`.

## Splitting large services

**Target: ~300 lines per file.** When a service module grows past that, split it
into a nested folder under `services/<domain>/`. Do not keep adding to a 1,000+
line monolith — the bucket refactor is the reference pattern.

### When to split

- The file is hard to navigate or review in one pass.
- You can name 3+ distinct concerns (auth, lifecycle, uploads, stats, …).
- New work keeps landing in the same file instead of a focused module.

### Folder layout

```
services/<domain>/
├── Context.mo       service record type + create() factory
├── Auth.mo          auth resolution, path/name validation, status helpers
├── Limits.mo        rate-limit guards (if any)
├── Stats.mo         aggregate stats, pagination, pure helpers
├── Lifecycle.mo     create / get / list / update / delete for the main entity
├── …                domain-specific modules (Upload, Serve, Files, Keys, …)
└── <Domain>Service.mo   thin facade — re-exports the public API only
```

Keep `services/<Domain>Service.mo` as a **backward-compat shim** that re-exports
from `services/<domain>/<Domain>Service.mo` so `main.mo`, `api/v1/`, tests, and
other callers do not need mass import rewrites.

### Module boundaries (bucket example)

| Module | Owns |
|---|---|
| `Context.mo` | `BucketService` record, `UploadSessionStore`, `create()` |
| `Auth.mo` | `requireBucket`, `canRead`/`canWrite`, `resolveReadAuth`/`resolveWriteAuth`, validators |
| `Limits.mo` | `allowManage`, `allowMutate`, `allowUploadChunk` |
| `Stats.mo` | `getCloudStats`, `buildStats`, `paginateFiles` |
| `Lifecycle.mo` | bucket CRUD, renew, pricing quotes |
| `Upload.mo` | single + chunked uploads, session purge |
| `Serve.mo` | download, CDN serve, delete, list, crypto helpers |
| `Files.mo` | metadata, tags, move/copy, bulk ops (delegates to `BucketFileService`) |
| `Keys.mo` | API key wrappers |
| `BucketService.mo` | facade — `public let foo = Foo.foo` for every exported func |

Already-extracted siblings stay at `services/` top level when they are shared or
small: `BillingService`, `ApiKeyService`, `BucketFileService`, `CloudHttpService`.

### Rules while splitting

1. **No circular imports.** If `Files` needs `deleteFile`, import `Serve` — not
   the other way around.
2. **Shared helpers are `public func` in the owning module** (e.g. `Auth.requireBucket`).
3. **Import `mo:core/Map` in any module that calls `.remove` on a map** — without
   it, `NameIndex` looks like a plain record and the compiler errors.
4. **Facade only re-exports; no new logic.** Business rules stay in submodules.
5. **No behavior change** — split is refactor-only. Run the full suite after.

### Verify after a split

```bash
cd backend && bash scripts/run-tests.sh
cd backend && dfx build icp_wallet_backend --check --network ic
```

Pass criteria: all tests green, build check clean. Every existing import of
`services/BucketService` must still compile via the shim.

### Split backlog (prioritized)

Next targets after bucket. Order by size + review pain; each follows the same
facade + shim pattern.

| Priority | File | ~Lines | Risk | Status |
|---|---|---|---|---|
| ~~1~~ | ~~`TokenService.mo`~~ | ~~521~~ → split | High | **Done** — `services/token/` |
| 1 | `SwapService.mo` | 461 | High | Next |
| 2 | `BucketFileService.mo` | 405 | Medium | Could move under `services/bucket/` |
| 3 | `TransferService.mo` | 323 | Medium | Fund path — split only, no logic changes |

#### TokenService → `services/token/` ✅

| Module | Owns |
|---|---|
| `Context.mo` | `TokenService` record, `create()`, `pending` set |
| `Types.mo` | `LedgerInitArgs`, `LedgerArg` |
| `Notify.mo` | `describeNotifyError` (CMC errors) |
| `Launch.mo` | `launch`, `createCanister`, `installLedger`, `ledgerInitArgs`, `handOffControl` |
| `Wasm.mo` | `uploadWasmChunk`, `sealWasm`, `resetWasm`, `isLaunchReady` |
| `Query.mo` | `getToken`, `getById`, `listByUser`, `listActive`, `isSymbolAvailable`, `registerLaunchedLedgers` |
| `Revenue.mo` | `sweepRevenue`, `topUpToken`, `releaseFailedCanister` |
| `Symbols.mo` | `seedReservedSymbols` |
| `TokenService.mo` | facade |

#### SwapService → `services/swap/` (next)

| Module | Owns |
|---|---|
| `Types.mo` | `ICPSwapFactory`, `ICPSwapPool`, `ICRC2Ledger`, `PoolData`, `ICPSwapError` |
| `Context.mo` | `SwapService` record, `create()`, `poolCache` |
| `Pool.mo` | `getPool`, `getPoolFeeBps`, `icpSwapErrorToText` |
| `Quote.mo` | `quote` |
| `Execute.mo` | `swap` (largest block — deposit, approve, swap, withdraw, tx rows) |
| `Pending.mo` | `retryPending`, `getPending` |
| `SwapService.mo` | facade |

**Import order:** `Quote` and `Execute` import `Pool`; `Pending` imports `Execute`
if retry reuses swap steps, otherwise duplicate minimal withdraw recovery only.

#### Per-split workflow

1. Create `services/<domain>/Context.mo` first (types + `create`).
2. Extract one module at a time; run `bash scripts/run-tests.sh` after each.
3. Add facade + shim at `services/<Domain>Service.mo`.
4. Confirm `main.mo` and `api/v1/` still import the shim only.
5. Full verify: tests + `dfx build icp_wallet_backend --check --network ic`.

## Pre-deploy migration checklist

Run this **before every mainnet upgrade** that touches persisted state or types.
Real user funds and bucket data live in the canister — a trapping upgrade is not
recoverable without a prepared rollback.

### 1. Classify the change

| Change type | Migration needed? | Pattern |
|---|---|---|
| New actor field, empty on first upgrade | Usually **no** | Add field + comment in `main.mo` (see bucket/bookmark examples) |
| New field on an **existing** stored record | **Yes** | New module in `migrations/` + one-shot wire |
| Removed / reordered record field | **Yes** | Breaking — migration or rollback |
| Derived index (lookup map) | **No** | `transient` + reindex at startup (`TxRepo.reindex`, `UserRepo.reindexDepositAccounts`) |
| Ephemeral (rate limit reset OK, upload session) | **No** | `transient let` in `main.mo` |
| Service-only / API-only logic | **No** | Deploy after tests pass |

### 2. If migration is required

- [ ] Add `migrations/<Name>.mo` with **old types defined inline** — never import
      live types for fields you are changing.
- [ ] Implement `migration()` that transforms old → new shape.
- [ ] Add test in `backend/testing/upgrade/<Name>.test.mo`.
- [ ] Wire `(with migration = <Name>.migration)` on the actor **once**, deploy,
      then **remove the wire** and mark the file `APPLIED — do NOT re-wire`.
- [ ] Never re-wire `AddBucketFileMeta`, `AddBucketApiKeys`, `StampLedgerId`, etc.
      — they already ran on mainnet; re-wiring traps (M0170).

### 3. Verify before deploy

```bash
cd backend && bash scripts/run-tests.sh          # must be 45/45
cd backend && dfx build icp_wallet_backend --check --network ic
npm run ci backend:hash                          # record live hash for rollback
```

- [ ] All tests green (including any new migration test).
- [ ] Build check clean on `--network ic` (mainnet artifact path).
- [ ] Live module hash recorded; rollback command noted from deploy output.
- [ ] No accidental `transient` on fields that must survive upgrade.
- [ ] No `stable var` / `preupgrade` / `postupgrade` added (project uses persistent actor).
- [ ] Fund paths still use `caller`, not a user-supplied sender principal.
- [ ] Deploy runs through `npm run ci backend:deploy` (tests → build → TTY confirm).

### 4. After deploy

- [ ] Mark migration module APPLIED in its header comment.
- [ ] Remove `(with migration = …)` from `main.mo` if it was a one-shot wire.
- [ ] Confirm canister status / hash matches expected (`npm run ci backend:hash`).
- [ ] Spot-check one read path and one write path on mainnet if the change was risky.

### 5. When upgrade traps

1. Do **not** retry blindly — read replica / dfx error (often M0170 compatibility).
2. Roll back: `npm run ci backend:rollback <commit> <hash>` with the pre-deploy hash.
3. Fix migration or type compatibility locally, re-test, redeploy.

## Custody model

The canister owns one ledger account. Each user gets a **subaccount derived from
their principal** (`ledger/Subaccount.mo`). So a user's "balance" is the ledger
balance of `{ owner = canister; subaccount = fromPrincipal(user) }`.

This is why the caller principal is load-bearing everywhere: it *is* the
account. Never accept a principal as a parameter where the caller should be
used — that would let anyone spend anyone's funds.

## Upgrade safety

State lives in stable structures under `storage/`. On upgrade, anything not
stable is lost.

- Adding a field to a stored record needs a migration, or existing rows fail to
  decode and **the upgrade traps** — see `migrations/`.
- Removing or reordering fields in a stored type is a breaking change.
- Existing rows are not rewritten by a deploy. A fix that changes how a record is
  *written* only affects rows written after it — old rows keep the old shape.

Before deploying, `npm run ci backend:hash` records the live module hash, which
is what makes `backend:rollback` possible.

## Motoko traps that cost real time

**`label` is a reserved keyword.** Using it as a record field name gives
`syntax error [M0001], unexpected token 'label'`, pointing at a column that
looks fine. Other reserved words that read like ordinary field names: `type`,
`object`, `actor`, `query`, `shared`, `switch`, `case`, `func`.

**The canister is named `icp_wallet_backend` in `dfx.json`**, not `icpay_backend`.
Getting this wrong gives `Canister 'X' not found in dfx.json`.

**Async calls cost a consensus round (~2–3s) each.** Do not add a "pre-flight"
balance read before a transfer: the ledger already checks funds and returns the
balance in its `#InsufficientFunds` error, and a pre-read is racy anyway — the
balance can change between the read and the transfer. `TransferService.resolveSender`
has a comment explaining exactly this; do not undo it.

**Every transfer writes two rows.** The sender's `#transfer` row, and the
recipient's `#deposit` row. The deposit variant matters: `syncDeposits` treats
`#deposit` as already credited, so writing the wrong variant double-credits.

## Testing

```bash
cd backend && bash scripts/run-tests.sh
```

**Not** `npm test`, **not** `mops test`. The script compiles each test with `moc`
in interpreter mode. 45 test suites under `backend/testing/{category}/`, covering
config, utils, validators, models, repositories, ledger, services, security, bucket,
and one `integration/FullFlow.test.mo`.

Pass criteria is all 45. Every new endpoint adds a test in the same commit.

Compile without deploying:

```bash
cd backend && dfx build --check icp_wallet_backend
```

## Ledger interfaces

Use only the official ones. `ledger/LedgerClient.mo` speaks ICRC-1 (`icrc1_transfer`)
and the legacy `transfer` for account-identifier destinations. Fee is
`Config.ICP_FEE` — 10_000 e8s. Do not invent a wrapper interface or hardcode a
different fee.

Account identifiers are 64 hex characters; validate the length before decoding
(`Helpers.hexToBlob` assumes well-formed input).

## Deploying

```bash
npm run ci backend:deploy
```

Runs tests, builds, prints the module hash, then asks for a typed `yes` before
touching mainnet. It is never run by CI — automating it would put a key that can
*delete* the canister into a GitHub secret.

## Local Motoko packages (`backend/pkg/`)

Reusable **mo:core-only** modules — import as `../../pkg/<area>/<module>` from `src/`.

| Package | Module | Purpose |
|---|---|---|
| `errors/` | `result.mo` | Generic `#ok` / `#err` combinators |
| `api/` | `response.mo` | Text-error `ApiResult` helpers |
| `access/` | `guard.mo` | Auth + owner guards → `ApiResult` |
| `pagination/` | `pg.mo` | Page slice + clamp page size |
| `uid/` | `id.mo` | Time-based ids + counter suffix |
| `time/` | `duration.mo`, `calendar.mo` | TTL math, ISO dates (`Int` nanos) |
| `crypto/` | `hex.mo`, `hash.mo` | Hex encode/decode, SHA-256 |
| `http/` | `path.mo`, `mime.mo`, `status.mo` | URL/path, MIME, status codes |
| `blob/` | `blob.mo` | join, concat, slice, take |
| `text/` | `utf8.mo`, `search.mo` | UTF-8 byte truncate, case-insensitive search |
| `cache/` | `ttl.mo` | In-memory TTL map |
| `crud/` | `map.mo` | Map get/upsert/remove helpers |
| `rate/` | `window.mo` | Sliding-window rate limit |
| `validate/` | `text.mo`, `nat.mo` | Path/slug/length, amount range checks |
| `principal/` | `caller.mo` | Anonymous deny, owner/allow-list checks |
| `nat/` | `bounds.mo` | clamp, min/max, saturating sub, percent |
| `option/` | `unwrap.mo` | `getOr`, `mapOr`, `?T` → Result |
| `array/` | `page.mo` | chunk count, page offset/count |
| `set/` | `ops.mo` | Text/Principal set ↔ array |
| `cycles/` | `guard.mo` | `Cycles.balance` reserve check (canister runtime only) |
| `async/` | `icp.mo` | ICP async patterns (docs + helpers) |

**Integrated into canister:** `pagination/pg`, `validate/text`, `time/duration` (bucket stats + files).

Smoke test: `testing/pkg/Smoke.test.mo` (compile-only; not in CI yet).
