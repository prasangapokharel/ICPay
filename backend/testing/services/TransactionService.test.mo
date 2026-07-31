import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import UserStorage "../../src/storage/UserStorage";
import TxStorage "../../src/storage/TransactionStorage";
import TransactionService "../../src/services/TransactionService";
import UserRepo "../../src/repositories/UserRepository";
import TxRepo "../../src/repositories/TransactionRepository";

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();
let txs = TxStorage.createTxList();
let svc = TransactionService.create(users, txs);

let unknownUser = Principal.fromText("2vxsx-fae");
switch (TransactionService.list(svc, unknownUser, 0, 20)) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: list should reject unknown user") };
  case (#err(msg)) { Debug.print("PASS: list for unknown user rejected: " # msg) };
};

let p = Principal.fromText("aaaaa-aa");
let now = Time.now();
let _ = UserRepo.create(users, usernames, usersById, "uid-1", p, null, "Alice", now);

let _tx1 = TxRepo.create(txs, "tx-1", "uid-1", #deposit, 100_000_000, 0, "from", "to", null, now);
let _tx2 = TxRepo.create(txs, "tx-2", "uid-1", #withdraw, 50_000_000, 10_000, "from", "to", null, now);
let _tx3 = TxRepo.create(txs, "tx-3", "uid-1", #transfer, 25_000_000, 10_000, "from", "to", ?"memo", now);

switch (TransactionService.list(svc, p, 0, 20)) {
  case (#ok(result)) {
    assert(result.total == 3);
    assert(result.items.size() == 3);
    assert(result.page == 0);
    assert(result.pageSize == 20);
    Debug.print("PASS: list returns all transactions");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL: list failed: " # msg) };
};

switch (TransactionService.list(svc, p, 0, 2)) {
  case (#ok(result)) {
    assert(result.items.size() == 2);
    assert(result.total == 3);
    Debug.print("PASS: list pagination (pageSize=2)");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL: list pagination failed: " # msg) };
};

switch (TransactionService.list(svc, p, 1, 2)) {
  case (#ok(result)) {
    assert(result.items.size() == 1);
    assert(result.page == 1);
    Debug.print("PASS: list pagination (page=1)");
  };
  case (#err(msg)) { assert(false) };
};

switch (TransactionService.list(svc, p, 5, 10)) {
  case (#ok(result)) {
    assert(result.items.size() == 0);
    Debug.print("PASS: list returns empty for page beyond range");
  };
  case (#err(msg)) { assert(false) };
};

switch (TransactionService.getDetail(svc, p, "tx-1")) {
  case (#ok(tx)) {
    assert(tx.id == "tx-1");
    assert(tx.txType == #deposit);
    Debug.print("PASS: getDetail returns correct transaction");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL: getDetail failed: " # msg) };
};

switch (TransactionService.getDetail(svc, p, "non-existent")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: getDetail should reject unknown tx") };
  case (#err(msg)) { Debug.print("PASS: getDetail for unknown tx rejected: " # msg) };
};

switch (TransactionService.getDetail(svc, Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"), "tx-1")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: getDetail should reject other user's tx") };
  case (#err(msg)) { Debug.print("PASS: getDetail for other user's tx rejected: " # msg) };
};

let url = TransactionService.getExplorerUrl("tx-1");
assert(url == "https://dashboard.internetcomputer.org/transaction/tx-1");
Debug.print("PASS: getExplorerUrl returns correct URL");

Debug.print("ALL TRANSACTION SERVICE TESTS PASSED");
