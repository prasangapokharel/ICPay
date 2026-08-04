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
| Service | `backend/src/services/` | `TransferService.mo`, `LedgerService.mo`, `UserService.mo` |
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
in interpreter mode. 24 test files under `backend/testing/{category}/`, covering
config, utils, validators, models, repositories, ledger, services, security, and
one `integration/FullFlow.test.mo`.

Pass criteria is all 24. Every new endpoint adds a test in the same commit.

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
