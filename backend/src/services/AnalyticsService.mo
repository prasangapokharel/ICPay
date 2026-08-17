import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Types "../types";
import Config "../config/Config";
import AccountHelper "../ledger/Account";
import UserRepo "../repositories/UserRepository";
import TxRepo "../repositories/TransactionRepository";
import UserStorage "../storage/UserStorage";
import TxStorage "../storage/TransactionStorage";
import UsernameValidator "../validators/UsernameValidator";
import TransferService "TransferService";

module {
  public func create(
    users: UserStorage.UserMap,
    byUser: TxStorage.TxByUser,
    transfers: TransferService.TransferService,
  ): AnalyticsService {
    { users; byUser; transfers };
  };

  public type AnalyticsService = {
    users: UserStorage.UserMap;
    byUser: TxStorage.TxByUser;
    transfers: TransferService.TransferService;
  };

  func requireAnalyticsUser(service: AnalyticsService, caller: Principal): Types.ApiResult<(Types.User, Text)> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (null) { #err("User not found") };
      case (?user) {
        switch (user.username) {
          case (null) { #err("Claim a username to use analytics") };
          case (?name) {
            if (not UsernameValidator.hasAnalyticsAccess(name)) {
              #err("Analytics requires a premium or ultra-premium username (1–4 characters)");
            } else {
              #ok((user, name));
            };
          };
        };
      };
    };
  };

  func isTipMemo(memo: ?Text): Bool {
    switch (memo) {
      case (null) { false };
      case (?m) {
        let lower = Text.toLower(m);
        lower == "tip" or lower == "donation" or Text.contains(lower, #text "tip");
      };
    };
  };

  func isIncoming(tx: Types.Transaction): Bool {
    switch (tx.txType) {
      case (#deposit or #swapIn) { true };
      case (#withdraw or #transfer or #fee or #swapOut) { false };
    };
  };

  func counterpartyLabel(tx: Types.Transaction, incoming: Bool): Text {
    if (incoming) { tx.from } else { tx.to };
  };

  func collectRows(byUser: TxStorage.TxByUser, userId: Types.UserId): [Types.TransactionPublic] {
    let total = TxRepo.getUserTxCount(byUser, userId);
    let txs = TxRepo.getRecentByUser(byUser, userId, total);
    Array.map<Types.Transaction, Types.TransactionPublic>(txs, Types.txToPublic);
  };

  func buildSummary(byUser: TxStorage.TxByUser, userId: Types.UserId, freeExport: Bool): Types.AnalyticsSummary {
    let icpLedger = Config.ICP_LEDGER_CANISTER_ID;
    var totalReceived = 0;
    var totalSent = 0;
    var depositCount = 0;
    var withdrawCount = 0;
    var transferCount = 0;
    var tipCount = 0;
    var swapInCount = 0;
    var swapOutCount = 0;
    var completedCount = 0;
    var failedCount = 0;
    let parties = Map.empty<Text, Bool>();

    let total = TxRepo.getUserTxCount(byUser, userId);
    for (tx in TxRepo.getRecentByUser(byUser, userId, total).vals()) {
      switch (tx.status) {
        case (#completed) {
          completedCount += 1;
          switch (tx.txType) {
            case (#deposit) {
              depositCount += 1;
              if (tx.ledgerId == icpLedger) { totalReceived += tx.amount };
            };
            case (#withdraw) {
              withdrawCount += 1;
              if (tx.ledgerId == icpLedger) { totalSent += tx.amount + tx.fee };
            };
            case (#transfer) {
              transferCount += 1;
              if (tx.ledgerId == icpLedger) { totalSent += tx.amount + tx.fee };
              if (isTipMemo(tx.memo)) { tipCount += 1 };
            };
            case (#fee) {
              if (tx.ledgerId == icpLedger) { totalSent += tx.amount };
            };
            case (#swapIn) { swapInCount += 1 };
            case (#swapOut) { swapOutCount += 1 };
          };
          if (tx.txType != #fee) {
            let incoming = isIncoming(tx);
            let counterparty = counterpartyLabel(tx, incoming);
            if (counterparty.size() > 0) { Map.add(parties, Text.compare, counterparty, true) };
          };
        };
        case (#failed or #cancelled) { failedCount += 1 };
        case (#pending) {};
      };
    };

    {
      totalReceivedE8s = totalReceived;
      totalSentE8s = totalSent;
      depositCount;
      withdrawCount;
      transferCount;
      tipCount;
      swapInCount;
      swapOutCount;
      completedCount;
      failedCount;
      uniqueCounterparties = parties.size();
      freeExport;
    };
  };

  public func getUserAnalytics(service: AnalyticsService, caller: Principal): Types.ApiResult<Types.AnalyticsData> {
    switch (requireAnalyticsUser(service, caller)) {
      case (#err(e)) { #err(e) };
      case (#ok((user, name))) {
        let freeExport = UsernameValidator.hasFreeAnalyticsExport(name);
        #ok({
          summary = buildSummary(service.byUser, user.id, freeExport);
          rows = collectRows(service.byUser, user.id);
        });
      };
    };
  };

  public func exportUserAnalytics(service: AnalyticsService, caller: Principal): async Types.ApiResult<Types.AnalyticsExportResult> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (null) { #err("User not found") };
      case (?user) {
        let rows = collectRows(service.byUser, user.id);
        if (rows.size() == 0) {
          return #err("No transactions to export");
        };

        let freeExport = switch (user.username) {
          case (null) { false };
          case (?name) { UsernameValidator.hasFreeAnalyticsExport(name) };
        };

        if (freeExport) {
          return #ok({ feePaidE8s = 0; rows });
        };

        let destination = AccountHelper.defaultAccount(Principal.fromText(Config.TREASURY));
        switch (
          await TransferService.transferByAccountInternal(
            service.transfers,
            caller,
            Config.ICP_LEDGER_CANISTER_ID,
            destination,
            Config.ANALYTICS_EXPORT_FEE_E8S,
            ?"Analytics export",
          )
        ) {
          case (#err(e)) { #err(e) };
          case (#ok(_)) { #ok({ feePaidE8s = Config.ANALYTICS_EXPORT_FEE_E8S; rows }) };
        };
      };
    };
  };
};
