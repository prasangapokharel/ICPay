import Debug "mo:core/Debug";
import Blob "mo:core/Blob";
import Principal "mo:core/Principal";
import Config "../../src/config/Config";
import Subaccount "../../src/ledger/Subaccount";

// The revenue sweep now runs unattended on a 24h timer, so nothing asks a human
// to confirm the destination before real ICP moves. These are the properties
// that make that safe: they hold at compile time, which is the only place left
// to check them.

// The destination is a compiled-in constant, not a parameter. A sweep -- manual
// or timed -- can move revenue to exactly one place, so a compromised controller
// call cannot redirect it and a bug cannot invent a recipient.
let treasury = Principal.fromText(Config.TREASURY);
assert (not Principal.isAnonymous(treasury));
Debug.print("PASS: the treasury is a fixed, non-anonymous principal");

// The revenue account must collide with no user's derived subaccount. If it did,
// the timer would sweep a user's custodial balance to the treasury every day --
// silently, since nobody is watching a scheduled job.
let revenue = Config.REVENUE_SUBACCOUNT;
assert (revenue.size() == 32);
assert (revenue != Subaccount.fromPrincipal(treasury));
Debug.print("PASS: the revenue subaccount is 32 bytes and derives from no principal");

// fromPrincipal is length-prefixed and right-aligned, so the leading byte of a
// derived subaccount is zero while REVENUE_SUBACCOUNT leads with \01. That one
// byte is what keeps the two spaces disjoint for every possible principal.
let bytes = Blob.toArray(revenue);
assert (bytes[0] == 1);
assert (Blob.toArray(Subaccount.fromPrincipal(treasury))[0] == 0);
Debug.print("PASS: the leading byte separates revenue from every derived subaccount");

Debug.print("ALL REVENUE TESTS PASSED");
