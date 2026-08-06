import Types "../types";

module {
  // Written before the canister exists, so ledgerId starts null and is filled the
  // moment the CMC returns one.
  public func new(
    id: Types.TokenId,
    userId: Types.UserId,
    creator: Principal,
    name: Text,
    symbol: Text,
    description: Text,
    logo: ?Text,
    website: ?Text,
    telegram: ?Text,
    twitter: ?Text,
    decimals: Nat8,
    totalSupply: Nat,
    immutable: Bool,
    paymentBlockIndex: Nat64,
    now: Int,
  ): Types.Token {
    {
      id;
      userId;
      creator;
      name;
      symbol;
      description;
      logo;
      website;
      telegram;
      twitter;
      decimals;
      totalSupply;
      immutable;
      paymentBlockIndex;
      createdAt = now;
      var status = #pending;
      var ledgerId = null;
      var moduleHash = null;
      var cyclesFunded = null;
      var poolId = null;
    };
  };

  public func setLedgerId(self: Types.Token, canisterId: Text) {
    self.ledgerId := ?canisterId;
  };

  public func markActive(self: Types.Token, moduleHash: Blob, cyclesFunded: Nat) {
    self.status := #active;
    self.moduleHash := ?moduleHash;
    self.cyclesFunded := ?cyclesFunded;
  };

  // The reason is kept on the row rather than only returned to the caller: a
  // launch that failed after payment is a support case, and the row is what
  // support reads.
  public func markFailed(self: Types.Token, reason: Text) {
    self.status := #failed(reason);
  };
};
