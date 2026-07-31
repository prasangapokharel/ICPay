import Types "../types";

module {
  public func new(
    id: Types.TxId,
    userId: Types.UserId,
    txType: Types.TxType,
    amount: Nat,
    fee: Nat,
    from: Text,
    to: Text,
    memo: ?Text,
    now: Int,
  ): Types.Transaction {
    {
      id;
      userId;
      txType;
      amount;
      fee;
      from;
      to;
      var status = #pending;
      var blockIndex = null;
      memo;
      createdAt = now;
      var updatedAt = now;
    };
  };

  public func complete(self: Types.Transaction, blockIdx: Nat64, now: Int) {
    self.status := #completed;
    self.blockIndex := ?blockIdx;
    self.updatedAt := now;
  };

  public func fail(self: Types.Transaction, now: Int) {
    self.status := #failed;
    self.updatedAt := now;
  };

  public func cancel(self: Types.Transaction, now: Int) {
    self.status := #cancelled;
    self.updatedAt := now;
  };
};
