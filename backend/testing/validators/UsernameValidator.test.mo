import Debug "mo:core/Debug";
import Config "../../src/config/Config";
import UsernameValidator "../../src/validators/UsernameValidator";

// --- validate(): the paid path, 1-8 chars ---

switch (UsernameValidator.validate("")) {
  case (?err) { Debug.print("PASS: reject empty: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected empty") };
};

let longName = "abcdefghi";
switch (UsernameValidator.validate(longName)) {
  case (?err) { Debug.print("PASS: reject too long (9 chars): " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected too long") };
};

switch (UsernameValidator.validate("abc def")) {
  case (?err) { Debug.print("PASS: reject space: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected space") };
};

switch (UsernameValidator.validate("user@nam")) {
  case (?err) { Debug.print("PASS: reject @ symbol: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected @ symbol") };
};

switch (UsernameValidator.validate("user-nam")) {
  case (?err) { Debug.print("PASS: reject hyphen: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected hyphen") };
};

switch (UsernameValidator.validate("john_doe")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected valid username: " # err) };
  case (null) { Debug.print("PASS: accept underscore") };
};

switch (UsernameValidator.validate("Alice123")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected valid username: " # err) };
  case (null) { Debug.print("PASS: accept mixed case and numbers") };
};

// A one-character handle is the top premium tier, so it must be valid on the
// paid path even though no free claim can reach it.
switch (UsernameValidator.validate("a")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected 1-char premium name: " # err) };
  case (null) { Debug.print("PASS: accept 1 char on the paid path") };
};

switch (UsernameValidator.validate("abcdefgh")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected maximum length: " # err) };
  case (null) { Debug.print("PASS: accept maximum length (8)") };
};

// --- validateFreeClaim(): the signup path, 5-8 chars ---

switch (UsernameValidator.validateFreeClaim("btc")) {
  case (?err) { Debug.print("PASS: free claim rejects 3 chars: " # err) };
  case (null) { assert(false); Debug.print("FAIL: 3 chars must not be free") };
};

switch (UsernameValidator.validateFreeClaim("alex")) {
  case (?err) { Debug.print("PASS: free claim rejects 4 chars: " # err) };
  case (null) { assert(false); Debug.print("FAIL: 4 chars must not be free") };
};

switch (UsernameValidator.validateFreeClaim("alice")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected 5-char free claim: " # err) };
  case (null) { Debug.print("PASS: free claim accepts 5 chars") };
};

switch (UsernameValidator.validateFreeClaim("abcdefgh")) {
  case (?err) { assert(false); Debug.print("FAIL: rejected 8-char free claim: " # err) };
  case (null) { Debug.print("PASS: free claim accepts 8 chars") };
};

switch (UsernameValidator.validateFreeClaim("abcdefghi")) {
  case (?err) { Debug.print("PASS: free claim rejects 9 chars: " # err) };
  case (null) { assert(false); Debug.print("FAIL: 9 chars must be rejected") };
};

// The character rule still applies to a free claim of legal length.
switch (UsernameValidator.validateFreeClaim("ali ce")) {
  case (?err) { Debug.print("PASS: free claim still rejects a space: " # err) };
  case (null) { assert(false); Debug.print("FAIL: space must be rejected") };
};

// --- priceFor(): every tier boundary ---

assert (UsernameValidator.priceFor("a") == Config.PRICE_ULTRA_PREMIUM);
assert (UsernameValidator.priceFor("ab") == Config.PRICE_ULTRA_PREMIUM);
assert (UsernameValidator.priceFor("btc") == Config.PRICE_ULTRA_PREMIUM);
Debug.print("PASS: 1-3 chars price at 10 ICP");

assert (UsernameValidator.priceFor("alex") == Config.PRICE_PREMIUM);
Debug.print("PASS: 4 chars price at 5 ICP");

assert (UsernameValidator.priceFor("alice") == Config.PRICE_STANDARD);
Debug.print("PASS: 5 chars price at 2 ICP");

assert (UsernameValidator.priceFor("alicex") == Config.PRICE_BASIC);
assert (UsernameValidator.priceFor("abcdefgh") == Config.PRICE_BASIC);
Debug.print("PASS: 6-8 chars price at 1 ICP");

// Prices must strictly decrease as the name gets longer, otherwise a buyer
// could pay less for scarcer inventory.
assert (Config.PRICE_ULTRA_PREMIUM > Config.PRICE_PREMIUM);
assert (Config.PRICE_PREMIUM > Config.PRICE_STANDARD);
assert (Config.PRICE_STANDARD > Config.PRICE_BASIC);
Debug.print("PASS: shorter names always cost more");

// --- normalize() ---

assert (UsernameValidator.normalize("ALICE") == "alice");
assert (UsernameValidator.priceFor("ALICE") == UsernameValidator.priceFor("alice"));
Debug.print("PASS: price does not depend on case");

Debug.print("ALL USERNAME VALIDATOR TESTS PASSED");
