import Debug "mo:core/Debug";
import TxStorage "../../src/storage/TransactionStorage";
import TxRepo "../../src/repositories/TransactionRepository";

let txs = TxStorage.createTxList();
let now = 1000;
let userId = "user-1";
let otherUserId = "user-2";

let tx1 = TxRepo.create(txs, "tx-1", userId, #deposit, 100_000_000, 0, "alice", "bob", null, now);
assert(tx1.id == "tx-1");
Debug.print("PASS: create deposit transaction");

let tx2 = TxRepo.create(txs, "tx-2", userId, #withdraw, 50_000_000, 10_000, "alice", "carol", null, now);
assert(tx2.id == "tx-2");
Debug.print("PASS: create withdraw transaction");

let tx3 = TxRepo.create(txs, "tx-3", otherUserId, #transfer, 25_000_000, 10_000, "carol", "dave", ?"payment", now);
assert(tx3.id == "tx-3");
Debug.print("PASS: create transfer transaction for other user");

switch (TxRepo.getById(txs, "tx-1")) {
  case (?tx) {
    assert(tx.id == "tx-1");
    Debug.print("PASS: getById finds transaction");
  };
  case (null) { assert(false); Debug.print("FAIL: getById returned null") };
};

switch (TxRepo.getById(txs, "non-existent")) {
  case (?_) { assert(false); Debug.print("FAIL: getById returned non-existent") };
  case (null) { Debug.print("PASS: getById returns null for unknown") };
};

let user1Txs = TxRepo.getByUser(txs, userId, 10, 0);
assert(user1Txs.size() == 2);
Debug.print("PASS: getByUser returns correct count for user-1");

let user2Txs = TxRepo.getByUser(txs, otherUserId, 10, 0);
assert(user2Txs.size() == 1);
Debug.print("PASS: getByUser returns correct count for user-2");

let paginatedTxs = TxRepo.getByUser(txs, userId, 1, 0);
assert(paginatedTxs.size() == 1);
Debug.print("PASS: getByUser pagination (limit=1)");

let offsetTxs = TxRepo.getByUser(txs, userId, 1, 1);
assert(offsetTxs.size() == 1);
Debug.print("PASS: getByUser pagination (offset=1)");

let outOfRangeTxs = TxRepo.getByUser(txs, userId, 10, 10);
assert(outOfRangeTxs.size() == 0);
Debug.print("PASS: getByUser returns empty for offset beyond range");

let recentTxs = TxRepo.getRecentByUser(txs, userId, 1);
assert(recentTxs.size() == 1);
Debug.print("PASS: getRecentByUser returns limited recent items");

let allRecentTxs = TxRepo.getRecentByUser(txs, userId, 10);
assert(allRecentTxs.size() == 2);
Debug.print("PASS: getRecentByUser returns all when count exceeds size");

let completed = TxRepo.completeTx(txs, "tx-1", 42, now);
assert(completed == true);
Debug.print("PASS: completeTx returns true");

switch (TxRepo.getById(txs, "tx-1")) {
  case (?tx) {
    assert(tx.status == #completed);
    assert(tx.blockIndex == ?42);
    Debug.print("PASS: completeTx updates status and blockIndex");
  };
  case (null) { assert(false) };
};

let failedComplete = TxRepo.completeTx(txs, "non-existent", 0, now);
assert(failedComplete == false);
Debug.print("PASS: completeTx returns false for unknown tx");

let failed = TxRepo.failTx(txs, "tx-2", now);
assert(failed == true);
Debug.print("PASS: failTx returns true");

let failedFail = TxRepo.failTx(txs, "non-existent", now);
assert(failedFail == false);
Debug.print("PASS: failTx returns false for unknown tx");

let depositTotal = TxRepo.getTotalDepositAmount(txs, userId);
assert(depositTotal == 100_000_000);
Debug.print("PASS: getTotalDepositAmount for user-1 counts only completed deposits");

let withdrawalTotal = TxRepo.getTotalWithdrawalAmount(txs, userId);
assert(withdrawalTotal == 0);
Debug.print("PASS: getTotalWithdrawalAmount returns 0 for failed withdrawal");

let _ = TxRepo.completeTx(txs, "tx-2", 43, now);
let withdrawalTotal2 = TxRepo.getTotalWithdrawalAmount(txs, userId);
assert(withdrawalTotal2 == 50_000_000);
Debug.print("PASS: getTotalWithdrawalAmount after completing withdrawal");

let transferCount = TxRepo.getTotalTransferCount(txs, otherUserId);
assert(transferCount == 0);
Debug.print("PASS: getTotalTransferCount returns 0 for pending transfer");

let _ = TxRepo.completeTx(txs, "tx-3", 44, now);
let transferCount2 = TxRepo.getTotalTransferCount(txs, otherUserId);
assert(transferCount2 == 1);
Debug.print("PASS: getTotalTransferCount after completing transfer");

let userDeposits = TxRepo.getUserDeposits(txs, userId);
assert(userDeposits.size() == 1);
Debug.print("PASS: getUserDeposits returns deposit transactions");

let userWithdrawals = TxRepo.getUserWithdrawals(txs, userId);
assert(userWithdrawals.size() == 1);
Debug.print("PASS: getUserWithdrawals returns withdrawal transactions");

let userTransfers = TxRepo.getUserTransfers(txs, otherUserId);
assert(userTransfers.size() == 1);
Debug.print("PASS: getUserTransfers returns transfer transactions");

let txCount = TxRepo.getUserTxCount(txs, userId);
assert(txCount == 2);
Debug.print("PASS: getUserTxCount returns correct count");

let emptyTxs = TxStorage.createTxList();
let emptyUserTxs = TxRepo.getByUser(emptyTxs, userId, 10, 0);
assert(emptyUserTxs.size() == 0);
Debug.print("PASS: getByUser on empty list returns empty");

let emptyRecent = TxRepo.getRecentByUser(emptyTxs, userId, 10);
assert(emptyRecent.size() == 0);
Debug.print("PASS: getRecentByUser on empty list returns empty");

Debug.print("ALL TRANSACTION REPOSITORY TESTS PASSED");
