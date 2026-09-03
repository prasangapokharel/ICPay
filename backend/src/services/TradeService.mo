import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
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

  func ensureLedger(service: TradeService, ledgerId: Text): async ?Text {
    if (LedgerService.isAllowed(service.ledger, ledgerId)) { return null };
    if (await LedgerService.isValidIcrcLedger(ledgerId)) {
      ignore LedgerService.registerLedger(service.ledger, ledgerId);
      return null;
    };
    ?("Unsupported token ledger: " # ledgerId);
  };

  func validateLedger(service: TradeService, ledgerId: Text, amount: Nat): async ?Text {
    switch (await ensureLedger(service, ledgerId)) {
      case (?err) { ?err };
      case (null) { AmountValidator.validate(amount) };
    };
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

  func toSwapResult(remote: TradeClient.SwapResultRemote) : Types.SwapResult {
    {
      blockIndex = remote.block_index;
      amountIn = remote.amount_in;
      amountOut = remote.amount_out;
      icpServiceFee = remote.service_fee;
      txId = remote.tx_id;
    };
  };

  func ensureTradingBalance(
    service: TradeService,
    caller: Principal,
    ledgerId: Text,
    amount: Nat,
  ) : async Types.ApiResult<()> {
    let trade = TradeClient.connect(Config.TRADE_CANISTER_ID);
    let balance = await trade.get_trading_balance(caller, ledgerId);
    if (balance >= amount) {
      return #ok(());
    };
    let topUp = Nat.sub(amount, balance);
    switch (await transferAndCredit(service, caller, ledgerId, topUp)) {
      case (#err(e)) { #err(e) };
      case (#ok(_)) { #ok(()) };
    };
  };

  public func executeTrade(
    service: TradeService,
    caller: Principal,
    tokenIn: Text,
    tokenOut: Text,
    amountIn: Nat,
    amountOutMin: Nat,
  ) : async Types.ApiResult<Types.SwapResult> {
    if (not RateLimitService.allow(service.limits, caller, Config.RATE_TRANSFER, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_TRANSFER));
    };
    if (tokenIn == tokenOut) {
      return #err("token_in and token_out must differ");
    };
    switch (await validateLedger(service, tokenIn, amountIn)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (await ensureLedger(service, tokenOut)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    let user = switch (resolveUser(service, caller)) {
      case (#err(e)) { return #err(e) };
      case (#ok(u)) { u };
    };

    switch (await ensureTradingBalance(service, caller, tokenIn, amountIn)) {
      case (#err(e)) { return #err(e) };
      case (#ok()) {};
    };

    let trade = TradeClient.connect(Config.TRADE_CANISTER_ID);
    switch (
      await trade.execute_swap_for_user(caller, tokenIn, tokenOut, amountIn, amountOutMin)
    ) {
      case (#Err(e)) {
        switch (await withdrawFromTradeUnchecked(service, caller, tokenIn, amountIn)) {
          case (#ok(_)) { #err(e) };
          case (#err(refundErr)) {
            #err(e # ". Refund failed: " # refundErr);
          };
        };
      };
      case (#Ok(remote)) {
        recordSwapFills(service, user.id, tokenIn, tokenOut, remote);
        #ok(toSwapResult(remote));
      };
    };
  };

  func recordSwapFills(
    service: TradeService,
    userId: Types.UserId,
    tokenIn: Text,
    tokenOut: Text,
    remote: TradeClient.SwapResultRemote,
  ) {
    let now = Time.now();
    let venue = Config.TRADE_CANISTER_ID;
    let outTx = TxRepo.create(
      service.txs,
      service.byUser,
      service.nextId(),
      userId,
      #swapOut,
      tokenIn,
      remote.amount_in,
      0,
      venue,
      venue,
      ?remote.tx_id,
      now,
    );
    TxModel.complete(outTx, remote.block_index, now);
    let inTx = TxRepo.create(
      service.txs,
      service.byUser,
      service.nextId(),
      userId,
      #swapIn,
      tokenOut,
      remote.amount_out,
      0,
      venue,
      venue,
      ?remote.tx_id,
      now,
    );
    TxModel.complete(inTx, remote.block_index, now);
  };

  func transferAndCredit(
    service: TradeService,
    caller: Principal,
    ledgerId: Text,
    amount: Nat,
  ) : async Types.ApiResult<{ blockIndex: Nat64 }> {
    switch (await validateLedger(service, ledgerId, amount)) {
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

  public func depositForTrade(
    service: TradeService,
    caller: Principal,
    ledgerId: Text,
    amount: Nat,
  ) : async Types.ApiResult<{ blockIndex: Nat64 }> {
    if (not RateLimitService.allow(service.limits, caller, Config.RATE_TRANSFER, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_TRANSFER));
    };
    await transferAndCredit(service, caller, ledgerId, amount);
  };

  func withdrawFromTradeUnchecked(
    service: TradeService,
    caller: Principal,
    ledgerId: Text,
    amount: Nat,
  ) : async Types.ApiResult<{ blockIndex: Nat64 }> {
    switch (await validateLedger(service, ledgerId, amount)) {
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

  public func withdrawFromTrade(
    service: TradeService,
    caller: Principal,
    ledgerId: Text,
    amount: Nat,
  ) : async Types.ApiResult<{ blockIndex: Nat64 }> {
    if (not RateLimitService.allow(service.limits, caller, Config.RATE_TRANSFER, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_TRANSFER));
    };
    await withdrawFromTradeUnchecked(service, caller, ledgerId, amount);
  };
};
