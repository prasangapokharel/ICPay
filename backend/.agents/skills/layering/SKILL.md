---
name: icpay-layering
description: >-
  ICPay backend architecture — API → Service → Repository → Storage flow,
  file placement rules, and what each layer may import. Read before creating
  or moving any .mo module.
---

# ICPay — Layering

Strict four-layer stack. Calls go **downward only**.

```
api/v1/  →  services/  →  repositories/  →  storage/
```

Violating this is the most common way to break the canister.

Full project guide: [`.claude/skills/icpay-backend/SKILL.md`](../../../../.claude/skills/icpay-backend/SKILL.md)

---

## Layer map

| Layer | Path | Does | Does not |
|---|---|---|---|
| **API** | `src/api/v1/` | Candid endpoints, `caller` → service | Business logic, storage reads |
| **Service** | `src/services/` | Rules, validation orchestration, ledger | Direct map mutation without repo |
| **Repository** | `src/repositories/` | CRUD queries over storage types | Ledger calls, `#err` messages |
| **Storage** | `src/storage/` | Stable map/list factories + types | Validation, auth |

Supporting (not in stack):

| Path | Role |
|---|---|
| `models/` | Record helpers tied to domain types |
| `validators/` | Pure input checks → `?Text` |
| `ledger/` | ICP ledger client, subaccounts |
| `config/` | Fees, ids, constants |
| `types.mo` | Shared public types, `ApiResult` |
| `middleware/` | Auth config, effective caller |
| `migrations/` | One-shot upgrade transforms |
| `utils/` | Pure helpers |

---

## Entry wiring — main.mo

```motoko
persistent actor self {
  let users = UserStorage.createUserMap();        // storage: stable
  transient let userService = UserService.create(users, ...);  // rebuilt each upgrade

  // Mixins attach API to actor
  let _users = UsersApi(users, userService, mwConfig);
};
```

- **Storage** `let` bindings are stable (not `transient`).
- **Services** are `transient let` — cheap records of references.
- **API** modules are mixins applied to the actor.

---

## Which file to touch

| Task | Files |
|---|---|
| New public endpoint | `api/v1/X.mo`, `services/XService.mo`, test |
| Change business rule | `services/` only |
| New query over data | `repositories/` |
| New persisted field | `storage/`, `types.mo`, often `migrations/` |
| New input rule | `validators/` |
| Ledger integration | `services/` calling `ledger/LedgerClient.mo` |

---

## Service split (>~300 lines)

Large services split into `services/<domain>/`:

```
services/bucket/
├── Context.mo      # service record + create()
├── Auth.mo         # guards
├── Lifecycle.mo    # CRUD
├── BucketService.mo  # facade re-exports
└── …
```

Keep `services/BucketService.mo` as shim re-exporting the facade so `main.mo`
imports stay stable.

---

## Import rules

```motoko
// API may import:
import XService "../../services/XService";
import Types "../../types";
import MiddlewareAuth "../../middleware/Auth";

// Service may import:
import XRepo "../repositories/XRepository";
import XStorage "../storage/XStorage";
import XValidator "../validators/X";

// Repository may import:
import XStorage "../storage/XStorage";
import Types "../types";

// Storage may import:
import Types "../types";
// mo:core collections only
```

**Never:** `api/` → `storage/` directly. **Never:** `repository/` → `ledger/`.

---

## Custody rule

User ICP sits in subaccounts derived from **`caller`** principal. Fund-moving
endpoints must use `MiddlewareAuth.effectiveCaller(mwConfig, caller)` — never
a user-supplied `Principal` as the sender.

---

## Verify after structural change

```bash
cd backend && bash scripts/run-tests.sh
cd backend && dfx build icp_wallet_backend --check --network ic
```
