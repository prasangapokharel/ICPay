import List "mo:core/List";
import Types "../types";
import TxModel "../models/Transaction";
import TxStorage "../storage/TransactionStorage";

module {
  public func create(
    txs: TxStorage.TxList,
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
    let tx = TxModel.new(id, userId, txType, amount, fee, from, to, memo, now);
    txs.add(tx);
    tx;
  };

  public func getById(txs: TxStorage.TxList, id: Types.TxId): ?Types.Transaction {
    txs.find(func(tx) { tx.id == id });
  };

  // Walks newest-first and stops as soon as the page is filled, so the cost is
  // bounded by (offset + limit) matches rather than by the whole list.
  public func getByUser(txs: TxStorage.TxList, userId: Types.UserId, limit: Nat, offset: Nat): [Types.Transaction] {
    let page = List.empty<Types.Transaction>();
    var seen = 0;
    label scan for (tx in txs.reverseValues()) {
      if (tx.userId == userId) {
        if (seen >= offset) {
          page.add(tx);
          if (page.size() >= limit) { break scan };
        };
        seen += 1;
      };
    };
    List.toArray(page);
  };

  public func getUserTxCount(txs: TxStorage.TxList, userId: Types.UserId): Nat {
    var count = 0;
    for (tx in txs.values()) {
      if (tx.userId == userId) { count += 1 };
    };
    count;
  };

    public func getRecentByUser(txs: TxStorage.TxList, userId: Types.UserId, count: Nat): [Types.Transaction] {
    let recent = List.empty<Types.Transaction>();
    label scan for (tx in txs.reverseValues()) {
      if (tx.userId == userId) {
        recent.add(tx);
        if (recent.size() >= count) { break scan };
      };
    };
    List.toArray(recent);
  };

  public func completeTx(txs: TxStorage.TxList, id: Types.TxId, blockIndex: Nat64, now: Int): Bool {
    switch (txs.find(func(tx) { tx.id == id })) {
      case (?tx) { tx.complete(blockIndex, now); true };
      case (null) { false };
    };
  };

  public func failTx(txs: TxStorage.TxList, id: Types.TxId, now: Int): Bool {
    switch (txs.find(func(tx) { tx.id == id })) {
      case (?tx) { tx.fail(now); true };
      case (null) { false };
    };
  };

  public func getUserDeposits(txs: TxStorage.TxList, userId: Types.UserId): [Types.Transaction] {
    let result = List.empty<Types.Transaction>();
    for (tx in txs.values()) {
      if (tx.userId == userId and tx.txType == #deposit) {
        result.add(tx);
      };
    };
    List.toArray(result);
  };

  public func getUserWithdrawals(txs: TxStorage.TxList, userId: Types.UserId): [Types.Transaction] {
    let result = List.empty<Types.Transaction>();
    for (tx in txs.values()) {
      if (tx.userId == userId and tx.txType == #withdraw) {
        result.add(tx);
      };
    };
    List.toArray(result);
  };

  public func getUserTransfers(txs: TxStorage.TxList, userId: Types.UserId): [Types.Transaction] {
    let result = List.empty<Types.Transaction>();
    for (tx in txs.values()) {
      if (tx.userId == userId and tx.txType == #transfer) {
        result.add(tx);
      };
    };
    List.toArray(result);
  };

  // The three getTotal* helpers below each walk the whole list. Callers needing
  // more than one (the dashboard needs all three) should use this single pass.
  public func getUserTotals(txs: TxStorage.TxList, userId: Types.UserId): { deposits: Nat; withdrawals: Nat; transfers: Nat } {
    var deposits = 0;
    var withdrawals = 0;
    var transfers = 0;
    for (tx in txs.values()) {
      if (tx.userId == userId and tx.status == #completed) {
        switch (tx.txType) {
          case (#deposit) { deposits += tx.amount };
          case (#withdraw) { withdrawals += tx.amount };
          case (#transfer) { transfers += 1 };
          case (#fee) {};
        };
      };
    };
    { deposits; withdrawals; transfers };
  };

  public func getTotalDepositAmount(txs: TxStorage.TxList, userId: Types.UserId): Nat {
    var total = 0;
    for (tx in txs.values()) {
      if (tx.userId == userId and tx.txType == #deposit and tx.status == #completed) {
        total += tx.amount;
      };
    };
    total;
  };

  public func getTotalWithdrawalAmount(txs: TxStorage.TxList, userId: Types.UserId): Nat {
    var total = 0;
    for (tx in txs.values()) {
      if (tx.userId == userId and tx.txType == #withdraw and tx.status == #completed) {
        total += tx.amount;
      };
    };
    total;
  };

  public func getTotalTransferCount(txs: TxStorage.TxList, userId: Types.UserId): Nat {
    var count = 0;
    for (tx in txs.values()) {
      if (tx.userId == userId and tx.txType == #transfer and tx.status == #completed) {
        count += 1;
      };
    };
    count;
  };
};
