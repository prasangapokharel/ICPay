import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import PrincipalValidator "../../src/validators/PrincipalValidator";

let anon = Principal.fromText("2vxsx-fae");
switch (PrincipalValidator.validate(anon)) {
  case (?err) { Debug.print("PASS: reject anonymous principal: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected anonymous") };
};

let nonce = Principal.fromText("aaaaa-aa");
switch (PrincipalValidator.validate(nonce)) {
  case (?err) { assert(false); Debug.print("FAIL: rejected valid principal: " # err) };
  case (null) { Debug.print("PASS: accept non-anonymous principal") };
};

let user1 = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
switch (PrincipalValidator.validate(user1)) {
  case (?err) { assert(false); Debug.print("FAIL: rejected user principal: " # err) };
  case (null) { Debug.print("PASS: accept user principal") };
};

Debug.print("ALL PRINCIPAL VALIDATOR TESTS PASSED");
