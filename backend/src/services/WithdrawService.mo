import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Types "../types";
import UUID "../utils/UUID";
import Config "../config/Config";
import AccountHelper "../ledger/Account";
import LedgerService "LedgerService";
import LedgerTypes "../ledger/Types";
import TxModel "../models/Transaction";
import UserRepo "../repositories/UserRepository";
import TxRepo "../repositories/TransactionRepository";
import UserStorage "../storage/UserStorage";
import TxStorage "../storage/TransactionStorage";
import AmountValidator "../validators/AmountValidator";

module {
  public func create(users: UserStorage.UserMap, txs: TxStorage.TxList, byUser: TxStorage.TxByUser, ledger: LedgerService.LedgerService): WithdrawService {
    { users; txs; byUser; ledger };
  };

  public type WithdrawService = {
    users: UserStorage.UserMap;
    txs: TxStorage.TxList;
    byUser: TxStorage.TxByUser;
    ledger: LedgerService.LedgerService;
  };

  public func withdraw(service: WithdrawService, caller: Principal, amount: Nat, destination: LedgerTypes.Account): async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    switch (AmountValidator.validate(amount)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) {
        let fee = Config.ICP_FEE;
        let totalAmount = amount + fee;
        let source = LedgerService.depositAccount(service.ledger, caller);
        let balance = await LedgerService.getBalance(service.ledger, source);
        if (balance < totalAmount) {
          return #err("Insufficient balance (need " # Nat.toText(totalAmount) # " e8s, have " # Nat.toText(balance) # " e8s)");
        };
        let now = Time.now();
        let id = UUID.generate();
        let tx = TxRepo.create(
          service.txs, service.byUser, id, user.id, #withdraw, amount, fee,
          AccountHelper.toAccountIdentifier(source), AccountHelper.toText(destination), null, now,
        );
        let now64 = Nat64.fromNat(Int.abs(now));
        let transferArgs: LedgerTypes.TransferArgs = {
          from_subaccount = source.subaccount;
          to = destination;
          amount;
          fee = ?fee;
          memo = null;
          created_at_time = ?now64;
        };
        let result = await LedgerService.transfer(service.ledger, transferArgs);
        switch (result) {
          case (#Ok(blockIdx)) {
            let blockIdx64 = Nat64.fromNat(blockIdx);
            tx.complete(blockIdx64, now);
            #ok({ blockIndex = blockIdx64; txId = id });
          };
          case (#Err(e)) {
            tx.fail(now);
            #err("Transfer failed: " # debug_show e);
          };
        };
      };
      case (null) { #err("User not found") };
    };
  };
};
