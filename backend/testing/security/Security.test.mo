import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";
import UserStorage "../../src/storage/UserStorage";
import TxStorage "../../src/storage/TransactionStorage";
import SettingsStorage "../../src/storage/SettingsStorage";
import AuthService "../../src/services/AuthService";
import UserService "../../src/services/UserService";
import UserRepo "../../src/repositories/UserRepository";
import TxRepo "../../src/repositories/TransactionRepository";
import TransactionService "../../src/services/TransactionService";
import SettingsService "../../src/services/SettingsService";
import AmountValidator "../../src/validators/AmountValidator";
import PrincipalValidator "../../src/validators/PrincipalValidator";
import UsernameValidator "../../src/validators/UsernameValidator";
import TransferValidator "../../src/validators/TransferValidator";
import AccountValidator "../../src/validators/AccountValidator";
import ReservedStorage "../../src/storage/ReservedUsernameStorage";
import RateLimitStorage "../../src/storage/RateLimitStorage";

let anon = Principal.fromText("2vxsx-fae");

switch (PrincipalValidator.validate(anon)) {
  case (?err) { Debug.print("PASS [SEC]: anonymous principal rejected: " # err) };
  case (null) { assert(false); Debug.print("FAIL [SEC]: anonymous principal accepted") };
};

let user1Principal = Principal.fromText("aaaaa-aa");
let user2Principal = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
let now = Time.now();
var uidCounter = 0;
func nextUid(): Text {
  uidCounter += 1;
  Time.now().toText() # "-" # Int.toText(uidCounter);
};

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();
let reserved = ReservedStorage.createReservedUsernameSet();
let txs = TxStorage.createTxList();
let txsByUser = TxStorage.createTxByUser();
let settingsMap = SettingsStorage.createSettingsMap();
let icp = "ryjl3-tyaaa-aaaaa-aaaba-cai";

let u1 = UserRepo.create(users, usernames, usersById, "uid-1", user1Principal, ?"alice", "Alice", now);
let _u2 = UserRepo.create(users, usernames, usersById, "uid-2", user2Principal, ?"bob", "Bob", now);

let userSvc = UserService.create(users, usernames, usersById, reserved, RateLimitStorage.createRateLimitMap());
switch (UserService.getProfile(userSvc, anon)) {
  case (?_) { assert(false); Debug.print("FAIL [SEC]: anonymous should not get profile") };
  case (null) { Debug.print("PASS [SEC]: anonymous profile lookup returns null") };
};

switch (UserService.updateUsername(userSvc, user1Principal, "bob")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL [SEC]: should not allow duplicate username") };
  case (#err(msg)) { Debug.print("PASS [SEC]: duplicate username rejected: " # msg) };
};

let txService = TransactionService.create(users, txs, txsByUser);
switch (TransactionService.getDetail(txService, user1Principal, "non-existent")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL [SEC]: should not find non-existent tx") };
  case (#err(msg)) { Debug.print("PASS [SEC]: non-existent tx rejected: " # msg) };
};

let _tx1 = TxRepo.create(txs, txsByUser, "tx-1", "uid-2", #deposit, icp, 100_000_000, 0, "bob", "bob", null, now);
switch (TransactionService.getDetail(txService, user1Principal, "tx-1")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL [SEC]: user1 accessed user2's transaction") };
  case (#err(msg)) { Debug.print("PASS [SEC]: cross-user tx access rejected: " # msg) };
};

switch (AmountValidator.validate(0)) {
  case (?err) { Debug.print("PASS [SEC]: zero amount rejected: " # err) };
  case (null) { assert(false); Debug.print("FAIL [SEC]: zero amount accepted") };
};

// Phase 3: there is no minimum transfer size tied to a fee. An amount below
// the old ICP fee is now valid; insufficient funds are the ledger's call.
switch (AmountValidator.validate(9_999)) {
  case (?err) { assert(false); Debug.print("FAIL [SEC]: 9_999 (below ICP fee) rejected: " # err) };
  case (null) { Debug.print("PASS [SEC]: amount below ICP fee accepted") };
};

switch (UsernameValidator.validate("")) {
  case (?err) { Debug.print("PASS [SEC]: empty username rejected: " # err) };
  case (null) { assert(false); Debug.print("FAIL [SEC]: empty username accepted") };
};

switch (UsernameValidator.validate("user name")) {
  case (?err) { Debug.print("PASS [SEC]: username with spaces rejected: " # err) };
  case (null) { assert(false); Debug.print("FAIL [SEC]: username with spaces accepted") };
};

switch (UsernameValidator.validate("<script>")) {
  case (?err) { Debug.print("PASS [SEC]: XSS attempt rejected: " # err) };
  case (null) { assert(false); Debug.print("FAIL [SEC]: XSS attempt accepted") };
};

switch (TransferValidator.validateDestination("")) {
  case (?err) { Debug.print("PASS [SEC]: empty destination rejected: " # err) };
  case (null) { assert(false); Debug.print("FAIL [SEC]: empty destination accepted") };
};

switch (TransferValidator.validateSelfTransfer(user1Principal, u1)) {
  case (?err) { Debug.print("PASS [SEC]: self-transfer rejected: " # err) };
  case (null) { assert(false); Debug.print("FAIL [SEC]: self-transfer accepted") };
};

switch (AccountValidator.validatePrincipal(anon)) {
  case (?err) { Debug.print("PASS [SEC]: anonymous account rejected: " # err) };
  case (null) { assert(false); Debug.print("FAIL [SEC]: anonymous account accepted") };
};

switch (AccountValidator.validateAccountId("")) {
  case (?err) { Debug.print("PASS [SEC]: empty account ID rejected: " # err) };
  case (null) { assert(false); Debug.print("FAIL [SEC]: empty account ID accepted") };
};

let searchResult = UserService.search(userSvc, "alice");
assert(searchResult.size() == 1);
assert(searchResult[0].username == ?"alice");
Debug.print("PASS [SEC]: search returns only matching users");

let authService = AuthService.create(users, usernames, usersById, reserved, nextUid, RateLimitStorage.createRateLimitMap());
switch (AuthService.login(authService, anon)) {
  case (#ok(_)) { assert(false); Debug.print("FAIL [SEC]: anonymous login accepted") };
  case (#err(msg)) { Debug.print("PASS [SEC]: anonymous login rejected: " # msg) };
};

switch (AuthService.register(authService, anon, "attacker")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL [SEC]: anonymous register accepted") };
  case (#err(msg)) { Debug.print("PASS [SEC]: anonymous register rejected: " # msg) };
};

let settingsService = SettingsService.create(users, settingsMap, RateLimitStorage.createRateLimitMap());switch (SettingsService.getSettings(settingsService, anon)) {
  case (#ok(_)) { assert(false); Debug.print("FAIL [SEC]: anonymous settings access accepted") };
  case (#err(msg)) { Debug.print("PASS [SEC]: anonymous settings access rejected: " # msg) };
};

Debug.print("ALL SECURITY TESTS PASSED");
