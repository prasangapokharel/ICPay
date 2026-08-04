import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat64 "mo:core/Nat64";
import Types "../types";
import Config "../config/Config";
import AccountHelper "../ledger/Account";
import LedgerService "LedgerService";
import LedgerTypes "../ledger/Types";
import TransferError "../ledger/TransferError";
import TxModel "../models/Transaction";
import UserRepo "../repositories/UserRepository";
import TxRepo "../repositories/TransactionRepository";
import UserStorage "../storage/UserStorage";
import TxStorage "../storage/TransactionStorage";
import AmountValidator "../validators/AmountValidator";

module {
  public func create(users: UserStorage.UserMap, txs: TxStorage.TxList, byUser: TxStorage.TxByUser, ledger: LedgerService.LedgerService, nextId: () -> Text): WithdrawService {
    { users; txs; byUser; ledger; nextId };
  };

  public type WithdrawService = {
    users: UserStorage.UserMap;
    txs: TxStorage.TxList;
    byUser: TxStorage.TxByUser;
    ledger: LedgerService.LedgerService;
    nextId: () -> Text;
  };

  public func withdraw(service: WithdrawService, caller: Principal, ledgerId: Text, amount: Nat, destination: LedgerTypes.Account): async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    if (not LedgerService.isAllowed(service.ledger, ledgerId)) {
      return #err("Unsupported token ledger: " # ledgerId);
    };
    switch (AmountValidator.validate(amount)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) {
        // Display only; the ledger charges its own -- see the null fee below.
        let fee = await LedgerService.getFee(ledgerId);
        let source = LedgerService.depositAccount(service.ledger, caller);
        let now = Time.now();
        let id = service.nextId();
        let tx = TxRepo.create(
          service.txs, service.byUser, id, user.id, #withdraw, ledgerId, amount, fee,
          AccountHelper.toAccountIdentifier(source), AccountHelper.toText(destination), null, now,
        );
        let now64 = Nat64.fromNat(Int.abs(now));
        let transferArgs: LedgerTypes.TransferArgs = {
          from_subaccount = source.subaccount;
          to = destination;
          amount;
          // The ledger applies its own fee. A withdrawal to a minting account is
          // a burn, which requires exactly this.
          fee = null;
          memo = null;
          created_at_time = ?now64;
        };
        let result = await LedgerService.transfer(ledgerId, transferArgs);
        switch (result) {
          case (#Ok(blockIdx)) {
            let blockIdx64 = Nat64.fromNat(blockIdx);
            tx.complete(blockIdx64, now);
            #ok({ blockIndex = blockIdx64; txId = id });
          };
          // A retried request can come back #Duplicate: the ledger already settled
          // the identical transfer on the earlier attempt. That is a success --
          // the funds moved at the returned block -- not a failure to report.
          case (#Err(#Duplicate({ duplicate_of }))) {
            let blockIdx64 = Nat64.fromNat(duplicate_of);
            tx.complete(blockIdx64, now);
            #ok({ blockIndex = blockIdx64; txId = id });
          };
          case (#Err(e)) {
            tx.fail(now);
            #err("Transfer failed: " # TransferError.describe(e));
          };
        };
      };
      case (null) { #err("User not found") };
    };
  };
};
