import UserStorage "storage/UserStorage";
import ReservedUsernameStorage "storage/ReservedUsernameStorage";
import TxStorage "storage/TransactionStorage";
import SettingsStorage "storage/SettingsStorage";
import LedgerStorage "storage/LedgerStorage";
import TokenStorage "storage/TokenStorage";
import TxRepo "repositories/TransactionRepository";
import LedgerService "services/LedgerService";
import AuthService "services/AuthService";
import UserService "services/UserService";
import AdminService "services/AdminService";
import DashboardService "services/DashboardService";
import DepositService "services/DepositService";
import WithdrawService "services/WithdrawService";
import TransferService "services/TransferService";
import UsernameSaleService "services/UsernameSaleService";
import TokenWasmService "services/TokenWasmService";
import TokenService "services/TokenService";
import TransactionService "services/TransactionService";
import SettingsService "services/SettingsService";
import HealthApi "api/v1/Health";
import AuthApi "api/v1/Auth";
import UsersApi "api/v1/Users";
import AdminApi "api/v1/Admin";
import DashboardApi "api/v1/Dashboard";
import DepositApi "api/v1/Deposit";
import WithdrawApi "api/v1/Withdraw";
import LedgersApi "api/v1/Ledgers";
import TransferApi "api/v1/Transfer";
import UsernameSaleApi "api/v1/UsernameSale";
import TokenApi "api/v1/Token";
import TransactionsApi "api/v1/Transactions";
import SettingsApi "api/v1/Settings";
import MiddlewareAuth "middleware/Auth";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Nat64 "mo:core/Nat64";
import Debug "mo:core/Debug";
import Timer "mo:core/Timer";
import UUID "utils/UUID";

persistent actor self {
  transient let mwConfig = MiddlewareAuth.prodConfig();

  // Storage must NOT be transient: in a persistent actor `transient` opts out of
  // orthogonal persistence, so every user, balance and transaction record would
  // be wiped on each upgrade. Services stay transient -- they are just records of
  // references, rebuilt from this state at no cost on upgrade.
  let users = UserStorage.createUserMap();
  let usernames = UserStorage.createUsernameMap();
  let usersById = UserStorage.createUserIdMap();
  let reservedUsernames = ReservedUsernameStorage.createReservedUsernameSet();
  let transactions = TxStorage.createTxList();
  let transactionsByUser = TxStorage.createTxByUser();
  let settings = SettingsStorage.createSettingsMap();
  // Which ledgers the custodian will call. Not transient: rediscovering every
  // SNS on each upgrade would leave transfers rejected until the first refresh
  // landed. Chain-key ledgers are compiled in, so ICP works even when empty.
  let ledgerRegistry = LedgerStorage.createLedgerRegistry();
  transient let ledger = LedgerService.create(Principal.fromActor(self), ledgerRegistry);

  // New stable variables, so they need no migration: nothing of them exists in
  // stable memory yet. They start empty on the upgrade that introduces them.
  let tokens = TokenStorage.createTokenMap();
  let tokensByLedger = TokenStorage.createTokensByLedger();
  let tokensByUser = TokenStorage.createTokensByUser();
  let reservedSymbols = TokenStorage.createReservedSymbolSet();
  // The chunk hashes survive upgrades on purpose: re-uploading the wasm after
  // every upgrade would make launches fail until an operator noticed.
  let tokenWasm = TokenWasmService.empty();

  // Library modules cannot hold mutable state (moc rejects a top-level `var`
  // outside an actor), so the monotonic id counter that keeps rows unique lives
  // here in the actor. Time.now() alone is constant for the whole round, so a
  // transfer that writes its sender and recipient rows back to back would
  // stamp them with the same id; appending the counter breaks that tie.
  var uidCounter = 0;
  func nextUid(): Text {
    uidCounter += 1;
    UUID.generate() # "-" # Int.toText(uidCounter);
  };

  // Phase 3 migration: rows written before `ledgerId` existed are stamped with
  // the ICP ledger id by the explicit migration function declared above (the
  // `(with migration = ...)` prefix). It runs once on upgrade and is ignored on
  // fresh install, so nothing here re-walks rows at startup.

  // The index is derived state, so it is rebuilt from the log at startup rather
  // than migrated. That covers the upgrade that introduces it, where the field
  // arrives empty while `transactions` already holds every prior record. It must
  // also follow the migration above: byUser references the same row objects, and
  // the stamped rows are new objects, so the index is refreshed after the stamp.
  TxRepo.reindex(transactions, transactionsByUser);

  transient let authService = AuthService.create(users, usernames, usersById, reservedUsernames, nextUid);
  transient let userService = UserService.create(users, usernames, usersById, reservedUsernames);
  transient let adminService = AdminService.create(reservedUsernames, users, usernames);
  transient let dashboardService = DashboardService.create(users, transactions, transactionsByUser, ledger);
  transient let depositService = DepositService.create(users, transactions, transactionsByUser, ledger, nextUid);
  transient let withdrawService = WithdrawService.create(users, transactions, transactionsByUser, ledger, nextUid);
  transient let transferService = TransferService.create(users, usernames, transactions, transactionsByUser, ledger, nextUid);
  transient let usernameSaleService = UsernameSaleService.create(users, usernames, reservedUsernames, transferService);
  transient let transactionService = TransactionService.create(users, transactions, transactionsByUser);
  transient let settingsService = SettingsService.create(users, settings);
  transient let tokenService = TokenService.create(
    tokens, tokensByLedger, tokensByUser, reservedSymbols, tokenWasm,
    transferService, ledger, users, Principal.fromActor(self), nextUid,
  );

  // Chain-key symbols are compiled in, so seeding them costs no calls and runs
  // on every start rather than needing a migration. Reserving is idempotent.
  TokenService.seedReservedSymbols(tokenService, ["ICP", "CKBTC", "CKETH", "CKUSDC", "CKUSDT"]);

  // Timers do not survive an upgrade, so this is armed at actor scope: it runs on
  // fresh install and again after every deploy, where a postupgrade-only hook
  // would leave a fresh install with no timer at all. TREASURY is compiled in, so
  // the timer can move revenue to exactly one place and nowhere else.
  //
  // The first tick lands a day after the deploy, never at install time -- an
  // upgrade should not fire a ledger transfer as a side effect of shipping.
  ignore Timer.recurringTimer<system>(#hours 24, func(): async () {
    // The manual sweep reports "Nothing to sweep" as an error to its operator,
    // which is the right answer to a human who asked for one. A day with no
    // revenue is the normal case here, so nothing is logged for it.
    switch (await TokenService.sweepRevenue(tokenService)) {
      case (#ok(blockIndex)) { Debug.print("swept revenue at block " # Nat64.toText(blockIndex)) };
      case (#err(_)) {};
    };
  });

  include HealthApi();
  include AuthApi(authService, mwConfig);
  include UsersApi(userService, mwConfig);
  include AdminApi(adminService, mwConfig);
  include DashboardApi(dashboardService, mwConfig);
  include DepositApi(depositService, mwConfig);
  include WithdrawApi(withdrawService, mwConfig);
  include LedgersApi(ledger, mwConfig);
  include TransferApi(transferService, mwConfig);
  include UsernameSaleApi(usernameSaleService, mwConfig);
  include TokenApi(tokenService, mwConfig);
  include TransactionsApi(transactionService, mwConfig);
  include SettingsApi(settingsService, mwConfig);
};
