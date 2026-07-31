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

  public func getByUser(txs: TxStorage.TxList, userId: Types.UserId, limit: Nat, offset: Nat): [Types.Transaction] {
    let all = List.empty<Types.Transaction>();
    for (tx in txs.values()) {
      if (tx.userId == userId) {
        all.add(tx);
      };
    };
    let result = List.toArray(all);
    let size = result.size();
    if (offset >= size) { [] }
    else {
      let end = if (offset + limit > size) { size } else { offset + limit };
      let sliced = List.empty<Types.Transaction>();
      var i = offset;
      while (i < end) {
        sliced.add(result[i]);
        i += 1;
      };
      List.toArray(sliced);
    };
  };

  public func getUserTxCount(txs: TxStorage.TxList, userId: Types.UserId): Nat {
    var count = 0;
    for (tx in txs.values()) {
      if (tx.userId == userId) { count += 1 };
    };
    count;
  };

  public func getRecentByUser(txs: TxStorage.TxList, userId: Types.UserId, count: Nat): [Types.Transaction] {
    let all = List.empty<Types.Transaction>();
    for (tx in txs.values()) {
      if (tx.userId == userId) {
        all.add(tx);
      };
    };
    let arr = List.toArray(all);
    let size = arr.size();
    if (size <= count) { arr }
    else {
      let sliced = List.empty<Types.Transaction>();
      var i = size - count;
      while (i < size) {
        sliced.add(arr[i]);
        i += 1;
      };
      List.toArray(sliced);
    };
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
