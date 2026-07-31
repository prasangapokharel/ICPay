import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import AccountValidator "../../src/validators/AccountValidator";

let anon = Principal.fromText("2vxsx-fae");
switch (AccountValidator.validatePrincipal(anon)) {
  case (?err) { Debug.print("PASS: reject anonymous principal: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected anonymous") };
};

let validPrincipal = Principal.fromText("aaaaa-aa");
switch (AccountValidator.validatePrincipal(validPrincipal)) {
  case (?err) { assert(false); Debug.print("FAIL: rejected valid principal: " # err) };
  case (null) { Debug.print("PASS: accept valid principal") };
};

switch (AccountValidator.validateAccountId("")) {
  case (?err) { Debug.print("PASS: reject empty account id: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected empty") };
};

switch (AccountValidator.validateAccountId("abc")) {
  case (?err) { Debug.print("PASS: reject short account id (3 chars): " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected short") };
};

let hex64 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
assert(hex64.size() == 64);
switch (AccountValidator.validateAccountId(hex64)) {
  case (?err) { assert(false); Debug.print("FAIL: rejected valid account id: " # err) };
  case (null) { Debug.print("PASS: accept 64-char account id") };
};

Debug.print("ALL ACCOUNT VALIDATOR TESTS PASSED");
