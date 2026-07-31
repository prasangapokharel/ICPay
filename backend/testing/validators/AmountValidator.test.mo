import Debug "mo:core/Debug";
import AmountValidator "../../src/validators/AmountValidator";

switch (AmountValidator.validate(0)) {
  case (?err) { Debug.print("PASS: reject zero amount: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected zero") };
};

switch (AmountValidator.validate(5_000)) {
  case (?err) { Debug.print("PASS: reject amount below fee: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected below fee") };
};

switch (AmountValidator.validate(10_000)) {
  case (?err) { assert(false); Debug.print("FAIL: rejected amount equal to fee: " # err) };
  case (null) { Debug.print("PASS: accept amount equal to fee") };
};

switch (AmountValidator.validate(100_000_000)) {
  case (?err) { assert(false); Debug.print("FAIL: rejected valid amount: " # err) };
  case (null) { Debug.print("PASS: accept 1 ICP (100M e8s)") };
};

switch (AmountValidator.validateWithFee(0, 10_000)) {
  case (?err) { Debug.print("PASS: reject zero with fee: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected zero with fee") };
};

switch (AmountValidator.validateWithFee(5_000, 10_000)) {
  case (?err) { Debug.print("PASS: reject amount below fee: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected below fee") };
};

switch (AmountValidator.validateWithFee(20_000, 10_000)) {
  case (?err) { assert(false); Debug.print("FAIL: rejected valid amount with fee: " # err) };
  case (null) { Debug.print("PASS: accept amount above fee") };
};

switch (AmountValidator.validate(1_000_000_000_000)) {
  case (?err) { assert(false); Debug.print("FAIL: rejected large amount: " # err) };
  case (null) { Debug.print("PASS: accept large amount (10000 ICP)") };
};

Debug.print("ALL AMOUNT VALIDATOR TESTS PASSED");
