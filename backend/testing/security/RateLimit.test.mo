import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import RateLimitStorage "../../src/storage/RateLimitStorage";
import RateLimitService "../../src/services/RateLimitService";

let alice = Principal.fromText("aaaaa-aa");
let bob = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");

// Time is passed in rather than read, so a window can be advanced without
// waiting on a real clock.
let second = 1_000_000_000;
let policy = { maxPerWindow = 3; windowSeconds = 60 };
let t0 = 1_700_000_000 * second;

let limits = RateLimitStorage.createRateLimitMap();

assert (RateLimitService.allow(limits, alice, policy, t0));
assert (RateLimitService.allow(limits, alice, policy, t0 + second));
assert (RateLimitService.allow(limits, alice, policy, t0 + 2 * second));
Debug.print("PASS: calls up to the cap are allowed");

assert (not RateLimitService.allow(limits, alice, policy, t0 + 3 * second));
assert (not RateLimitService.allow(limits, alice, policy, t0 + 4 * second));
Debug.print("PASS: the call past the cap is refused, and stays refused");

// One busy caller must not spend another's budget -- the window is per
// principal, so this is the check that the key is actually load-bearing.
assert (RateLimitService.allow(limits, bob, policy, t0 + 4 * second));
Debug.print("PASS: a second principal has its own window");

// At exactly windowSeconds the window is stale, not still open: the comparison
// is >=, so a caller is never held for longer than the advertised window.
assert (RateLimitService.allow(limits, alice, policy, t0 + 60 * second));
assert (RateLimitService.allow(limits, alice, policy, t0 + 61 * second));
assert (RateLimitService.allow(limits, alice, policy, t0 + 62 * second));
assert (not RateLimitService.allow(limits, alice, policy, t0 + 63 * second));
Debug.print("PASS: the window resets on expiry and the cap applies again");

// A one-per-window policy is the launchToken shape, where a single attempt is
// the whole budget.
let single = { maxPerWindow = 1; windowSeconds = 3600 };
let launches = RateLimitStorage.createRateLimitMap();
assert (RateLimitService.allow(launches, alice, single, t0));
assert (not RateLimitService.allow(launches, alice, single, t0 + 3599 * second));
assert (RateLimitService.allow(launches, alice, single, t0 + 3600 * second));
Debug.print("PASS: a one-per-window policy admits exactly one call per window");

Debug.print("ALL RATE LIMIT TESTS PASSED");
