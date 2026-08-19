---
name: icpay-testing-standard
description: >-
  ICPay backend test standards — where tests live, how to run them, naming,
  required coverage, migration tests, and CI gate. Read before adding or
  changing any test under backend/testing/.
---

# ICPay — Testing Standard

Every backend change that touches logic must include or update tests. CI runs
`bash scripts/run-tests.sh` — **all suites must pass** before merge.

Language mechanics: [`skills/motok/testing-motok/SKILL.md`](../motok/testing-motok/SKILL.md)

---

## Runner (only this one)

```bash
cd backend && bash scripts/run-tests.sh
```

| Do | Don't |
|---|---|
| `bash scripts/run-tests.sh` | `npm test` |
| Check **Passed: N** count | Assume exit 0 with zero tests |
| `moc -r testing/...` for one file | `mops test` (looks in wrong folder) |

Add new suites to `scripts/run-tests.sh` — an unlisted file is never run in CI.

---

## File layout

```
backend/testing/
├── config/
├── utils/
├── validators/       ← mirror src/validators/
├── models/
├── storage/
├── repositories/     ← mirror src/repositories/
├── services/           ← mirror src/services/
├── security/
├── upgrade/            ← one test per migrations/*.mo
├── integration/
├── bucket/             ← slow e2e — some manual only
├── dsa/                ← perf / correctness benches
└── pkg/                ← compile smoke (optional CI)
```

| Source | Test path |
|---|---|
| `src/services/LiveService.mo` | `testing/services/LiveService.test.mo` |
| `src/migrations/AddSocialLinks.mo` | `testing/upgrade/AddSocialLinks.test.mo` |
| `src/validators/Amount.mo` | `testing/validators/AmountValidator.test.mo` |

Naming: `<Module>.test.mo` or `<Feature>.test.mo` — always suffix `.test.mo`.

---

## Test file anatomy

Tests are **Motoko scripts** run with `moc -r`, not a framework with `describe/it`.

```motoko
import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import UserStorage "../../src/storage/UserStorage";
import LiveService "../../src/services/LiveService";

// 1. Build in-memory storage (same factories as main.mo)
let users = UserStorage.createUserMap();
let svc = LiveService.create(users, ...);

// 2. Fixture principals — use distinct host vs guest
let host = Principal.fromText("aaaaa-aa");
let guest = Principal.fromText("2vxsx-fae");

// 3. Exercise + assert
switch (LiveService.createRoom(svc, host, "Title", #open, null)) {
  case (#ok(r)) {
    assert r.roomId.size() > 0;
    Debug.print("PASS: create public room");
  };
  case (#err(e)) { assert false; Debug.print("FAIL: " # e) };
};

Debug.print("ALL LIVE SERVICE TESTS PASSED");
```

### Rules

| Rule | Detail |
|---|---|
| Always `assert` on values | Not just "no trap" |
| `Debug.print("PASS: …")` | Human-readable in CI log |
| `assert false; Debug.print("FAIL: …")` | On unexpected branch |
| End with summary line | `"ALL … TESTS PASSED"` |
| Two principals minimum | When testing transfers, rooms, ownership |
| Import from `../../src/` | Relative paths in test tree |

---

## Required coverage per feature

Every new **service** or **validator** needs:

| Case | Example |
|---|---|
| Happy path | Valid input → `#ok` / expected value |
| Invalid input | Empty, too long, zero amount |
| Boundary | Max length, min amount, empty list |
| Unauthorized | Wrong caller, anonymous principal |
| Duplicate / conflict | Second claim, double join |
| Not found | Missing id, unknown username |

Fund paths: test that **caller A cannot move caller B's funds**.

---

## `#err` path tests

Mirror success tests — expected failures must be asserted:

```motoko
switch (AuthService.login(auth, anon)) {
  case (#ok(_)) { assert false; Debug.print("FAIL: should reject anonymous") };
  case (#err(msg)) {
    assert msg.size() > 0;
    Debug.print("PASS: anonymous rejected: " # msg);
  };
};
```

Never delete or weaken a failing test to make a change pass.

---

## Migration tests (mandatory for new migrations)

Location: `testing/upgrade/<MigrationName>.test.mo`

```motoko
import AddSocialLinks "../../src/migrations/AddSocialLinks";

// Build old-shape data using migration's Old* types
let result = AddSocialLinks.migration({ users = oldMap });

// Assert new fields / defaults on every migrated row
assert result.users.size() == expectedCount;
Debug.print("PASS: socialLinks defaults to empty");
```

Wire the suite in `run-tests.sh` under `--- Upgrade / Migration Tests ---`.

No migration ships without a passing upgrade test.

---

## Multi-party tests

Use **at least two principals** when behaviour involves another user:

```motoko
let host = Principal.fromText("aaaaa-aa");
let guest = Principal.fromText("2vxsx-fae");
```

Single-principal tests miss bugs like missing recipient transaction rows or
guest seeing host-only actions.

---

## Upgrade persistence (manual, for risky storage changes)

Interpreter tests cannot fully simulate canister upgrade. For storage layout
changes, also verify manually on a local replica:

```bash
dfx deploy
dfx canister call … # create data
dfx deploy          # upgrade
dfx canister call … # data must still exist
```

Rule: domain maps/lists are **not** `transient`. Only rate limits, service
records, caches, timer ids may reset on upgrade.

---

## Slow / manual tests

Some suites are **intentionally excluded** from the fast runner:

| Test | Run manually |
|---|---|
| `bucket/HttpMime.test.mo` | Full CDN MIME matrix (72 extensions) |
| `bucket/Flow.test.mo`, `HttpServe.test.mo` | Bucket e2e |
| `dsa/*/Perf.test.mo` | Performance benches |
| `swap/MainnetSwap.test.mo` | Real mainnet — see `swap/MAINNET-TEST-GATE.md` |

Fast coverage alternative: `validators/FileValidator.test.mo` for MIME at upload.

Document in test header if excluded from `run-tests.sh`.

---

## Adding a new test — checklist

- [ ] File under correct `testing/<category>/`
- [ ] Named `*.test.mo`
- [ ] Entry added to `scripts/run-tests.sh`
- [ ] Happy + at least one failure path
- [ ] Two principals if multi-user
- [ ] `bash scripts/run-tests.sh` — full suite green
- [ ] Migration test if new `migrations/*.mo`

---

## CI and cost

- CI job `backend` runs the full script on every PR to `main` / `dev`.
- Cap loops at **10–30 iterations** in tests — no unbounded mainnet call loops.
- Log discipline: `bash scripts/run-tests.sh 2>&1 | tail -25` — use
  `${PIPESTATUS[0]}` for real exit code.

---

## Related skills

| Topic | Path |
|---|---|
| Migration tests | [`skills/migration/SKILL.md`](../migration/SKILL.md) |
| Error `#err` paths | [`skills/error-handling/SKILL.md`](../error-handling/SKILL.md) |
| New endpoint + test | [`skills/endpoints/SKILL.md`](../endpoints/SKILL.md) |
| Motoko test patterns | [`skills/motok/testing-motok/SKILL.md`](../motok/testing-motok/SKILL.md) |
