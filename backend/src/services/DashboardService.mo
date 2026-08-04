import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Types "../types";
import AccountHelper "../ledger/Account";
import LedgerService "LedgerService";
import UserRepo "../repositories/UserRepository";
import TxRepo "../repositories/TransactionRepository";
import UserStorage "../storage/UserStorage";
import TxStorage "../storage/TransactionStorage";

module {
  public func create(users: UserStorage.UserMap, txs: TxStorage.TxList, byUser: TxStorage.TxByUser, ledger: LedgerService.LedgerService): DashboardService {
    { users; txs; byUser; ledger };
  };

  public type DashboardService = {
    users: UserStorage.UserMap;
    txs: TxStorage.TxList;
    byUser: TxStorage.TxByUser;
    ledger: LedgerService.LedgerService;
  };

  // Deliberately synchronous and deliberately without a balance. Awaiting the
  // ledger for it forced this onto the update path, measured at 67.8M cycles
  // against 210k for the same data served as a query. The client reads the
  // balance straight from the ledger, where it is a query too.
  public func getDashboard(service: DashboardService, caller: Principal, ledgerId: Text): Types.ApiResult<Types.DashboardData> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) {
        let depositAccount = LedgerService.depositAccount(service.ledger, caller);
        let recentPublic = TxRepo.getRecentByUser(service.byUser, user.id, 10)
          .values()
          .map<Types.Transaction, Types.TransactionPublic>(Types.txToPublic)
          .toArray();
        let totals = TxRepo.getUserTotals(service.byUser, user.id, ledgerId);
        #ok({
          user = Types.userToPublic(user);
          principal = caller;
          depositAddress = depositAccount;
          depositAccountIdentifier = AccountHelper.toAccountIdentifier(depositAccount);
          recentTransactions = recentPublic;
          totalDeposits = totals.deposits;
          totalWithdrawals = totals.withdrawals;
          totalTransfers = totals.transfers;
        });
      };
      case (null) { #err("User not found") };
    };
  };
};
