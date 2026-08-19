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
