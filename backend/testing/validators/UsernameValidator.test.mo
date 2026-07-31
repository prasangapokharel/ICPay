import Debug "mo:core/Debug";
import UsernameValidator "../../src/validators/UsernameValidator";

switch (UsernameValidator.validate("ab")) {
  case (?err) { Debug.print("PASS: reject too short: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected too short") };
};

switch (UsernameValidator.validate("a")) {
  case (?err) { Debug.print("PASS: reject single char: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected single char") };
};

let longName = "abcdefghijklmnopqrstuvwxyz1234567";
switch (UsernameValidator.validate(longName)) {
  case (?err) { Debug.print("PASS: reject too long (33 chars): " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected too long") };
};

switch (UsernameValidator.validate("abc def")) {
  case (?err) { Debug.print("PASS: reject space: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected space") };
};

switch (UsernameValidator.validate("user@name")) {
  case (?err) { Debug.print("PASS: reject @ symbol: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected @ symbol") };
};

switch (UsernameValidator.validate("user-name")) {
  case (?err) { Debug.print("PASS: reject hyphen: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected hyphen") };
};

switch (UsernameValidator.validate("john_doe")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected valid username: " # err) };
  case (null) { Debug.print("PASS: accept underscore") };
};

switch (UsernameValidator.validate("alice")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected valid username: " # err) };
  case (null) { Debug.print("PASS: accept lowercase letters") };
};

switch (UsernameValidator.validate("Alice123")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected valid username: " # err) };
  case (null) { Debug.print("PASS: accept mixed case and numbers") };
};

switch (UsernameValidator.validate("a_b_c")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected valid username: " # err) };
  case (null) { Debug.print("PASS: accept multiple underscores") };
};

switch (UsernameValidator.validate("abc")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected minimum length: " # err) };
  case (null) { Debug.print("PASS: accept minimum length (3)") };
};

switch (UsernameValidator.validate("abcdefghijklmnopqrstuvwxyz123456")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected maximum length: " # err) };
  case (null) { Debug.print("PASS: accept maximum length (32)") };
};

Debug.print("ALL USERNAME VALIDATOR TESTS PASSED");
