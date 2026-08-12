import Types "types";
import Map "mo:map/Map";
import { nhash } "mo:map/Map";

module {
  // Old types (4 variants only)
  type OldTxType = { #deposit; #fee; #transfer; #withdraw };

  type OldTransaction = {
    id: Text;
    from: Text;
    to: Text;
    amount: Nat;
    fee: Nat;
    txType: OldTxType;
    status: Types.TxStatus;
    createdAt: Int;
    updatedAt: Int;
    blockIndex: ?Nat64;
    memo: ?Text;
    ledgerId: Text;
  };

  type OldTxList = {
    var blockIndex: Nat;
    var blocks: [var [var ?OldTransaction]];
    var elementIndex: Nat;
  };

  type OldTxByUser = Map.Map<Types.UserId, OldTxList>;

  // Migration function
  public func migration(old: {
    var transactions: OldTxList;
    var transactionsByUser: OldTxByUser;
  }): {
    var transactions: Types.TxList;
    var transactionsByUser: Map.Map<Types.UserId, Types.TxList>;
  } {
    {
      var transactions = migrateTxList(old.transactions);
      var transactionsByUser = migrateTxByUser(old.transactionsByUser);
    }
  };

  func migrateTxType(old: OldTxType): Types.TxType {
    switch (old) {
      case (#deposit) #deposit;
      case (#fee) #fee;
      case (#transfer) #transfer;
      case (#withdraw) #withdraw;
    }
  };

  func migrateTx(old: OldTransaction): Types.Transaction {
    {
      id = old.id;
      from = old.from;
      to = old.to;
      amount = old.amount;
      fee = old.fee;
      txType = migrateTxType(old.txType);
      status = old.status;
      createdAt = old.createdAt;
      updatedAt = old.updatedAt;
      blockIndex = old.blockIndex;
      memo = old.memo;
      ledgerId = old.ledgerId;
    }
  };

  func migrateTxList(old: OldTxList): Types.TxList {
    let newBlocks = Array.tabulate<[var ?Types.Transaction]>(
      old.blocks.size(),
      func(i: Nat): [var ?Types.Transaction] {
        let oldBlock = old.blocks[i];
        Array.tabulateVar<?Types.Transaction>(
          oldBlock.size(),
          func(j: Nat): ?Types.Transaction {
            switch (oldBlock[j]) {
              case (?tx) ?migrateTx(tx);
              case null null;
            }
          }
        )
      }
    );

    {
      var blockIndex = old.blockIndex;
      var blocks = Array.thaw(newBlocks);
      var elementIndex = old.elementIndex;
    }
  };

  func migrateTxByUser(old: OldTxByUser): Map.Map<Types.UserId, Types.TxList> {
    let newMap = Map.new<Types.UserId, Types.TxList>();
    for ((userId, txList) in Map.entries(old)) {
      Map.set(newMap, nhash, userId, migrateTxList(txList));
    };
    newMap
  };
}
