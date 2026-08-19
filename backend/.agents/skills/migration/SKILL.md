---
name: icpay-migration
description: >-
  ICPay canister upgrade migrations — when to migrate, how to write
  migrations/ modules, wire main.mo once, test, mark APPLIED, and never
  re-wire. Read before changing any persisted record type or stable field.
---

# ICPay — Stable Memory Migrations

ICPay uses a **persistent actor** (`persistent actor self` in `main.mo`). State
lives in stable maps/lists under `storage/`. Upgrades must not trap — real user
funds and bucket data are on mainnet.

**Language mechanics:** [`skills/motok/migrating-motoko/SKILL.md`](../motok/migrating-motoko/SKILL.md)  
**Deploy checklist:** [`.claude/skills/icpay-backend/SKILL.md`](../../../../.claude/skills/icpay-backend/SKILL.md#pre-deploy-migration-checklist)

---

## Decision table

| Change | Migration? | Pattern |
|---|---|---|
| New **actor-level** stable map (nothing persisted yet) | **No** | Add `let x = Storage.create…()` + comment in `main.mo` |
| New field on an **existing stored record** | **Yes** | `migrations/<Name>.mo` + one-shot wire |
| `let` → `var` on stored record | **Usually yes** | Old type must match what mainnet has |
| Derived index (`transactionsByUser`, deposit lookup) | **Often no** | Return empty from migration; `reindex()` at startup |
| Ephemeral (rate limits, upload sessions) | **No** | `transient let` in `main.mo` |
| Service/API-only logic | **No** | Tests + deploy |

If Motoko reports **M0170** (incompatible upgrade), you need an explicit
migration or a rollback — do not retry blindly.

---

## Folder and naming

```
backend/src/migrations/
├── AddSocialLinks.mo      # one module per upgrade event
├── AddBucketFileMeta.mo
├── StampLedgerId.mo
└── readme                 # pointer to enhanced-motoko docs
```

| Rule | Detail |
|---|---|
| File name | `PascalCase` verb phrase: `Add<Field>.mo`, `Stamp<Field>.mo` |
| Export | `public func migration(old: OldShape) : NewShape` |
| Old types | Defined **inline** in the migration module — never import live `Types.User` as the *input* shape for a field you are changing |
| Header comment | What changed, wire instructions, **APPLIED** status after mainnet |
| Tests | `backend/testing/upgrade/<Name>.test.mo` |

---

## Syntax — wire once on the actor

Attach immediately before `persistent actor`:

```motoko
import AddSocialLinks "migrations/AddSocialLinks";

(with migration = AddSocialLinks.migration)
persistent actor self {
  let users = UserStorage.createUserMap();
  // ...
};
```

### One-shot rule (critical)

1. Wire `(with migration = …)` for **one** mainnet deploy that needs it.
2. After deploy succeeds, **remove the wire** from `main.mo`.
3. Mark the module `APPLIED — do NOT re-wire` in its header.

Re-wiring an applied migration traps (M0170): the live canister already has the
new shape; the migration's `Old*` type no longer matches.

**Never re-wire:** `StampLedgerId`, `AddBucketApiKeys`, `AddBucketFileMeta`, etc.

---

## Migration function shape

```motoko
module {
  // Input: exact serialised shape BEFORE this deploy
  public type OldUser = {
    id: Types.UserId;
    principal: Principal;
    var username: ?Types.Username;
    // … every field that existed on mainnet, nothing more
  };

  public func migration(
    old: { users: Map.Map<Principal, OldUser> }
  ): { users: Map.Map<Principal, Types.User> } {
    let out = Map.empty<Principal, Types.User>();
    for ((p, u) in old.users.entries()) {
      out.add(p, {
        id = u.id;
        principal = u.principal;
        var username = u.username;
        var socialLinks : [Types.SocialLink] = []; // new field default
        createdAt = u.createdAt;
        var updatedAt = u.updatedAt;
      });
    };
    { users = out }
  };
};
```

### Rules

| Rule | Why |
|---|---|
| Only name stable fields the migration transforms | Unnamed stable vars are carried through automatically |
| Use persistable types only | No functions, no mutable arrays in migration records |
| `var` vs `let` on old type must match **mainnet**, not wishful thinking | M0170 if wrong |
| New fields get explicit defaults in the output record | No implicit defaults on upgrade |
| Shared references: migrate **one** canonical store | See `StampLedgerId` — do not map derived indexes separately |

---

## Derived indexes — StampLedgerId pattern

When adding a field to rows referenced by an index map:

```motoko
// Migrate the canonical list
transactions = List.map(old.transactions, func(tx) { /* stamp ledgerId */ });

// Return index EMPTY — rebuild at startup
transactionsByUser = Map.empty();
```

Then in `main.mo` after upgrade:

```motoko
TxRepo.reindex(transactions, transactionsByUser);
```

Mapping the index separately creates **duplicate row objects** — status updates
would only touch one copy.

---

## Implicit migration (no module)

Compatible changes need no `(with migration = …)`:

- New stable actor field (empty on first upgrade)
- Add variant constructor
- Widen type (`Nat` → `Int`)
- Remove actor field (data dropped)

Document in `main.mo` with a comment:

```motoko
// New stable variable — no migration needed, starts empty on first upgrade.
let tokens = TokenStorage.createTokenMap();
```

---

## What NOT to use

| Forbidden | Use instead |
|---|---|
| `preupgrade` / `postupgrade` for data | `(with migration = …)` on persistent actor |
| `stable var` manual serialisation | Persistent actor + stable structures |
| Re-importing current `Types.X` as `OldX` when `X` gained a field | Inline `OldX` without the new field |
| Running migration on every deploy | One-shot wire, then APPLIED |

---

## Test template

`backend/testing/upgrade/AddSocialLinks.test.mo` pattern:

```motoko
import Debug "mo:core/Debug";
import Map "mo:core/Map";
import AddSocialLinks "../../src/migrations/AddSocialLinks";

// 1. Build oldStore with Old* records
// 2. let result = AddSocialLinks.migration({ users = oldMap });
// 3. assert new fields on migrated rows
// 4. Debug.print("PASS: …");
```

Run: `cd backend && bash scripts/run-tests.sh`

---

## Deploy workflow

**Deploy workflow** and post-migration `main.mo` cleanup are in
[`../integration-standard/SKILL.md`](../integration-standard/SKILL.md#phase-11--deploy).

```bash
cd backend && bash scripts/run-tests.sh          # all green
cd backend && dfx build icp_wallet_backend --check --network ic
npm run ci backend:hash                          # record hash for rollback
npm run ci backend:deploy                        # TTY confirm on mainnet
```

After deploy:

1. Mark migration **APPLIED** in module header.
2. Remove `(with migration = …)` from `main.mo`.
3. Confirm hash: `npm run ci backend:hash`.

If upgrade traps → `npm run ci backend:rollback <commit> <hash>`.

---

## Checklist (copy before every state change)

- [ ] Classified: implicit vs explicit migration
- [ ] Old types inline; match mainnet serialisation exactly
- [ ] Derived indexes handled (empty + reindex, or mapped with shared refs)
- [ ] Test in `testing/upgrade/`
- [ ] One-shot wire planned; re-wire forbidden after APPLIED
- [ ] No `transient` on data that must survive upgrade
- [ ] Full test suite + `--network ic` build check

---

## Reference modules in this repo

| Module | What it did |
|---|---|
| `StampLedgerId.mo` | Added `ledgerId` to transactions; empty `transactionsByUser` |
| `AddBucketFileMeta.mo` | Extended `StoredFile`; `var visibility` on bucket |
| `AddSocialLinks.mo` | Added `socialLinks: []` default on users |
| `AddBucketApiKeys.mo` | Bucket API key storage shape |
| `AddSwapTxTypes.mo` | Swap transaction variants |
