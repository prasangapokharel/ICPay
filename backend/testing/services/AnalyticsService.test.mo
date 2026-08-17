import Debug "mo:core/Debug";
import Text "mo:core/Text";
import Nat64 "mo:core/Nat64";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import UserStorage "../../src/storage/UserStorage";
import TxStorage "../../src/storage/TransactionStorage";
import TxRepo "../../src/repositories/TransactionRepository";
import UserRepo "../../src/repositories/UserRepository";
import AnalyticsService "../../src/services/AnalyticsService";
import TransferService "../../src/services/TransferService";
import RateLimitStorage "../../src/storage/RateLimitStorage";
import LedgerStorage "../../src/storage/LedgerStorage";
import LedgerService "../../src/services/LedgerService";
import UsernameValidator "../../src/validators/UsernameValidator";

assert (UsernameValidator.hasAnalyticsAccess("a"));
assert (UsernameValidator.hasAnalyticsAccess("abcd"));
assert (not UsernameValidator.hasAnalyticsAccess("alice"));
assert (not UsernameValidator.hasAnalyticsAccess(""));
Debug.print("PASS [ANALYTICS]: username tier gate");

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();
let txs = TxStorage.createTxList();
let txsByUser = TxStorage.createTxByUser();
let limits = RateLimitStorage.createRateLimitMap();
let ledgerRegistry = LedgerStorage.createLedgerRegistry();
let ledger = LedgerService.create(Principal.fromText("aaaaa-aa"), ledgerRegistry);
let depositSubaccounts = UserStorage.createDepositSubaccountIndex();
let depositAccountIds = UserStorage.createDepositAccountIdIndex();
var uid = 0;
func nextUid(): Text { uid += 1; "id-" # debug_show(uid) };

let transfers = TransferService.create(
  users, usernames, txs, txsByUser, ledger, nextUid, limits, depositSubaccounts, depositAccountIds,
);
let svc = AnalyticsService.create(users, txsByUser, transfers);

let p = Principal.fromText("2vxsx-fae");
let now = Time.now();
let icp = "ryjl3-tyaaa-aaaaa-aaaba-cai";

let _free = UserRepo.create(users, usernames, usersById, "uid-free", p, ?"alice", "Free User", now, null);
switch (AnalyticsService.getUserAnalytics(svc, p)) {
  case (#ok(_)) { assert(false) };
  case (#err(msg)) {
    assert Text.contains(msg, #text "premium");
    Debug.print("PASS [ANALYTICS]: free-length username rejected");
  };
};

let p2 = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
let _paid = UserRepo.create(users, usernames, usersById, "uid-paid", p2, ?"ab", "Paid User", now, null);
let _tx1 = TxRepo.create(txs, txsByUser, "tx-1", "uid-paid", #deposit, icp, 100_000_000, 0, "@sender", "to", null, now);
assert TxRepo.completeTx(txs, "tx-1", Nat64.fromNat(1), now);
let _tx2 = TxRepo.create(txs, txsByUser, "tx-2", "uid-paid", #transfer, icp, 25_000_000, 10_000, "from", "@bob", ?"Tip", now);
assert TxRepo.completeTx(txs, "tx-2", Nat64.fromNat(2), now);

switch (AnalyticsService.getUserAnalytics(svc, p2)) {
  case (#ok(data)) {
    assert data.summary.totalReceivedE8s == 100_000_000;
    assert data.summary.totalSentE8s == 25_010_000;
    assert data.summary.tipCount == 1;
    assert data.summary.freeExport == true;
    assert data.rows.size() == 2;
    Debug.print("PASS [ANALYTICS]: summary and rows for premium handle");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL [ANALYTICS]: " # msg) };
};

// Swap legs store token-native amounts — must not inflate ICP Received/Sent totals.
let token = "aaaaa-aa";
let _swapOut = TxRepo.create(
  txs, txsByUser, "tx-swap-out", "uid-paid", #swapOut, token, 50_000_075_824_950_000, 0,
  icp, "ckBTC", null, now,
);
assert TxRepo.completeTx(txs, "tx-swap-out", Nat64.fromNat(3), now);
let _swapIn = TxRepo.create(
  txs, txsByUser, "tx-swap-in", "uid-paid", #swapIn, token, 303_088_018_000_000, 0,
  icp, "ckBTC", null, now,
);
assert TxRepo.completeTx(txs, "tx-swap-in", Nat64.fromNat(4), now);

switch (AnalyticsService.getUserAnalytics(svc, p2)) {
  case (#ok(data)) {
    assert data.summary.totalReceivedE8s == 100_000_000;
    assert data.summary.totalSentE8s == 25_010_000;
    assert data.summary.swapInCount == 1;
    assert data.summary.swapOutCount == 1;
    Debug.print("PASS [ANALYTICS]: swap token amounts excluded from ICP totals");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL [ANALYTICS]: " # msg) };
};

Debug.print("ALL ANALYTICS TESTS PASSED");
