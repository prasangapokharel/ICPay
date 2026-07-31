import Debug "mo:core/Debug";
import Blob "mo:core/Blob";
import Nat8 "mo:core/Nat8";
import Principal "mo:core/Principal";
import Subaccount "../../src/ledger/Subaccount";

let p1 = Principal.fromText("aaaaa-aa");
let subBlob = Subaccount.fromPrincipal(p1);
let subArr = Blob.toArray(subBlob);
assert (subArr.size() == 32);
Debug.print("PASS: Subaccount.fromPrincipal returns exactly 32 bytes");

// ICRC-1 requires every subaccount to be 32 bytes regardless of principal length.
let p2 = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
let subBlob2 = Subaccount.fromPrincipal(p2);
let subArr2 = Blob.toArray(subBlob2);
assert (subArr2.size() == 32);
assert (subBlob2 != subBlob);
Debug.print("PASS: subaccounts are 32 bytes for principals of differing length");

// The length prefix makes the encoding injective: a short principal padded with
// zeros must not collide with a longer principal ending in zeros.
let raw1 = Blob.toArray(Principal.toBlob(p1));
let raw2 = Blob.toArray(Principal.toBlob(p2));
assert (subArr[31 - raw1.size()] == Nat8.fromNat(raw1.size()));
assert (subArr2[31 - raw2.size()] == Nat8.fromNat(raw2.size()));
Debug.print("PASS: subaccount encodes the principal length as a prefix");

assert (Subaccount.fromPrincipal(p1) == subBlob);
Debug.print("PASS: Subaccount.fromPrincipal is deterministic");

let subArr3 = Subaccount.toArray(subBlob);
assert (subArr3 == subArr);
Debug.print("PASS: Subaccount.toArray returns same bytes as Blob.toArray");

let diffP = Principal.fromText("2vxsx-fae");
let diffSub = Subaccount.fromPrincipal(diffP);
assert (diffSub != subBlob);
assert (diffSub != subBlob2);
Debug.print("PASS: Subaccount.fromPrincipal produces different subaccounts for different principals");

Debug.print("ALL SUBACCOUNT TESTS PASSED");
