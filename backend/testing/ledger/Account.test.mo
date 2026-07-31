import Debug "mo:core/Debug";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import AccountHelper "../../src/ledger/Account";

let canister = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
let alice = Principal.fromText("aaaaa-aa");
let bob = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");

let defaultAcc = AccountHelper.defaultAccount(alice);
assert (defaultAcc.owner == alice);
assert (defaultAcc.subaccount == null);
Debug.print("PASS: defaultAccount has null subaccount");

// The canister must own every deposit account, otherwise it can never move the
// deposited funds on the user's behalf.
let aliceDeposit = AccountHelper.custodialAccount(canister, alice);
assert (aliceDeposit.owner == canister);
assert (aliceDeposit.owner != alice);
assert (aliceDeposit.subaccount != null);
Debug.print("PASS: custodialAccount is owned by the canister, not the user");

let bobDeposit = AccountHelper.custodialAccount(canister, bob);
assert (bobDeposit.owner == aliceDeposit.owner);
assert (bobDeposit.subaccount != aliceDeposit.subaccount);
Debug.print("PASS: different users get distinct subaccounts under one owner");

let aliceAgain = AccountHelper.custodialAccount(canister, alice);
assert (aliceAgain.subaccount == aliceDeposit.subaccount);
Debug.print("PASS: custodialAccount is deterministic for the same user");

let defaultText = AccountHelper.toText(defaultAcc);
assert (defaultText == Principal.toText(alice));
Debug.print("PASS: toText for default account returns principal text");

let subText = AccountHelper.toText(aliceDeposit);
assert (Text.contains(subText, #text(Principal.toText(canister) # "?subaccount=")));
Debug.print("PASS: toText for subaccount includes subaccount parameter");

let aliceId = AccountHelper.toAccountIdentifier(aliceDeposit);
let bobId = AccountHelper.toAccountIdentifier(bobDeposit);
assert (aliceId.size() == 64);
assert (bobId.size() == 64);
assert (aliceId != bobId);
Debug.print("PASS: account identifiers are 64 hex chars and unique per user");

assert (AccountHelper.toAccountIdentifier(aliceDeposit) == aliceId);
Debug.print("PASS: account identifier is stable across calls");

assert (AccountHelper.toHex("\00\0f\a0\ff") == "000fa0ff");
Debug.print("PASS: toHex encodes bytes as lowercase hex");

Debug.print("ALL ACCOUNT TESTS PASSED");
