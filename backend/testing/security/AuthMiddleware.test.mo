import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import MiddlewareAuth "../../src/middleware/Auth";

let alice = Principal.fromText("aaaaa-aa");
let bob = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");

// The replica-supplied caller cannot be forged, so it must always be the
// identity we act on. A bypass here would collapse every user into one account.
let prod = MiddlewareAuth.prodConfig();
assert (MiddlewareAuth.effectiveCaller(prod, alice) == alice);
assert (MiddlewareAuth.effectiveCaller(prod, bob) == bob);
assert (MiddlewareAuth.effectiveCaller(prod, alice) != MiddlewareAuth.effectiveCaller(prod, bob));
Debug.print("PASS: prod config preserves distinct caller identities");

let dev = MiddlewareAuth.devConfig();
assert (MiddlewareAuth.effectiveCaller(dev, alice) == alice);
assert (MiddlewareAuth.effectiveCaller(dev, bob) == bob);
Debug.print("PASS: default dev config never overrides an authenticated caller");

assert (not dev.devMode);
Debug.print("PASS: dev bypass is disabled by default");

// Even with the bypass explicitly enabled it must only affect anonymous callers.
let bypass = { devMode = true; devPrincipal = alice };
assert (MiddlewareAuth.effectiveCaller(bypass, bob) == bob);
assert (MiddlewareAuth.effectiveCaller(bypass, Principal.anonymous()) == alice);
Debug.print("PASS: enabled bypass applies only to anonymous callers");

Debug.print("ALL AUTH MIDDLEWARE TESTS PASSED");
