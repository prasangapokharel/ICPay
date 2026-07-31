import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import TransferValidator "../../src/validators/TransferValidator";

let userPrincipal = Principal.fromText("aaaaa-aa");

switch (TransferValidator.validateDestination("")) {
  case (?err) { Debug.print("PASS: reject empty destination: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected empty destination") };
};

switch (TransferValidator.validateDestination("some-account-id-here")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected valid destination: " # err) };
  case (null) { Debug.print("PASS: accept valid destination") };
};

switch (TransferValidator.validateUsernameTransfer("")) {
  case (?err) { Debug.print("PASS: reject empty username: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected empty username") };
};

let tooLongName = "abcdefghijklmnopqrstuvwxyz1234567";
switch (TransferValidator.validateUsernameTransfer(tooLongName)) {
  case (?err) { Debug.print("PASS: reject long username (33 chars): " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected long username") };
};

switch (TransferValidator.validateUsernameTransfer("alice")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected valid username: " # err) };
  case (null) { Debug.print("PASS: accept valid username transfer") };
};

let fakeUser = {
  id = "test-id";
  principal = userPrincipal;
  var username = ?"testuser";
  var displayName = "Test";
  createdAt = 0 : Int;
  var updatedAt = 0 : Int;
};

switch (TransferValidator.validateSelfTransfer(userPrincipal, fakeUser)) {
  case (?err) { Debug.print("PASS: reject self-transfer: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected self-transfer") };
};

let otherPrincipal = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
switch (TransferValidator.validateSelfTransfer(otherPrincipal, fakeUser)) {
  case (?err) { assert(false); Debug.print("FAIL: rejected valid transfer: " # err) };
  case (null) { Debug.print("PASS: accept transfer to different user") };
};

Debug.print("ALL TRANSFER VALIDATOR TESTS PASSED");
