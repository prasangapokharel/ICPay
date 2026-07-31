import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types";
import UUID "../utils/UUID";
import AccountHelper "../ledger/Account";
import LedgerService "LedgerService";
import TxModel "../models/Transaction";
import UserRepo "../repositories/UserRepository";
import TxRepo "../repositories/TransactionRepository";
import UserStorage "../storage/UserStorage";
import TxStorage "../storage/TransactionStorage";

module {
  public func create(users: UserStorage.UserMap, txs: TxStorage.TxList, ledger: LedgerService.LedgerService): DepositService {
    { users; txs; ledger };
  };

  public type DepositService = {
    users: UserStorage.UserMap;
    txs: TxStorage.TxList;
    ledger: LedgerService.LedgerService;
  };

  public func getDepositAddress(service: DepositService, caller: Principal): Types.ICRC1Account {
    LedgerService.depositAccount(service.ledger, caller);
  };

  public func getDepositAccountIdentifier(service: DepositService, caller: Principal): Text {
    AccountHelper.toAccountIdentifier(LedgerService.depositAccount(service.ledger, caller));
  };

  // Credits only the difference between the on-ledger balance and the amount
  // already recorded, so repeated calls cannot credit the same funds twice.
  public func syncDeposits(service: DepositService, caller: Principal): async Types.ApiResult<Types.TransactionPublic> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) {
        let onLedger = await LedgerService.getUserBalance(service.ledger, caller);
        let credited = TxRepo.getTotalDepositAmount(service.txs, user.id);
        if (onLedger <= credited) {
          return #err("No new deposits found");
        };
        let amount = onLedger - credited : Nat;
        let now = Time.now();
        let id = UUID.generate();
        let account = AccountHelper.toAccountIdentifier(LedgerService.depositAccount(service.ledger, caller));
        let tx = TxRepo.create(
          service.txs, id, user.id, #deposit, amount, 0,
          account, Principal.toText(caller), null, now,
        );
        tx.complete(0, now);
        #ok(Types.txToPublic(tx));
      };
      case (null) { #err("User not found") };
    };
  };
};
