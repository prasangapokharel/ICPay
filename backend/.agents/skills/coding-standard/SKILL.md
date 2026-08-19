---
name: icpay-coding-standard
description: >-
  ICPay Motoko coding standards — naming, imports, file size, mo:core patterns,
  layering imports, reserved keywords, and comments. Read before writing or
  reviewing any backend/src/*.mo file.
---

# ICPay — Coding Standard

Project conventions on top of Motoko language rules. When this doc and generic
Motoko advice conflict, **this doc wins for ICPay**.

Language reference: [`skills/motok/writing-motoko/SKILL.md`](../motok/writing-motoko/SKILL.md)  
Architecture: [`skills/layering/SKILL.md`](../layering/SKILL.md)

---

## Stack libraries

| Use | Don't use |
|---|---|
| `mo:core` (2.x) | `mo:base` (deprecated) |
| Contextual dot: `map.get(k)`, `list.add(x)` | Module-first: `Map.get(map, k)` |
| `persistent actor` in `main.mo` | Manual `stable var` serialisation |
| `(with migration = …)` for upgrades | `preupgrade` / `postupgrade` for data |

Import `Map` in any file that calls `.remove` on a map — otherwise the compiler
treats the value as a plain record.

---

## File and module layout

```
backend/src/
├── main.mo              actor entry — wire storage, services, API mixins
├── types.mo             shared public types, ApiResult
├── api/v1/<Name>.mo     mixin — thin endpoints
├── services/<Name>Service.mo   or services/<domain>/*.mo
├── repositories/<Name>Repository.mo
├── storage/<Name>Storage.mo
├── validators/<Name>.mo
├── migrations/<Name>.mo
├── config/Config.mo
├── ledger/
└── utils/
```

| Rule | Limit |
|---|---|
| Max ~**300 lines** per file | Split into `services/<domain>/` folder + facade |
| One module per file | `module { … }` at file scope |
| Facade shim | Keep `services/FooService.mo` re-exporting split modules |

---

## Naming

| Item | Convention | Example |
|---|---|---|
| Module file | `PascalCase.mo` | `TransferService.mo` |
| Service type | `FooService` | `public type TransferService = { … }` |
| Factory | `create` | `public func create(...): TransferService` |
| Service funcs | `camelCase`, first arg `service` | `transferByUsername(service, caller, …)` |
| Storage factory | `createXMap` / `createXList` | `createUserMap()` |
| Repository | verb + entity | `findByPrincipal`, `insert`, `remove` |
| Validator | `validate` / `validateX` | returns `?Text` |
| Types in `types.mo` | `PascalCase` | `UserPublic`, `ApiResult` |
| Variants | `#camelCase` | `#ok`, `#err`, `#deposit` |
| Config constants | `SCREAMING_SNAKE` in Config | `ICP_FEE`, `MAX_TITLE` |
| Migration module | `PascalCase` verb | `AddSocialLinks.mo`, `StampLedgerId.mo` |

Test files: `<Name>.test.mo` under `testing/`.

---

## Imports — order and paths

```motoko
import Array "mo:core/Array";           // 1. mo:core
import Principal "mo:core/Principal";
import Types "../types";                 // 2. project types
import UserRepo "../repositories/UserRepository";
import UserStorage "../storage/UserStorage";
import UsernameValidator "../validators/UsernameValidator";
import Config "../config/Config";
```

| Layer | May import |
|---|---|
| `api/v1/` | services, types, middleware |
| `services/` | repositories, storage, validators, ledger, config |
| `repositories/` | storage, types |
| `storage/` | types, mo:core only |
| `validators/` | config, types — **pure only** |

Never: `api/` → `storage/` directly.

---

## Service module pattern

```motoko
module {
  public type MyService = {
    users: UserStorage.UserMap;
    // fields are storage refs + config, not business state
  };

  public func create(users: UserStorage.UserMap): MyService {
    { users }
  };

  public func doWork(service: MyService, caller: Principal, input: Text): Types.ApiResult<Types.MyPublic> {
    // validate → authorize → repo → #ok
  };
};
```

- **No classes** — use `module` + record service type.
- First parameter after `service` is usually `caller: Principal` for auth paths.
- Return `Types.ApiResult<T>` from public service functions that can fail.

---

## API mixin pattern

```motoko
mixin (svc: MyService.MyService, mwConfig: MiddlewareAuth.Config) {
  public shared ({ caller }) func myMethod(...): async Types.ApiResult<T> {
    MyService.doWork(svc, MiddlewareAuth.effectiveCaller(mwConfig, caller), ...);
  };

  public shared query ({ caller }) func myQuery(...): async T {
    MyService.read(svc, MiddlewareAuth.effectiveCaller(mwConfig, caller), ...);
  };
};
```

- Reads that are free and safe → `shared query`.
- Mutations and fund paths → `shared` (update).
- API files contain **no** validation logic beyond delegating.

---

## Persistent actor — stable vs transient

```motoko
persistent actor self {
  let users = UserStorage.createUserMap();     // persists — never transient
  transient let transfer = TransferService.create(users, ...);  // rebuilt each upgrade
  transient let rateLimits = RateLimitStorage.createRateLimitMap();  // OK to reset
};
```

| Persists | Transient OK |
|---|---|
| Users, balances, transactions, buckets, tokens | Service records |
| Ledger registry, settings | Rate limit counters |
| Live rooms (while feature active) | Upload sessions, caches |

Getting this wrong **silently wipes mainnet data** on upgrade.

---

## Reserved keywords as field names

Never use as record fields: `label`, `type`, `object`, `actor`, `query`,
`shared`, `switch`, `case`, `func`, `module`.

Error looks like `M0001 unexpected token` at a misleading column.

---

## Records and updates

Prefer spread over manual copy:

```motoko
{ user with var displayName = name; var updatedAt = Time.now() }
```

Variant checks:

```motoko
switch (result) {
  case (#ok(v)) { … };
  case (#err(e)) { … };
};
```

Early return for errors — avoid deep nesting:

```motoko
switch (Validator.validate(x)) {
  case (?err) { return #err(err) };
  case (null) {};
};
```

---

## Comments

- Code should be self-explanatory for simple flow.
- **Do** comment non-obvious business rules (custody, permanence, fee policy).
- **Do** comment migration headers (`APPLIED`, why re-wire forbidden).
- **Do** comment why a pre-flight ledger read was **not** added.
- **Don't** restate what the code obviously does.

Example (good):

```motoko
// Username is a payment destination — first claim is permanent.
```

---

## File size — when to split

Split when a service file exceeds ~300 lines:

```
services/swap/
├── Context.mo
├── Pool.mo
├── Quote.mo
├── Execute.mo
├── SwapService.mo   ← facade
services/SwapService.mo  ← shim: public let quote = Quote.quote
```

Rules while splitting:

1. No circular imports.
2. Facade re-exports only — no new logic in shim.
3. Refactor-only split — behaviour unchanged, tests green.

---

## Security coding rules

| Rule | Reason |
|---|---|
| Fund paths use `caller`, not param principal | Prevents spending others' ICP |
| Never store keys, seeds, passwords | II-only auth |
| Official ledger interfaces only | `ledger/LedgerClient.mo` |
| Validate all external input | Via `validators/` |
| No `Debug.trap` for user errors | Return `#err` |
| Cap mainnet call loops ~10–30 | Cycle burn |

---

## Verify before PR

```bash
cd backend && bash scripts/run-tests.sh
cd backend && dfx build icp_wallet_backend --check --network ic
```

---

## Related skills

| Topic | Path |
|---|---|
| Layering | [`skills/layering/SKILL.md`](../layering/SKILL.md) |
| Errors | [`skills/error-handling/SKILL.md`](../error-handling/SKILL.md) |
| Tests | [`skills/testing-standard/SKILL.md`](../testing-standard/SKILL.md) |
| Migrations | [`skills/migration/SKILL.md`](../migration/SKILL.md) |
| Motoko style guide | [`skills/motok/docs/reference/style-guide.md`](../motok/docs/reference/style-guide.md) |
