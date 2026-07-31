import UserStorage "storage/UserStorage";
import TxStorage "storage/TransactionStorage";
import SettingsStorage "storage/SettingsStorage";
import LedgerService "services/LedgerService";
import AuthService "services/AuthService";
import UserService "services/UserService";
import DashboardService "services/DashboardService";
import DepositService "services/DepositService";
import WithdrawService "services/WithdrawService";
import TransferService "services/TransferService";
import TransactionService "services/TransactionService";
import SettingsService "services/SettingsService";
import HealthApi "api/v1/Health";
import AuthApi "api/v1/Auth";
import UsersApi "api/v1/Users";
import DashboardApi "api/v1/Dashboard";
import DepositApi "api/v1/Deposit";
import WithdrawApi "api/v1/Withdraw";
import TransferApi "api/v1/Transfer";
import TransactionsApi "api/v1/Transactions";
import SettingsApi "api/v1/Settings";
import MiddlewareAuth "middleware/Auth";
import Principal "mo:core/Principal";

persistent actor self {
  transient let mwConfig = MiddlewareAuth.prodConfig();

  // Storage must NOT be transient: in a persistent actor `transient` opts out of
  // orthogonal persistence, so every user, balance and transaction record would
  // be wiped on each upgrade. Services stay transient -- they are just records of
  // references, rebuilt from this state at no cost on upgrade.
  let users = UserStorage.createUserMap();
  let usernames = UserStorage.createUsernameMap();
  let usersById = UserStorage.createUserIdMap();
  let transactions = TxStorage.createTxList();
  let settings = SettingsStorage.createSettingsMap();
  transient let ledger = LedgerService.create(Principal.fromActor(self));

  transient let authService = AuthService.create(users, usernames, usersById);
  transient let userService = UserService.create(users, usernames, usersById);
  transient let dashboardService = DashboardService.create(users, transactions, ledger);
  transient let depositService = DepositService.create(users, transactions, ledger);
  transient let withdrawService = WithdrawService.create(users, transactions, ledger);
  transient let transferService = TransferService.create(users, usernames, transactions, ledger);
  transient let transactionService = TransactionService.create(users, transactions);
  transient let settingsService = SettingsService.create(users, settings);

  include HealthApi();
  include AuthApi(authService, mwConfig);
  include UsersApi(userService, mwConfig);
  include DashboardApi(dashboardService, mwConfig);
  include DepositApi(depositService, mwConfig);
  include WithdrawApi(withdrawService, mwConfig);
  include TransferApi(transferService, mwConfig);
  include TransactionsApi(transactionService, mwConfig);
  include SettingsApi(settingsService, mwConfig);
};
