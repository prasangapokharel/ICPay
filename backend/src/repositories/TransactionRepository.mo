import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Types "../types";
import TxModel "../models/Transaction";
import TxStorage "../storage/TransactionStorage";

module {
  // Appends to the global log and to the user's own list. Both hold the same
  // object, so later in-place mutations (complete/fail) are seen through either.
  public func create(
    txs: TxStorage.TxList,
    byUser: TxStorage.TxByUser,
    id: Types.TxId,
    userId: Types.UserId,
    txType: Types.TxType,
    ledgerId: Text,
    amount: Nat,
    fee: Nat,
    from: Text,
    to: Text,
    memo: ?Text,
    now: Int,
  ): Types.Transaction {
    let tx = TxModel.new(id, userId, txType, ledgerId, amount, fee, from, to, memo, now);
    txs.add(tx);
    userTxs(byUser, userId).add(tx);
    tx;
  };

  // The index is empty on the upgrade that introduces it, and stays empty for
  // any user whose transactions predate it, so it is rebuilt once from the
  // global log rather than assumed to be populated.
  public func reindex(txs: TxStorage.TxList, byUser: TxStorage.TxByUser) {
    byUser.clear();
    for (tx in txs.values()) {
      userTxs(byUser, tx.userId).add(tx);
    };
  };

  func userTxs(byUser: TxStorage.TxByUser, userId: Types.UserId): TxStorage.TxList {
    switch (byUser.get(userId)) {
      case (?list) { list };
      case (null) {
        let list = List.empty<Types.Transaction>();
        byUser.add(userId, list);
        list;
      };
    };
  };

  func userView(byUser: TxStorage.TxByUser, userId: Types.UserId): TxStorage.TxList {
    switch (byUser.get(userId)) {
      case (?list) { list };
      case (null) { List.empty<Types.Transaction>() };
    };
  };

  public func getById(txs: TxStorage.TxList, id: Types.TxId): ?Types.Transaction {
    txs.find(func(tx) { tx.id == id });
  };

  // Walks the user's own list newest-first and stops once the page is filled,
  // so the cost is bounded by (offset + limit) rather than by anyone else's
  // transaction volume.
  public func getByUser(byUser: TxStorage.TxByUser, userId: Types.UserId, limit: Nat, offset: Nat): [Types.Transaction] {
    let page = List.empty<Types.Transaction>();
    var seen = 0;
    label scan for (tx in userView(byUser, userId).reverseValues()) {
      if (seen >= offset) {
        page.add(tx);
        if (page.size() >= limit) { break scan };
      };
      seen += 1;
    };
    List.toArray(page);
  };

  public func getUserTxCount(byUser: TxStorage.TxByUser, userId: Types.UserId): Nat {
    userView(byUser, userId).size();
  };

  public func getRecentByUser(byUser: TxStorage.TxByUser, userId: Types.UserId, count: Nat): [Types.Transaction] {
    let recent = List.empty<Types.Transaction>();
    label scan for (tx in userView(byUser, userId).reverseValues()) {
      recent.add(tx);
      if (recent.size() >= count) { break scan };
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

  func byType(byUser: TxStorage.TxByUser, userId: Types.UserId, txType: Types.TxType): [Types.Transaction] {
    let result = List.empty<Types.Transaction>();
    for (tx in userView(byUser, userId).values()) {
      if (tx.txType == txType) { result.add(tx) };
    };
    List.toArray(result);
  };

  public func getUserDeposits(byUser: TxStorage.TxByUser, userId: Types.UserId): [Types.Transaction] {
    byType(byUser, userId, #deposit);
  };

  public func getUserWithdrawals(byUser: TxStorage.TxByUser, userId: Types.UserId): [Types.Transaction] {
    byType(byUser, userId, #withdraw);
  };

  public func getUserTransfers(byUser: TxStorage.TxByUser, userId: Types.UserId): [Types.Transaction] {
    byType(byUser, userId, #transfer);
  };

  // Totals are summed rather than kept as running counters because status is
  // mutated in place after creation, so a counter would need updating at every
  // complete/fail site and would drift the moment one was missed.
  //
  // Amounts are scoped to one ledger; only the transfer count spans tokens.
  // Summing amounts across ledgers would add ckBTC satoshi to ICP e8s and call
  // the result a balance.
  public func getUserTotals(byUser: TxStorage.TxByUser, userId: Types.UserId, ledgerId: Text): { deposits: Nat; withdrawals: Nat; transfers: Nat } {
    var deposits = 0;
    var withdrawals = 0;
    var transfers = 0;
    for (tx in userView(byUser, userId).values()) {
      if (tx.status == #completed) {
        switch (tx.txType) {
          case (#deposit) { if (tx.ledgerId == ledgerId) { deposits += tx.amount } };
          case (#withdraw) { if (tx.ledgerId == ledgerId) { withdrawals += tx.amount } };
          case (#transfer) { transfers += 1 };
          case (#fee or #swapOut or #swapIn) {};
        };
      };
    };
    { deposits; withdrawals; transfers };
  };

  func sumAmount(byUser: TxStorage.TxByUser, userId: Types.UserId, txType: Types.TxType): Nat {
    var total = 0;
    for (tx in userView(byUser, userId).values()) {
      if (tx.txType == txType and tx.status == #completed) { total += tx.amount };
    };
    total;
  };

  // Deposit sync compares this against one ledger's balance, so it must count
  // only that ledger's rows. Summing across tokens would measure an ICP balance
  // against an ICP-plus-ckBTC total and credit the difference as a deposit.
  func sumAmountOnLedger(byUser: TxStorage.TxByUser, userId: Types.UserId, txType: Types.TxType, ledgerId: Text): Nat {
    var total = 0;
    for (tx in userView(byUser, userId).values()) {
      if (tx.txType == txType and tx.status == #completed and tx.ledgerId == ledgerId) {
        total += tx.amount;
      };
    };
    total;
  };

  public func getTotalDepositAmount(byUser: TxStorage.TxByUser, userId: Types.UserId, ledgerId: Text): Nat {
    sumAmountOnLedger(byUser, userId, #deposit, ledgerId);
  };

  public func getTotalWithdrawalAmount(byUser: TxStorage.TxByUser, userId: Types.UserId): Nat {
    sumAmount(byUser, userId, #withdraw);
  };

  public func getTotalTransferCount(byUser: TxStorage.TxByUser, userId: Types.UserId): Nat {
    var count = 0;
    for (tx in userView(byUser, userId).values()) {
      if (tx.txType == #transfer and tx.status == #completed) { count += 1 };
    };
    count;
  };
};
