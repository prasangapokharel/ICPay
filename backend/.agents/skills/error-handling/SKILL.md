---
name: icpay-error-handling
description: >-
  ICPay Motoko error handling — ApiResult, validators, early returns, ledger
  errors, traps vs results, and message conventions. Read before writing any
  service or API endpoint.
---

# ICPay — Error Handling

Every user-facing failure is a **`#err : Text`** inside **`Types.ApiResult<T>`**.
Expected failures never trap. Traps are for programmer bugs and unrecoverable
invariants only.

---

## Type system

Defined in `backend/src/types.mo`:

```motoko
public type ApiResult<T> = {
  #ok: T;
  #err: Text;
};
```

Shared helpers in `backend/pkg/api/response.mo`:

```motoko
import Response "../../pkg/api/response";

Response.ok(value)
Response.err("Message")
Response.require(condition, "Message")
Response.guard(condition, "Message", value)
Response.mapOk(result, f)
Response.flatten(nested)
```

Access guards in `backend/pkg/access/guard.mo`:

```motoko
Guard.requireAuth(caller)   // rejects anonymous
Guard.requireOwner(caller, owner)
```

---

## Layer responsibilities

```
API (api/v1/)     → pass through ApiResult; no business rules
Service           → validate, authorize, return #err or #ok
Repository        → data access only; no ApiResult (returns ?T or ())
Validator         → pure func … : ?Text  (Some msg = invalid)
Storage           → no validation, no errors to callers
```

| Layer | Returns | Must not |
|---|---|---|
| `api/v1/*.mo` | `async Types.ApiResult<T>` | Read storage, trap on bad input |
| `services/*.mo` | `Types.ApiResult<T>` or `async Types.ApiResult<T>` | Skip validators for user input |
| `validators/*.mo` | `?Text` | Call ledger or storage |
| `repositories/*.mo` | `?Record`, `Bool`, `()` | Return `#err` (not its job) |

---

## API pattern — thin mixin

```motoko
mixin (live: LiveService.LiveService, mwConfig: MiddlewareAuth.Config) {
  public shared ({ caller }) func joinLiveRoom(
    roomId: Text,
    tabId: Text,
    inviteToken: ?Text,
  ): async Types.ApiResult<Types.LiveRoomPublic> {
    LiveService.joinRoom(
      live,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      roomId,
      tabId,
      inviteToken,
    );
  };
};
```

Rules:

- API resolves `caller` via `MiddlewareAuth.effectiveCaller` — never trust a
  user-supplied principal for fund paths.
- API does not wrap service results — service already returns `ApiResult`.
- Queries that cannot fail use plain return types; still use `shared query` when
  read-only.

---

## Service pattern — early return

```motoko
public func transferByUsername(...): async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
  if (not RateLimitService.allow(...)) {
    return #err(RateLimitService.message(Config.RATE_TRANSFER));
  };
  switch (AmountValidator.validate(amount)) {
    case (?err) { return #err(err) };
    case (null) {};
  };
  switch (resolveSender(service, caller)) {
    case (#err(e)) { return #err(e) };
    case (#ok(sender)) {
      // continue
    };
  };
  switch (UserRepo.findByUsername(service.users, username)) {
    case (null) { #err("Username not found: @" # username) };
    case (?user) { /* transfer */ };
  };
};
```

### Rules

| Rule | Example |
|---|---|
| Fail fast with `return #err(...)` | Before any ledger call |
| Validators return `?Text` | `case (?err) { return #err(err) }` |
| Chain auth with `switch` | `requireUser`, `requireOwner` |
| Ledger failures → descriptive `#err` | `"Transfer failed: " # TransferError.describe(e)` |
| Never `Debug.trap` for user input | `"Invalid amount"` not trap |
| Fund paths use `caller`, not param principal | Prevents spending others' funds |

---

## Validator pattern

Validators live in `backend/src/validators/`. Pure functions only:

```motoko
module {
  public func validate(amount: Nat): ?Text {
    if (amount == 0) { return ?"Amount must be greater than zero" };
    if (amount > Config.MAX_TRANSFER) { return ?"Amount exceeds maximum" };
    null
  };
};
```

| Return | Meaning |
|---|---|
| `null` | Valid |
| `?Text` | Invalid — message shown to user |

Do not throw, trap, or return `ApiResult` from validators.

---

## Internal helpers — sync ApiResult

Private service functions may return `ApiResult` for composition:

```motoko
func resolveSender(service: TransferService, caller: Principal): Types.ApiResult<{ ... }> {
  switch (UserRepo.findByPrincipal(service.users, caller)) {
    case (null) { #err("User not found") };
    case (?user) {
      #ok({ userId = user.id; source = ...; senderName = ... });
    };
  };
};
```

Caller checks:

```motoko
switch (resolveSender(service, caller)) {
  case (#err(e)) { return #err(e) };
  case (#ok(sender)) { /* use sender */ };
};
```

---

## Ledger and inter-canister errors

Map ledger variants to text — never leak raw blobs:

```motoko
switch (await LedgerClient.transfer(...)) {
  case (#ok(blockIndex)) { #ok(blockIndex) };
  case (#err(#InsufficientFunds { balance })) {
    #err("Insufficient balance");
  };
  case (#err(e)) {
    #err("Transfer failed: " # TransferError.describe(e));
  };
};
```

**Do not** add a pre-flight balance read before transfer — racy and wastes an
async round (~2s + cycles). The ledger returns balance in `#InsufficientFunds`.

---

## Rate limiting

```motoko
if (not RateLimitService.allow(service.rateLimits, caller, Config.RATE_TRANSFER)) {
  return #err(RateLimitService.message(Config.RATE_TRANSFER));
};
```

Rate-limit maps are `transient` — reset on upgrade is acceptable.

---

## Traps — when allowed

| OK to trap | Not OK |
|---|---|
| `assert false` in tests | Invalid username from user |
| Unreachable `switch` arm after validation | Insufficient funds |
| Programmer invariant (`Debug.trap("impossible")`) | Room not found |
| Migration bug during upgrade (aborts upgrade) | Duplicate username |

Motoko `try/catch` around traps is rare in this codebase — prefer `Result` types.

---

## Message conventions

| Do | Don't |
|---|---|
| `"Username not found: @alice"` | `"Error 404"` |
| `"Amount must be greater than zero"` | `"invalid"` |
| `"Not in this room"` | `"fail"` |
| `"Transfer failed: " # describe(e)` | Raw variant debug print |
| Stable messages (frontend may match) | Changing text without frontend update |

Keep messages short, user-facing, no stack traces, no internal ids unless useful.

---

## Frontend contract

TypeScript unwraps in `frontend/services/client.ts`:

```typescript
export type Outcome<T> = { ok: T } | { err: string }
export function unwrap<T>(outcome: Outcome<T>): T {
  if ("err" in outcome) throw new Error(outcome.err)
  return outcome.ok
}
```

Candid maps `#ok` / `#err` to variant. Frontend shows `Error.message` to users.

---

## Query vs update errors

| Call type | Cost | Errors |
|---|---|---|
| `shared query` | Free | Same `ApiResult` shape when auth needed |
| `shared` (update) | Cycles | Same — never trap for validation |

Live signaling: `postLiveSignal` is update; validation failures return `#err`,
not trap.

---

## Checklist for new endpoints

- [ ] Service returns `Types.ApiResult<T>` for all failure paths
- [ ] Input validated via `validators/` (`?Text`)
- [ ] Auth via `caller` + `requireUser` / `requireOwner`
- [ ] Rate limit if mutating user action
- [ ] Ledger errors mapped with `TransferError.describe`
- [ ] API mixin only delegates — no extra logic
- [ ] Test covers at least one `#err` path in `backend/testing/`

---

## Related skills

| Topic | Path |
|---|---|
| Layering | [`skills/layering/SKILL.md`](../layering/SKILL.md) |
| Adding endpoints | [`skills/endpoints/SKILL.md`](../endpoints/SKILL.md) |
| Testing | [`skills/motok/testing-motok/SKILL.md`](../motok/testing-motok/SKILL.md) |
| Cycles (query vs update) | [`skills/motok/cycles-and-cost/SKILL.md`](../motok/cycles-and-cost/SKILL.md) |

---

## Motoko compiler pitfalls (icCommunity lessons)

These are **compile-time** failures, not runtime `ApiResult` errors. They blocked
`icCommunity` until fixed. Copy the **correct** patterns into new modules.

### 1. Variant tags cannot be Motoko keywords

`public` and `private` are keywords. Using them as variant constructors breaks
`types.mo` before any service runs.

```motoko
// WRONG — syntax error [M0001] unexpected token 'public' / 'private'
public type CommunityVisibility = { #public; #private };

// CORRECT — match Live naming; document UI mapping in API readme
public type CommunityVisibility = { #open; #inviteOnly };
```

| UI label | Motoko tag | Notes |
|---|---|---|
| Public / listed | `#open` | Same as `LiveVisibility.#open` |
| Private / invite-only | `#inviteOnly` | Same as live rooms |

Frontend can still say “Public” / “Private” in i18n — only the Candid variant name
must avoid keywords.

---

### 2. `Map.toArray` + `Array.filter` on entries

`Map.toArray` returns `[(K, V)]`. Passing a filter that expects `(K, V)` into
APIs that expect plain arrays causes **M0098** subtyping errors.

```motoko
// WRONG
let all = Map.toArray(channels);
let publicOnly = Array.filter(all, func((_, ch): (Text, CommunityChannel): Bool {
  ch.visibility == #open
});

// CORRECT — iterate entries (LiveRepository pattern)
let openList = List.empty<CommunityChannel>();
for ((_, ch) in Map.entries(channels)) {
  if (ch.visibility == #open) { List.add(openList, ch) };
};
let all = List.toArray(openList);
```

---

### 3. `Array.mapFilter` does not exist in `mo:core`

**M0072** `field mapFilter does not exist in module`.

```motoko
// WRONG
let channels = Array.mapFilter<Text, CommunityChannelPublic>(ids, func(id) {
  switch (get(channels, id)) {
    case (?ch) ?toPublic(ch);
    case (null) null;
  };
});

// CORRECT — List accumulate
let buf = List.empty<CommunityChannelPublic>();
for (id in ids.vals()) {
  switch (get(channels, id)) {
    case (?ch) List.add(buf, toPublic(ch));
    case (null) {};
  };
};
#ok(List.toArray(buf))
```

Note: `mo:base` had `filterMap`; `mo:core` uses different names — do not assume
parity without checking.

---

### 4. `Array.contains` signature

**M0096** — `Array.contains` is not `(array, item, Text.equal)`.

```motoko
// WRONG
if (not Array.contains<Text>(existing, channelId, Text.equal)) { ... }

// CORRECT — small loop or find
func containsChannelId(ids: [Text], channelId: Text): Bool {
  for (id in ids.vals()) {
    if (id == channelId) { return true };
  };
  false;
};
```

---

### 5. `Map.remove` in `switch` — Null vs `()` (M0050)

Switching on `Map.remove` and mixing `Bool` / `()` branch types, or using
`case null { false }` as a statement branch, triggers **M0050** (`Null` expected
`()`).

```motoko
// WRONG — often fails to compile
switch (Map.remove(members, Text.compare, key)) {
  case null { false };
  case (?_) { ... true };
};

// CORRECT — check membership first; ignore remove return
if (not isMember(members, channelId, principal)) {
  return false;
};
Map.remove(members, Text.compare, memberKey(channelId, principal));
// update index...
true
```

Prefer **early `return false`** in repository helpers over clever switch-on-remove.

---

### 6. `switch` branch bodies must agree on type

If one branch returns `Bool` and an inner `switch` ends with `case (null) { () }`,
the outer expression type may become `()` and fail.

```motoko
// WRONG — inner switch returns (), confuses outer Bool
case (?_) {
  switch (Map.get(index, ...)) {
    case (?ids) { ... };
    case (null) { () };
  };
  true;
};

// CORRECT — empty statement branch
case (null) {};
```

Use `case (null) {}` or `case (null) { () }` only when the whole `switch` is a
**statement** (not returning a value from the function).

---

### 7. `Nat` subtraction trap warnings (M0155)

`a - b` on `Nat` traps when `b > a`. The compiler warns even inside `if (a > b)`
because it does not always narrow types.

```motoko
// WRONG — M0155 even with a guard
memberCount = if (channel.memberCount > 1) { channel.memberCount - 1 } else { 1 };
let start = if (size > cap) { size - cap } else { 0 };

// CORRECT — pkg/nat/bounds.saturatingSub (already in repo)
import NatBounds "../../pkg/nat/bounds";

memberCount = Nat.max(1, NatBounds.saturatingSub(channel.memberCount, 1));
let start = if (size > cap) { NatBounds.saturatingSub(size, cap) } else { 0 };
let count = NatBounds.saturatingSub(size, start);
```

Rule: **never use `Nat - Nat` on user-facing or derived counts** — use
`saturatingSub` from `pkg/nat/bounds.mo`, or prove with `Nat.sub` only after an
explicit `if (a >= b)` branch that the compiler accepts.

---

### 8. Async service calls in tests

Paid join paths use `async Types.ApiResult` + `await TransferService`. Unit tests
must `await` them (top-level `await` is OK in `moc -r` tests).

```motoko
// WRONG — compile error or wrong sync typing
switch (IcCommunityService.joinChannel(svc, guest, channelId, null)) { ... };

// CORRECT
switch (await IcCommunityService.joinChannel(svc, guest, channelId, null)) { ... };
```

Free-only tests can stay sync; anything that calls the ledger must be `async`.

---

### Quick compile-error lookup

| Error | Usual cause | Fix |
|---|---|---|
| M0001 `unexpected token 'public'` | Keyword variant tag | `#open`, `#inviteOnly` |
| M0098 `cannot apply Array.filter` | Wrong map/array shape | `Map.entries` + `List` |
| M0072 `mapFilter does not exist` | Assumed base API | `List` loop or manual filter |
| M0096 `Array.contains` | Wrong arity / args | Loop or `Array.find` |
| M0050 `Null` expected `()` | `Map.remove` switch | Check membership first |
| M0155 `operator may trap` | `Nat - Nat` without proof | `NatBounds.saturatingSub` from `pkg/nat/bounds.mo` |

When a new module fails to compile, grep this table and
[`icCommunity`](../../src/services/IcCommunityService.mo) / 
[`IcCommunityRepository.mo`](../../src/repositories/IcCommunityRepository.mo)
for working references.
