---
name: icpay-endpoints
description: >-
  Step-by-step workflow to add a new ICPay canister endpoint — types, storage,
  repository, service, API mixin, main.mo wire, IDL, frontend service, and test.
---

# ICPay — Adding an Endpoint

For a **full new feature** (storage, migration, main.mo, frontend), read
[`integration-standard/SKILL.md`](../integration-standard/SKILL.md) first.

Follow this order for a single endpoint. Skipping a layer breaks CI and fund safety.

Related: [`layering/SKILL.md`](../layering/SKILL.md), [`error-handling/SKILL.md`](../error-handling/SKILL.md)

---

## 1. Types (`src/types.mo`)

Add public types the Candid interface exposes:

```motoko
public type MyFeaturePublic = {
  id: Text;
  owner: Principal;
  createdAt: Int;
};
```

If the persisted shape differs from the public DTO, keep both — map in the service.

---

## 2. Storage (`src/storage/`)

Factory for stable structure only:

```motoko
module {
  public type MyMap = Map.Map<Text, Types.MyRecord>;

  public func createMyMap(): MyMap {
    Map.empty<Text, Types.MyRecord>();
  };
};
```

No validation. No `ApiResult`.

---

## 3. Repository (`src/repositories/`)

Data access helpers:

```motoko
module {
  public func find(map: MyMap, id: Text): ?Types.MyRecord { Map.get(map, Text.compare, id) };
  public func insert(map: MyMap, id: Text, row: Types.MyRecord) { Map.add(map, Text.compare, id, row) };
};
```

---

## 4. Validator (`src/validators/`) — if needed

```motoko
public func validateTitle(title: Text): ?Text {
  if (title.size() == 0) { ?"Title is required" };
  if (title.size() > 80) { ?"Title too long" };
  null
};
```

---

## 5. Service (`src/services/`)

Business logic + `Types.ApiResult`:

```motoko
module {
  public type MyService = { items: MyStorage.MyMap; users: UserStorage.UserMap };

  public func create(items: MyStorage.MyMap, users: UserStorage.UserMap): MyService {
    { items; users }
  };

  public func doThing(service: MyService, caller: Principal, id: Text): Types.ApiResult<Types.MyFeaturePublic> {
    switch (requireUser(service, caller)) {
      case (#err(e)) return #err(e);
      case (#ok(_)) {};
    };
    switch (MyValidator.validate(id)) {
      case (?err) return #err(err);
      case (null) {};
    };
    // … repo + #ok result
  };
};
```

Fund paths: always `caller`, never param principal for sender.

---

## 6. API mixin (`src/api/v1/MyFeature.mo`)

```motoko
mixin (svc: MyService.MyService, mwConfig: MiddlewareAuth.Config) {
  public shared ({ caller }) func myEndpoint(id: Text): async Types.ApiResult<Types.MyFeaturePublic> {
    MyService.doThing(svc, MiddlewareAuth.effectiveCaller(mwConfig, caller), id);
  };

  public shared query ({ caller }) func listThings(): async [Types.MyFeaturePublic] {
    MyService.listPublic(svc, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };
};
```

Use `shared query` for read-only free paths.

---

## 7. Wire in `main.mo`

```motoko
import MyStorage "storage/MyStorage";
import MyService "services/MyService";
import MyFeatureApi "api/v1/MyFeature";

persistent actor self {
  let myItems = MyStorage.createMyMap();
  transient let myService = MyService.create(myItems, users);
  let _myFeature = MyFeatureApi(myService, mwConfig);
};
```

If adding a new **stable field** on an existing record → read
[`migration/SKILL.md`](../migration/SKILL.md) first.

---

## 8. Test (`backend/testing/services/` or category folder)

```motoko
// At minimum: one success + one #err path
switch (MyService.doThing(service, caller, "bad")) {
  case (#ok(_)) { assert false };
  case (#err(msg)) { assert msg.size() > 0 };
};
Debug.print("PASS: doThing rejects invalid input");
```

Run: `cd backend && bash scripts/run-tests.sh`

---

## 9. Frontend (if user-facing)

| File | Action |
|---|---|
| `frontend/services/wallet.ts` | Add Candid types to IDL |
| `frontend/services/<domain>/` | Typed call via `call()` / `query()` |
| `frontend/hooks/` | SWR wrapper if list/detail |
| `frontend/language/*/common.json` | i18n keys for new UI strings |

Never create `HttpAgent` outside `services/`.

---

## 10. Deploy

Backend only if canister changed:

```bash
npm run ci backend:deploy
```

Frontend only:

```bash
npm run ci frontend:deploy
```

Record hash before backend deploy: `npm run ci backend:hash`.

---

## Checklist

- [ ] Types in `types.mo`
- [ ] Storage factory (stable if must survive upgrade)
- [ ] Repository CRUD
- [ ] Validator for external input
- [ ] Service with `ApiResult` errors
- [ ] API mixin — thin delegate
- [ ] `main.mo` wired
- [ ] Test added; full suite green
- [ ] Migration if persisted shape changed
- [ ] Frontend IDL + service if exposed to UI
