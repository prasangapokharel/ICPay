import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Types "../../src/types";
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
  var socialLinks: [Types.SocialLink] = [];
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

switch (TransferValidator.validateMemo(null)) {
  case (?err) { assert(false); Debug.print("FAIL: rejected absent memo: " # err) };
  case (null) { Debug.print("PASS: accept absent memo") };
};

switch (TransferValidator.validateMemo(?"thanks for the coffee")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected short memo: " # err) };
  case (null) { Debug.print("PASS: accept short memo") };
};

// Exactly at the 32-byte ledger limit -- the boundary must be inclusive.
switch (TransferValidator.validateMemo(?"abcdefghijklmnopqrstuvwxyz123456")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected memo at the limit: " # err) };
  case (null) { Debug.print("PASS: accept memo of exactly 32 bytes") };
};

switch (TransferValidator.validateMemo(?"abcdefghijklmnopqrstuvwxyz1234567")) {
  case (?err) { Debug.print("PASS: reject 33-byte memo: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected 33-byte memo") };
};

// Eight emoji are 8 characters but 32 bytes, and nine exceed the limit while
// still reading as a short message. Counting characters here would let the
// ledger reject the transfer after we had already written the row.
switch (TransferValidator.validateMemo(?"🔥🔥🔥🔥🔥🔥🔥🔥")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected 8 emoji (32 bytes): " # err) };
  case (null) { Debug.print("PASS: accept 8 emoji at exactly 32 bytes") };
};

switch (TransferValidator.validateMemo(?"🔥🔥🔥🔥🔥🔥🔥🔥🔥")) {
  case (?err) { Debug.print("PASS: reject 9 emoji as over the byte limit: " # err) };
  case (null) { assert(false); Debug.print("FAIL: 9 emoji is 36 bytes and must be rejected") };
};

Debug.print("ALL TRANSFER VALIDATOR TESTS PASSED");
