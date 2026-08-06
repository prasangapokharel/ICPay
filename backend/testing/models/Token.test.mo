import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import TokenModel "../../src/models/Token";

let alice = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
let now = 1000;

let token = TokenModel.new(
  "tok-1", "user-1", alice,
  "My Token", "MTK", "a token", ?"data:image/png;base64,AA",
  ?"https://example.com", null, null,
  8, 1_000_000, false, 42, now,
);

assert (token.status == #pending);
assert (token.ledgerId == null);
assert (token.moduleHash == null);
assert (token.cyclesFunded == null);
// Declared now though Phase 5 fills it: adding a field to an already-persisted
// record triggers M0170 and forces a migration.
assert (token.poolId == null);
Debug.print("PASS: a new token starts pending with nothing assigned");

// Recorded the moment the CMC answers, not at markActive. Without this a trap in
// install leaves a live canister holding the creator's cycles with no row
// pointing at it.
TokenModel.setLedgerId(token, "mxzaz-hqaaa-aaaar-qaada-cai");
assert (token.ledgerId == ?"mxzaz-hqaaa-aaaar-qaada-cai");
assert (token.status == #pending);
Debug.print("PASS: ledgerId is set while still pending");

TokenModel.markFailed(token, "install trapped");
assert (token.status == #failed("install trapped"));
// The canister id survives the failure, which is what makes the difference
// between a retry and a refund decidable.
assert (token.ledgerId == ?"mxzaz-hqaaa-aaaar-qaada-cai");
assert (token.paymentBlockIndex == 42);
Debug.print("PASS: a failed row keeps the canister id and the payment block");

TokenModel.markActive(token, "\de\ad", 4_400_000_000_000);
assert (token.status == #active);
assert (token.moduleHash == ?("\de\ad" : Blob));
assert (token.cyclesFunded == ?4_400_000_000_000);
Debug.print("PASS: markActive records the module hash and what was funded");

Debug.print("ALL TOKEN MODEL TESTS PASSED");
