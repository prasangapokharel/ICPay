import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Time "mo:core/Time";
import Types "../types";
import Config "../config/Config";
import AccountHelper "../ledger/Account";
import TransferError "../ledger/TransferError";
import LedgerTypes "../ledger/Types";
import UserRepo "../repositories/UserRepository";
import UserStorage "../storage/UserStorage";
import TransferService "TransferService";
import LedgerService "LedgerService";
import AmountValidator "../validators/AmountValidator";
import RateLimitService "RateLimitService";
import RateLimitStorage "../storage/RateLimitStorage";

module {
  public func create(
    users: UserStorage.UserMap,
    transfers: TransferService.TransferService,
    self: Principal,
    limits: RateLimitStorage.RateLimitMap,
    getPresaleSold: () -> Nat,
    addPresaleSold: (Nat) -> (),
  ) : SaleService {
    { users; transfers; self; limits; getPresaleSold; addPresaleSold };
  };

  public type SaleService = {
    users: UserStorage.UserMap;
    transfers: TransferService.TransferService;
    self: Principal;
    limits: RateLimitStorage.RateLimitMap;
    getPresaleSold: () -> Nat;
    addPresaleSold: (Nat) -> ();
  };

  public type Quote = {
    rate: Nat;
    inventoryCap: Nat;
    inventoryRemaining: Nat;
    icpaySold: Nat;
    icpRaised: Nat;
    percentSold: Nat;
    minBuyIcp: Nat;
    maxBuyIcp: Nat;
    active: Bool;
  };

  public type Purchase = {
    icpBlock: Nat64;
    icpayBlock: Nat64;
    icpAmount: Nat;
    icpayAmount: Nat;
    destination: Text;
  };

  public func rate() : Nat {
    Config.ICPAY_PER_ICP;
  };

  public func icpayAmountFor(icpAmount: Nat) : Nat {
    icpAmount * Config.ICPAY_PER_ICP;
  };

  public func sweepAmount(balance: Nat, fee: Nat) : ?Nat {
    if (balance <= fee) { null } else { ?Nat.sub(balance, fee) };
  };

  public func sweepStrayIcpay(service: SaleService) : async Types.ApiResult<Nat64> {
    let from = AccountHelper.defaultAccount(service.self);
    let balance = await LedgerService.getBalance(Config.ICPAY_LEDGER_ID, from);
    let fee = await LedgerService.getFee(Config.ICPAY_LEDGER_ID);
    switch (sweepAmount(balance, fee)) {
      case (null) { return #err("Nothing to sweep from the default account") };
      case (?amount) {
        switch (
          await LedgerService.transfer(Config.ICPAY_LEDGER_ID, {
            from_subaccount = null;
            to = AccountHelper.defaultAccount(Principal.fromText(Config.TREASURY));
            amount;
            fee = ?fee;
            memo = null;
            created_at_time = null;
          })
        ) {
          case (#Ok(blockIndex)) { #ok(Nat64.fromNat(blockIndex)) };
          case (#Err(e)) { #err(TransferError.describe(e)) };
        };
      };
    };
  };

  public func validateIcpAmount(icpAmount: Nat) : ?Text {
    switch (AmountValidator.validate(icpAmount)) {
      case (?err) { return ?err };
      case (null) {};
    };
    if (icpAmount < Config.MIN_BUY_ICP) {
      return ?("Minimum purchase is 0.1 ICP");
    };
    if (icpAmount > Config.MAX_BUY_ICP) {
      return ?("Maximum purchase is 50 ICP per transaction");
    };
    null;
  };

  public func quote(service: SaleService) : async Quote {
    let saleAccount = AccountHelper.fixedAccount(service.self, Config.SALE_SUBACCOUNT);
    let remaining = await LedgerService.getBalance(Config.ICPAY_LEDGER_ID, saleAccount);
    let cap = Config.SALE_INVENTORY_CAP;
    let sold = service.getPresaleSold();
    let icpRaised = sold / Config.ICPAY_PER_ICP;
    let percentSold = if (cap == 0) { 0 } else { sold * 100 / cap };
    let fee = await LedgerService.getFee(Config.ICPAY_LEDGER_ID);
    {
      rate = Config.ICPAY_PER_ICP;
      inventoryCap = cap;
      inventoryRemaining = remaining;
      icpaySold = sold;
      icpRaised;
      percentSold;
      minBuyIcp = Config.MIN_BUY_ICP;
      maxBuyIcp = Config.MAX_BUY_ICP;
      active = remaining > fee;
    };
  };

  public func buy(
    service: SaleService,
    caller: Principal,
    icpAmount: Nat,
    recipient: ?Principal,
  ) : async Types.ApiResult<Purchase> {
    if (not RateLimitService.allow(service.limits, caller, Config.RATE_BUY_ICPAY, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_BUY_ICPAY));
    };
    switch (validateIcpAmount(icpAmount)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (null) { return #err("User not found") };
      case (?_) {};
    };

    let destPrincipal = switch (recipient) {
      case (?p) { p };
      case (null) { caller };
    };
    if (Principal.isAnonymous(destPrincipal)) {
      return #err("Cannot send to anonymous principal");
    };
    let destination = resolveDestination(service, destPrincipal);
    let icpayAmount = icpayAmountFor(icpAmount);

    // Our own inventory — unlike a buyer's balance, nothing else enforces this,
    // and a shortfall after charging ICP would land on the refund path.
    let saleAccount = AccountHelper.fixedAccount(service.self, Config.SALE_SUBACCOUNT);
    let inventory = await LedgerService.getBalance(Config.ICPAY_LEDGER_ID, saleAccount);
    let icpayFee = await LedgerService.getFee(Config.ICPAY_LEDGER_ID);
    if (inventory < icpayAmount + icpayFee) {
      return #err("Sale inventory is short");
    };

    let revenue = AccountHelper.fixedAccount(service.self, Config.REVENUE_SUBACCOUNT);
    let icpResult = await TransferService.transferByAccountInternal(
      service.transfers,
      caller,
      Config.ICP_LEDGER_CANISTER_ID,
      revenue,
      icpAmount,
      ?"ICPAY sale",
    );

    switch (icpResult) {
      case (#err(e)) { #err(e) };
      case (#ok({ blockIndex = icpBlock; txId = _ })) {
        switch (
          await LedgerService.transfer(Config.ICPAY_LEDGER_ID, {
            from_subaccount = ?Config.SALE_SUBACCOUNT;
            to = destination;
            amount = icpayAmount;
            fee = ?icpayFee;
            memo = null;
            created_at_time = null;
          })
        ) {
          case (#Ok(blockIdx)) {
            service.addPresaleSold(icpayAmount);
            #ok({
              icpBlock;
              icpayBlock = Nat64.fromNat(blockIdx);
              icpAmount;
              icpayAmount;
              destination = AccountHelper.toText(destination);
            });
          };
          case (#Err(#Duplicate({ duplicate_of }))) {
            #ok({
              icpBlock;
              icpayBlock = Nat64.fromNat(duplicate_of);
              icpAmount;
              icpayAmount;
              destination = AccountHelper.toText(destination);
            });
          };
          case (#Err(_)) {
            switch (await refundIcp(service, caller, icpAmount, icpBlock)) {
              case (#ok(_)) {
                #err(
                  "ICPAY payout failed. Your ICP was refunded at block "
                  # Nat64.toText(icpBlock)
                );
              };
              case (#err(_)) {
                #err(
                  "ICPAY payout failed and the refund did not go through. Your ICP is safe at payment block "
                  # Nat64.toText(icpBlock)
                  # " -- contact support."
                );
              };
            };
          };
        };
      };
    };
  };

  func resolveDestination(service: SaleService, to: Principal) : LedgerTypes.Account {
    switch (UserRepo.getByPrincipal(service.users, to)) {
      case (?_) { LedgerService.depositAccount(service.transfers.ledger, to) };
      case (null) { AccountHelper.defaultAccount(to) };
    };
  };

  func refundIcp(
    service: SaleService,
    caller: Principal,
    icpAmount: Nat,
    paymentBlock: Nat64,
  ) : async Types.ApiResult<Nat64> {
    let icpFee = await LedgerService.getFee(Config.ICP_LEDGER_CANISTER_ID);
    if (icpAmount <= icpFee) {
      return #err("Refund amount too small after fee at block " # Nat64.toText(paymentBlock));
    };
    let refundAmount = Nat.sub(icpAmount, icpFee);
    let to = LedgerService.depositAccount(service.transfers.ledger, caller);
    switch (
      await LedgerService.transfer(Config.ICP_LEDGER_CANISTER_ID, {
        from_subaccount = ?Config.REVENUE_SUBACCOUNT;
        to;
        amount = refundAmount;
        fee = ?icpFee;
        memo = null;
        created_at_time = null;
      })
    ) {
      case (#Ok(blockIdx)) { #ok(Nat64.fromNat(blockIdx)) };
      case (#Err(#Duplicate({ duplicate_of }))) { #ok(Nat64.fromNat(duplicate_of)) };
      case (#Err(e)) { #err(TransferError.describe(e)) };
    };
  };
};
