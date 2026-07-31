import Config "../config/Config";

module {
  public func validate(amount: Nat): ?Text {
    if (amount == 0) {
      return ?("Amount must be greater than 0");
    };
    if (amount < Config.ICP_FEE) {
      return ?("Amount must cover the transfer fee (" # debug_show Config.ICP_FEE # " e8s)");
    };
    null;
  };

  public func validateWithFee(amount: Nat, fee: Nat): ?Text {
    if (amount == 0) {
      return ?("Amount must be greater than 0");
    };
    if (amount <= fee) {
      return ?("Amount must exceed the transfer fee");
    };
    null;
  };
};
