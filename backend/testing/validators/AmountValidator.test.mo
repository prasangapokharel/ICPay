import Debug "mo:core/Debug";
import AmountValidator "../../src/validators/AmountValidator";

// Phase 3: validation no longer compares against a fee constant. The ledger
// charges its fee on top of the amount, not out of it, so there is no minimum
// transfer size -- and "below the ICP fee" is now a legitimate amount. Fees
// vary per ICRC-1 ledger, so the ledger itself is the only authority on
// insufficient funds (#InsufficientFunds). The validator only guards the one
// case a ledger would never accept: a zero amount.

switch (AmountValidator.validate(0)) {
  case (?err) { Debug.print("PASS: reject zero amount: " # err) };
  case (null) { assert(false); Debug.print("FAIL: should have rejected zero") };
};

// Below the old ICP 10_000 e8 fee -- now a valid amount.
switch (AmountValidator.validate(5_000)) {
  case (?err) { assert(false); Debug.print("FAIL: rejected 5_000 (below ICP fee, but valid): " # err) };
  case (null) { Debug.print("PASS: accept 5_000 e8s (below ICP fee is no longer rejected)") };
};

// Exactly the old ICP fee -- valid.
switch (AmountValidator.validate(10_000)) {
  case (?err) { assert(false); Debug.print("FAIL: rejected amount equal to fee: " # err) };
  case (null) { Debug.print("PASS: accept 10_000 (equal to ICP fee)") };
};

switch (AmountValidator.validate(100_000_000)) {
  case (?err) { assert(false); Debug.print("FAIL: rejected valid amount: " # err) };
  case (null) { Debug.print("PASS: accept 1 ICP (100M e8s)") };
};

// A tiny ckBTC amount (satoshi-grained) that no ICP fee constant could cover.
switch (AmountValidator.validate(1)) {
  case (?err) { assert(false); Debug.print("FAIL: rejected 1 (valid on ckBTC scale): " # err) };
  case (null) { Debug.print("PASS: accept 1 (ckBTC satoshi)") };
};

switch (AmountValidator.validate(1_000_000_000_000)) {
  case (?err) { assert(false); Debug.print("FAIL: rejected large amount: " # err) };
  case (null) { Debug.print("PASS: accept large amount (10000 ICP)") };
};

Debug.print("ALL AMOUNT VALIDATOR TESTS PASSED");
