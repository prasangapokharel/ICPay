import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat64 "mo:core/Nat64";
import Types "../types";
import Config "../config/Config";
import AccountHelper "../ledger/Account";
import LedgerTypes "../ledger/Types";
import TransferError "../ledger/TransferError";
import TradeClient "../ledger/TradeClient";
import LedgerService "LedgerService";
import TxModel "../models/Transaction";
import UserRepo "../repositories/UserRepository";
import TxRepo "../repositories/TransactionRepository";
import UserStorage "../storage/UserStorage";
import TxStorage "../storage/TransactionStorage";
import AmountValidator "../validators/AmountValidator";
import RateLimitService "RateLimitService";
import RateLimitStorage "../storage/RateLimitStorage";

module {
  public func create(
    users: UserStorage.UserMap,
    txs: TxStorage.TxList,
    byUser: TxStorage.TxByUser,
    ledger: LedgerService.LedgerService,
    nextId: () -> Text,
    limits: RateLimitStorage.RateLimitMap,
  ) : TradeService {
    { users; txs; byUser; ledger; nextId; limits };
  };

  public type TradeService = {
    users: UserStorage.UserMap;
    txs: TxStorage.TxList;
    byUser: TxStorage.TxByUser;
    ledger: LedgerService.LedgerService;
    nextId: () -> Text;
    limits: RateLimitStorage.RateLimitMap;
  };

  func validateLedger(service: TradeService, ledgerId: Text, amount: Nat): ?Text {
    if (not LedgerService.isAllowed(service.ledger, ledgerId)) {
      return ?("Unsupported token ledger: " # ledgerId);
    };
    AmountValidator.validate(amount);
  };

  func resolveUser(service: TradeService, caller: Principal): Types.ApiResult<Types.User> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) { #ok(user) };
      case (null) { #err("User not found") };
    };
  };

  func tradeDestination() : LedgerTypes.Account {
    { owner = Principal.fromText(Config.TRADE_CANISTER_ID); subaccount = null };
  };

  public func depositForTrade(
    service: TradeService,
    caller: Principal,
    ledgerId: Text,
    amount: Nat,
  ) : async Types.ApiResult<{ blockIndex: Nat64 }> {
    if (not RateLimitService.allow(service.limits, caller, Config.RATE_TRANSFER, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_TRANSFER));
    };
    switch (validateLedger(service, ledgerId, amount)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (resolveUser(service, caller)) {
      case (#err(e)) { return #err(e) };
      case (#ok(user)) {
        let source = LedgerService.depositAccount(service.ledger, caller);
        let destination = tradeDestination();
        let fee = LedgerService.estimatedDisplayFee(ledgerId);
        let now = Time.now();
        let id = service.nextId();
        let fromLabel = AccountHelper.toAccountIdentifier(source);
        let tx = TxRepo.create(
          service.txs,
          service.byUser,
          id,
          user.id,
          #swapOut,
          ledgerId,
          amount,
          fee,
          fromLabel,
          Principal.toText(destination.owner),
          null,
          now,
        );
        let now64 = Nat64.fromNat(Int.abs(now));
        let transferArgs: LedgerTypes.TransferArgs = {
          from_subaccount = source.subaccount;
          to = destination;
          amount;
          fee = null;
          memo = null;
          created_at_time = ?now64;
        };
        let result = await LedgerService.transfer(ledgerId, transferArgs);
        switch (result) {
          case (#Ok(blockIdx)) {
            let blockIdx64 = Nat64.fromNat(blockIdx);
            let trade = TradeClient.connect(Config.TRADE_CANISTER_ID);
            switch (await trade.credit_from_wallet(caller, ledgerId, amount, blockIdx64)) {
              case (#Ok) {
                TxModel.complete(tx, blockIdx64, now);
                #ok({ blockIndex = blockIdx64 });
              };
              case (#Err(e)) {
                TxModel.fail(tx, now);
                #err("Trade credit failed: " # e);
              };
            };
          };
          case (#Err(#Duplicate({ duplicate_of }))) {
            let blockIdx64 = Nat64.fromNat(duplicate_of);
            let trade = TradeClient.connect(Config.TRADE_CANISTER_ID);
            switch (await trade.credit_from_wallet(caller, ledgerId, amount, blockIdx64)) {
              case (#Ok) {
                TxModel.complete(tx, blockIdx64, now);
                #ok({ blockIndex = blockIdx64 });
              };
              case (#Err(e)) {
                TxModel.fail(tx, now);
                #err("Trade credit failed: " # e);
              };
            };
          };
          case (#Err(e)) {
            TxModel.fail(tx, now);
            #err("Transfer failed: " # TransferError.describe(e));
          };
        };
      };
    };
  };

  public func withdrawFromTrade(
    service: TradeService,
    caller: Principal,
    ledgerId: Text,
    amount: Nat,
  ) : async Types.ApiResult<{ blockIndex: Nat64 }> {
    if (not RateLimitService.allow(service.limits, caller, Config.RATE_TRANSFER, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_TRANSFER));
    };
    switch (validateLedger(service, ledgerId, amount)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (resolveUser(service, caller)) {
      case (#err(e)) { return #err(e) };
      case (#ok(user)) {
        let destination = LedgerService.depositAccount(service.ledger, caller);
        let fee = LedgerService.estimatedDisplayFee(ledgerId);
        let now = Time.now();
        let id = service.nextId();
        let tx = TxRepo.create(
          service.txs,
          service.byUser,
          id,
          user.id,
          #swapIn,
          ledgerId,
          amount,
          fee,
          Config.TRADE_CANISTER_ID,
          AccountHelper.toAccountIdentifier(destination),
          null,
          now,
        );
        let trade = TradeClient.connect(Config.TRADE_CANISTER_ID);
        switch (await trade.debit_to_wallet(caller, ledgerId, amount, destination)) {
          case (#Ok(blockIdx)) {
            let blockIdx64 = Nat64.fromNat(blockIdx);
            TxModel.complete(tx, blockIdx64, now);
            #ok({ blockIndex = blockIdx64 });
          };
          case (#Err(e)) {
            TxModel.fail(tx, now);
            #err("Trade withdraw failed: " # e);
          };
        };
      };
    };
  };
};
