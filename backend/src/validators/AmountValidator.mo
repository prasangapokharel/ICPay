module {
  // The ledger charges its fee on top of the amount, not out of it, so there is
  // no minimum transfer size. Comparing against a fee constant here was both
  // wrong and the last thing tying validation to ICP -- other ICRC-1 ledgers
  // have entirely different fee scales. Sufficient funds are the ledger's call:
  // it reports the balance back in #InsufficientFunds.
  public func validate(amount: Nat): ?Text {
    if (amount == 0) {
      return ?("Amount must be greater than 0");
    };
    null;
  };
};
