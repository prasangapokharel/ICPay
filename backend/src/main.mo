import UserStorage "storage/UserStorage";
import ReservedUsernameStorage "storage/ReservedUsernameStorage";
import TxStorage "storage/TransactionStorage";
import SettingsStorage "storage/SettingsStorage";
import LedgerStorage "storage/LedgerStorage";
import TokenStorage "storage/TokenStorage";
import SwapStorage "storage/SwapStorage";
import BucketStorage "storage/BucketStorage";
import UserRepo "repositories/UserRepository";
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
import SaleService "services/SaleService";
import TokenWasmService "services/TokenWasmService";
import TokenService "services/TokenService";
import TransactionService "services/TransactionService";
import SettingsService "services/SettingsService";
import BookmarkStorage "storage/BookmarkStorage";
import LiveStorage "storage/LiveStorage";
import BookmarkService "services/BookmarkService";
import LiveService "services/LiveService";
import SocialLinkService "services/SocialLinkService";
import SwapService "services/SwapService";
import BucketService "services/BucketService";
import Config "config/Config";
import RateLimitStorage "storage/RateLimitStorage";
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
import SaleApi "api/v1/Sale";
import TokenApi "api/v1/Token";
import TransactionsApi "api/v1/Transactions";
import SettingsApi "api/v1/Settings";
import BookmarkApi "api/v1/Bookmark";
import SocialLinkApi "api/v1/SocialLink";
import VerifiedApi "api/v1/Verified";
import SwapApi "api/v1/Swap";
import BucketApi "api/v1/Bucket";
import AnalyticsService "services/AnalyticsService";
import AnalyticsApi "api/v1/Analytics";
import LiveApi "api/v1/Live";
import CloudHttpApi "api/v1/CloudHttp";
import MiddlewareAuth "middleware/Auth";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Nat64 "mo:core/Nat64";
import Debug "mo:core/Debug";
import Timer "mo:core/Timer";
import UUID "utils/UUID";
import Map "mo:core/Map";

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
  ignore LedgerService.registerLedger(ledger, Config.ICPAY_LEDGER_ID);

  // New stable variables, so they need no migration: nothing of them exists in
  // stable memory yet. They start empty on the upgrade that introduces them.
  let tokens = TokenStorage.createTokenMap();
  let tokensByLedger = TokenStorage.createTokensByLedger();
  let tokensByUser = TokenStorage.createTokensByUser();
  let reservedSymbols = TokenStorage.createReservedSymbolSet();
  // The chunk hashes survive upgrades on purpose: re-uploading the wasm after
  // every upgrade would make launches fail until an operator noticed.
  let tokenWasm = TokenWasmService.empty();

  // Not transient: an upgrade resetting every counter would be a one-time
  // amnesty, not a hole, but there is no reason to take even that -- these are
  // cheap maps that key off the same caller-guard `Principal` already used
  // everywhere else. One map per named policy, per the ratelimit design doc,
  // so a caller throttled on one path can still use the others.
  let claimLimits = RateLimitStorage.createRateLimitMap();
  let transferLimits = RateLimitStorage.createRateLimitMap();
  let withdrawLimits = RateLimitStorage.createRateLimitMap();
  let syncDepositLimits = RateLimitStorage.createRateLimitMap();
  let settingsLimits = RateLimitStorage.createRateLimitMap();
  let purchaseUsernameLimits = RateLimitStorage.createRateLimitMap();
  let buyIcpayLimits = RateLimitStorage.createRateLimitMap();
  let launchTokenLimits = RateLimitStorage.createRateLimitMap();
  let swapLimits = RateLimitStorage.createRateLimitMap();
  let bucketCreateLimits = RateLimitStorage.createRateLimitMap();
  let bucketUploadLimits = RateLimitStorage.createRateLimitMap();
  let bucketRenewLimits = RateLimitStorage.createRateLimitMap();
  let bucketManageLimits = RateLimitStorage.createRateLimitMap();
  let bucketApiKeyLimits = RateLimitStorage.createRateLimitMap();

  // ICPAY actually paid out by the presale. Inventory balance alone cannot
  // distinguish "nothing sold yet" from "100% sold", so sold stats come from here.
  var icpayPresaleSold : Nat = 0;

  // New stable variable — no migration needed, starts empty on first upgrade.
  let bookmarks = BookmarkStorage.createBookmarkMap();

  let liveRooms = LiveStorage.createRoomMap();
  transient let livePeers = LiveStorage.createPeerMap();
  transient let liveSignals = LiveStorage.createSignalMap();

  // Pending swaps survive upgrades: a failed withdraw must not vanish on deploy.
  let pendingSwaps = SwapStorage.createPendingMap();
  // Failed swap escrows survive upgrades so recovery stays tied to a real attempt.
  let failedSwapEscrows = SwapStorage.createEscrowMap();
  SwapStorage.reindexEscrowKeys(failedSwapEscrows);

  // ICPay Cloud — bucket metadata and file blobs persist across upgrades.
  let bucketStore = BucketStorage.empty();
  let bucketNameIndex = Map.empty<Text, Text>();
  BucketStorage.reindexNames(bucketStore, bucketNameIndex);

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

  // Phase 3 migration (StampLedgerId) ran once on an earlier upgrade; ledgerId
  // is stamped at migration time, not here at startup.

  // The index is derived state, so it is rebuilt from the log at startup rather
  // than migrated. That covers the upgrade that introduces it, where the field
  // arrives empty while `transactions` already holds every prior record. It must
  // also follow the migration above: byUser references the same row objects, and
  // the stamped rows are new objects, so the index is refreshed after the stamp.
  TxRepo.reindex(transactions, transactionsByUser);

  // Derived from `users` — rebuilt at startup so upgrades that predate the index
  // still resolve transfer recipients in O(1). Not stable: same pattern as
  // reindexing transactionsByUser after migration.
  transient let depositSubaccounts = UserStorage.createDepositSubaccountIndex();
  transient let depositAccountIds = UserStorage.createDepositAccountIdIndex();
  transient let depositIndexCtx : UserRepo.DepositIndexCtx = {
    subaccounts = depositSubaccounts;
    accountIds = depositAccountIds;
    custodian = Principal.fromActor(self);
  };
  UserRepo.reindexDepositAccounts(users, depositIndexCtx);

  transient let authService = AuthService.create(users, usernames, usersById, reservedUsernames, nextUid, claimLimits, ?depositIndexCtx);
  transient let userService = UserService.create(users, usernames, usersById, reservedUsernames, claimLimits);
  transient let adminService = AdminService.create(reservedUsernames, users, usernames);
  transient let dashboardService = DashboardService.create(users, transactions, transactionsByUser, ledger);
  transient let depositService = DepositService.create(users, transactions, transactionsByUser, ledger, nextUid, syncDepositLimits);
  transient let withdrawService = WithdrawService.create(users, transactions, transactionsByUser, ledger, nextUid, withdrawLimits);
  transient let transferService = TransferService.create(users, usernames, transactions, transactionsByUser, ledger, nextUid, transferLimits, depositSubaccounts, depositAccountIds);
  transient let usernameSaleService = UsernameSaleService.create(users, usernames, reservedUsernames, transferService, purchaseUsernameLimits);
  transient let saleService = SaleService.create(
    users,
    transferService,
    Principal.fromActor(self),
    buyIcpayLimits,
    func () { icpayPresaleSold },
    func (n) { icpayPresaleSold += n },
  );
  transient let transactionService = TransactionService.create(users, transactions, transactionsByUser);
  transient let settingsService = SettingsService.create(users, settings, settingsLimits);
  transient let bookmarkService = BookmarkService.create(users, usersById, bookmarks);
  transient let liveService = LiveService.create(
    users, usersById, liveRooms, livePeers, liveSignals, nextUid,
  );
  transient let socialLinkService = SocialLinkService.create(users);
  transient let tokenService = TokenService.create(
    tokens, tokensByLedger, tokensByUser, reservedSymbols, tokenWasm,
    transferService, ledger, users, Principal.fromActor(self), nextUid, launchTokenLimits,
  );
  transient let swapService = SwapService.create(users, transactions, transactionsByUser, ledger, pendingSwaps, failedSwapEscrows, nextUid, swapLimits);
  transient let bucketUploadSessions = BucketService.createUploadSessionStore();
  transient let analyticsService = AnalyticsService.create(users, transactionsByUser, transferService);
  transient let bucketService = BucketService.create(
    users, bucketStore, bucketNameIndex, transferService, nextUid,
    bucketCreateLimits, bucketUploadLimits, bucketRenewLimits, bucketManageLimits, bucketApiKeyLimits,
    bucketUploadSessions,
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
  include SaleApi(saleService, mwConfig);
  include TokenApi(tokenService, mwConfig);
  include TransactionsApi(transactionService, mwConfig);
  include SettingsApi(settingsService, mwConfig);
  include BookmarkApi(bookmarkService, mwConfig);
  include SocialLinkApi(socialLinkService, mwConfig);
  include VerifiedApi(userService);
  include SwapApi(swapService, mwConfig);
  include BucketApi(bucketService, mwConfig);
  include AnalyticsApi(analyticsService, mwConfig);
  include LiveApi(liveService, mwConfig);
  include CloudHttpApi(bucketService);

};
