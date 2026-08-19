# Backend structure

Motoko canister with strict layering: **api → services → repositories → storage**.

```
backend/
├── dfx.json
├── canister_ids.json         # mainnet IDs (tracked)
├── mops.toml / mops.lock
├── scripts/
│   ├── run-tests.sh          # primary test runner — CI calls this
│   ├── build-frontend.sh
│   ├── deploy-frontend.sh
│   └── deploy-testnet.sh
├── pkg/                      # shared Motoko library (lowercase paths)
└── src/
    ├── main.mo               # actor entry — wires storage, services, api mixins
    ├── types.mo              # shared types (single file)
    │
    ├── api/v1/               # endpoints — thin, no business logic
    │   ├── Health.mo
    │   ├── Auth.mo
    │   ├── Users.mo
    │   ├── Dashboard.mo
    │   ├── Deposit.mo
    │   ├── Withdraw.mo
    │   ├── Transfer.mo
    │   ├── Transactions.mo
    │   ├── Settings.mo
    │   └── Admin.mo
    │
    ├── services/             # business logic (*Service.mo)
    │   ├── AuthService.mo
    │   ├── UserService.mo
    │   ├── TransferService.mo
    │   ├── LedgerService.mo
    │   └── <domain>/         # sub-modules for large domains
    │       ├── Context.mo
    │       └── <Domain>Service.mo
    │
    ├── repositories/         # data access only (*Repository.mo)
    │   ├── UserRepository.mo
    │   ├── TransactionRepository.mo
    │   └── SettingsRepository.mo
    │
    ├── storage/              # stable memory factories (*Storage.mo)
    │   ├── UserStorage.mo
    │   ├── TransactionStorage.mo
    │   └── SettingsStorage.mo
    │
    ├── ledger/               # ICP / ICRC ledger integration
    │   ├── LedgerClient.mo
    │   ├── Account.mo
    │   ├── Subaccount.mo
    │   ├── Balance.mo
    │   ├── TransferError.mo
    │   └── Types.mo
    │
    ├── validators/           # input validation (*Validator.mo)
    │   ├── PrincipalValidator.mo
    │   ├── AmountValidator.mo
    │   ├── UsernameValidator.mo
    │   └── TransferValidator.mo
    │
    ├── models/               # domain record shapes
    │   ├── User.mo
    │   ├── Transaction.mo
    │   └── Settings.mo
    │
    ├── migrations/           # one-shot upgrade migrations
    │   ├── AddFeatureX.mo
    │   └── StampLedgerId.mo
    │
    ├── config/
    │   └── Config.mo         # fees, treasury, rate limits, constants
    │
    ├── middleware/
    │   └── Auth.mo           # caller resolution, API key bridge
    │
    ├── http/
    │   └── Types.mo          # HTTP-facing types (if using http_outcalls)
    │
    └── utils/                # pure helpers
        ├── Helpers.mo
        ├── UUID.mo
        └── Sha256.mo
```

---

## Tests (mirror `src/`)

```
backend/testing/
├── integration/
│   └── FullFlow.test.mo
├── services/
│   ├── AuthService.test.mo
│   └── TransferService.test.mo
├── repositories/
├── storage/
├── validators/
├── ledger/
└── upgrade/                  # migration persistence tests
    └── Migration.test.mo
```

Run: `bash scripts/run-tests.sh` from `backend/`.

Naming: `<Module>.test.mo`. Baseline should stay green before every deploy.

---

## Layer rules

| Layer | May call | Must not |
|---|---|---|
| `api/v1/` | services, middleware | repositories, storage directly, business rules |
| `services/` | repositories, validators, ledger, utils | skip repository for DB access |
| `repositories/` | storage maps, models | ledger, validators with side effects |
| `storage/` | types only | any business logic |
| `validators/` | pure checks | storage, ledger |
| `ledger/` | external canisters | user storage |

---

## Adding a feature (checklist)

1. **types.mo** — add shared types if needed
2. **storage/FeatureStorage.mo** — `createFeatureMap(): FeatureMap`
3. **repositories/FeatureRepository.mo** — get/save/list
4. **validators/FeatureValidator.mo** — input checks
5. **services/FeatureService.mo** — business logic + `create()` factory
6. **api/v1/Feature.mo** — mixin with `public shared` endpoints
7. **main.mo** — instantiate storage, wire service, include mixin
8. **testing/services/FeatureService.test.mo** — at least one happy path
9. **migrations/** — only if stable type shape changes on upgrade

---

## `main.mo` wiring pattern

```motoko
persistent actor self {
  // Storage: NOT transient — survives upgrades
  let users = UserStorage.createUserMap();

  // Services: transient — rebuilt from storage refs each upgrade
  transient let ledger = LedgerService.create(...);
  transient let transfer = TransferService.create(users, ..., ledger, ...);

  // API mixins
  public let Transfer = TransferApi(transfer, mwConfig);
};
```

Storage maps must **not** be `transient`. Services are cheap to rebuild.

---

## Migrations

One file per schema change. Name: `Add<Thing>.mo` or `Stamp<Field>.mo`.

Pattern:
- Define `Old*` types matching current stable memory
- Transform to new types in `migrate()`
- Chain from the **previous** migration's output shape
- Never re-run an old migration — keep for history only

See `boilerplate/backend/AddFeature.example.mo`.

---

## Shared `pkg/` library

Reusable Motoko utilities with lowercase module paths:

```
backend/pkg/
├── errors/result.mo
├── http/mime.mo
├── http/status.mo
├── principal/caller.mo
├── validate/nat.mo
├── validate/text.mo
├── crypto/hash.mo
├── pagination/pg.mo
└── time/duration.mo
```

Import: `import Result "pkg/errors/result"`.

---

## Boilerplate files

| File | Purpose |
|---|---|
| [boilerplate/backend/main.example.mo](../boilerplate/backend/main.example.mo) | Actor skeleton |
| [boilerplate/backend/FeatureApi.example.mo](../boilerplate/backend/FeatureApi.example.mo) | API mixin |
| [boilerplate/backend/FeatureService.example.mo](../boilerplate/backend/FeatureService.example.mo) | Service module |
| [boilerplate/backend/FeatureRepository.example.mo](../boilerplate/backend/FeatureRepository.example.mo) | Repository |
| [boilerplate/backend/FeatureStorage.example.mo](../boilerplate/backend/FeatureStorage.example.mo) | Storage factory |
| [boilerplate/backend/FeatureValidator.example.mo](../boilerplate/backend/FeatureValidator.example.mo) | Validator |
| [boilerplate/backend/AddFeature.example.mo](../boilerplate/backend/AddFeature.example.mo) | Migration stub |
