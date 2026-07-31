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
        #ok({
          user = Types.userToPublic(user);
          principal = caller;
          icpBalance = balance;
          depositAddress = depositAccount;
          depositAccountIdentifier = AccountHelper.toAccountIdentifier(depositAccount);
          recentTransactions = recentPublic;
          totalDeposits = TxRepo.getTotalDepositAmount(service.txs, user.id);
          totalWithdrawals = TxRepo.getTotalWithdrawalAmount(service.txs, user.id);
          totalTransfers = TxRepo.getTotalTransferCount(service.txs, user.id);
        });
      };
      case (null) { #err("User not found") };
    };
  };
};
