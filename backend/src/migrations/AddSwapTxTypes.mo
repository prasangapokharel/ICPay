import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Types "../types";

// Widens TxType from {#deposit;#fee;#transfer;#withdraw} to include #swapOut
// and #swapIn. The live canister already has socialLinks on every User record
// (applied by AddSocialLinks on the previous deploy), so this migration chains
// from the post-AddSocialLinks shape. AddSocialLinks.mo is kept for history --
// it must NOT be re-wired.
module {
  // TxType as it exists in stable memory right now -- no swap variants yet.
  public type OldTxType = {
    #deposit;
    #fee;
    #transfer;
    #withdraw;
  };

  // Transaction exactly as stored right now (same fields, old TxType).
  public type OldTransaction = {
    id: Types.TxId;
    userId: Types.UserId;
    txType: OldTxType;
    ledgerId: Text;
    amount: Nat;
    fee: Nat;
    from: Text;
    to: Text;
    var status: Types.TxStatus;
    var blockIndex: ?Nat64;
    memo: ?Text;
    createdAt: Int;
    var updatedAt: Int;
  };

  public type OldTxList = List.List<OldTransaction>;
  public type OldTxByUser = Map.Map<Types.UserId, OldTxList>;

  // User is already in the current shape (socialLinks present) -- no change needed.
  public func migration(
    old: {
      transactions: OldTxList;
      transactionsByUser: OldTxByUser;
    }
  ): {
    transactions: List.List<Types.Transaction>;
    transactionsByUser: Map.Map<Types.UserId, List.List<Types.Transaction>>;
  } {
    // Convert each OldTransaction to Transaction (widen OldTxType -> TxType).
    // The new variants are additive: no row ever has #swapOut/#swapIn yet.
    func convert(old: OldTransaction): Types.Transaction {
      let newType: Types.TxType = switch (old.txType) {
        case (#deposit) { #deposit };
        case (#fee)     { #fee };
        case (#transfer){ #transfer };
        case (#withdraw){ #withdraw };
      };
      {
        id          = old.id;
        userId      = old.userId;
        txType      = newType;
        ledgerId    = old.ledgerId;
        amount      = old.amount;
        fee         = old.fee;
        from        = old.from;
        to          = old.to;
        var status  = old.status;
        var blockIndex = old.blockIndex;
        memo        = old.memo;
        createdAt   = old.createdAt;
        var updatedAt = old.updatedAt;
      };
    };

    // Rebuild the global list.
    let newTxs = List.empty<Types.Transaction>();
    for (tx in old.transactions.values()) {
      newTxs.add(convert(tx));
    };

    // Rebuild the per-user index using the same converted objects so that
    // in-place mutations (complete/fail) are visible through both.
    let newByUser = Map.empty<Types.UserId, List.List<Types.Transaction>>();
    for (tx in newTxs.values()) {
      switch (newByUser.get(tx.userId)) {
        case (?list) { list.add(tx) };
        case (null) {
          let list = List.empty<Types.Transaction>();
          list.add(tx);
          newByUser.add(tx.userId, list);
        };
      };
    };

    { transactions = newTxs; transactionsByUser = newByUser };
  };
};
