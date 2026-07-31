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
  public func create(users: UserStorage.UserMap, txs: TxStorage.TxList, ledger: LedgerService.LedgerService): DashboardService {
    { users; txs; ledger };
  };

  public type DashboardService = {
    users: UserStorage.UserMap;
    txs: TxStorage.TxList;
    ledger: LedgerService.LedgerService;
  };

  public func getDashboard(service: DashboardService, caller: Principal): async Types.ApiResult<Types.DashboardData> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) {
        let depositAccount = LedgerService.depositAccount(service.ledger, caller);
        let balance = await LedgerService.getBalance(service.ledger, depositAccount);
        let recentPublic = TxRepo.getRecentByUser(service.txs, user.id, 10)
          .values()
          .map<Types.Transaction, Types.TransactionPublic>(Types.txToPublic)
          .toArray();
        let totals = TxRepo.getUserTotals(service.txs, user.id);
        #ok({
          user = Types.userToPublic(user);
          principal = caller;
          icpBalance = balance;
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
