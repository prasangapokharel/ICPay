import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";
import UserStorage "../../src/storage/UserStorage";
import TxStorage "../../src/storage/TransactionStorage";
import SettingsStorage "../../src/storage/SettingsStorage";
import AuthService "../../src/services/AuthService";
import UserService "../../src/services/UserService";
import TransactionService "../../src/services/TransactionService";
import SettingsService "../../src/services/SettingsService";
import ReservedStorage "../../src/storage/ReservedUsernameStorage";
import RateLimitStorage "../../src/storage/RateLimitStorage";

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();
let reserved = ReservedStorage.createReservedUsernameSet();
let txs = TxStorage.createTxList();
let txsByUser = TxStorage.createTxByUser();
let settingsMap = SettingsStorage.createSettingsMap();

let p1 = Principal.fromText("aaaaa-aa");
let p2 = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");

var uidCounter = 0;
func nextUid(): Text {
  uidCounter += 1;
  Time.now().toText() # "-" # Int.toText(uidCounter);
};

let auth = AuthService.create(users, usernames, usersById, reserved, nextUid, RateLimitStorage.createRateLimitMap());
let userSvc = UserService.create(users, usernames, usersById, reserved, RateLimitStorage.createRateLimitMap());
let txSvc = TransactionService.create(users, txs, txsByUser);
let settingsSvc = SettingsService.create(users, settingsMap, RateLimitStorage.createRateLimitMap());

switch (AuthService.login(auth, p1)) {
  case (#ok(result)) {
    assert(result.isNew == true);
    assert(result.user.username == null);
    Debug.print("PASS [FLOW]: user1 login creates profile");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL [FLOW]: user1 login: " # msg) };
};

switch (AuthService.register(auth, p1, "alice")) {
  case (#ok(result)) {
    assert(result.isNew == false);
    assert(result.user.username == ?"alice");
    Debug.print("PASS [FLOW]: user1 registers username");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL [FLOW]: user1 register: " # msg) };
};

switch (AuthService.login(auth, p2)) {
  case (#ok(result)) {
    assert(result.isNew == true);
    Debug.print("PASS [FLOW]: user2 login creates profile");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL [FLOW]: user2 login: " # msg) };
};

switch (UserService.updateUsername(userSvc, p2, "bobby")) {
  case (#ok(result)) {
    assert(result.username == ?"bobby");
    Debug.print("PASS [FLOW]: user2 updates username");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL [FLOW]: user2 username: " # msg) };
};

switch (UserService.resolveUsername(userSvc, "alice")) {
  case (?p) {
    assert(p == p1);
    Debug.print("PASS [FLOW]: resolve alice -> user1");
  };
  case (null) { assert(false); Debug.print("FAIL [FLOW]: resolve alice failed") };
};

switch (UserService.resolveUsername(userSvc, "bobby")) {
  case (?p) {
    assert(p == p2);
    Debug.print("PASS [FLOW]: resolve bob -> user2");
  };
  case (null) { assert(false); Debug.print("FAIL [FLOW]: resolve bob failed") };
};

let userSearch = UserService.search(userSvc, "ali");
assert(userSearch.size() >= 1);
Debug.print("PASS [FLOW]: search 'ali' finds " # debug_show userSearch.size() # " result(s)");

switch (TransactionService.getDetail(txSvc, p1, "non-existent")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL [FLOW]: should not find non-existent tx") };
  case (#err(msg)) { Debug.print("PASS [FLOW]: non-existent tx lookup returns error: " # msg) };
};

switch (SettingsService.getSettings(settingsSvc, p1)) {
  case (#ok(s)) {
    assert(s.theme == "light");
    Debug.print("PASS [FLOW]: user1 gets default settings");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL [FLOW]: settings: " # msg) };
};

switch (SettingsService.updateSettings(settingsSvc, p1, "dark", "ja", false)) {
  case (#ok(s)) {
    assert(s.theme == "dark");
    assert(s.language == "ja");
    assert(s.notifications == false);
    Debug.print("PASS [FLOW]: user1 updates settings");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL [FLOW]: update settings: " # msg) };
};

switch (SettingsService.getSettings(settingsSvc, p1)) {
  case (#ok(s)) {
    assert(s.theme == "dark");
    Debug.print("PASS [FLOW]: user1 settings persisted");
  };
  case (#err(_)) { assert(false) };
};

switch (UserService.getProfile(userSvc, p1)) {
  case (?profile) {
    assert(profile.username == ?"alice");
    Debug.print("PASS [FLOW]: user1 profile matches");
  };
  case (null) { assert(false) };
};

switch (UserService.getProfile(userSvc, p2)) {
  case (?profile) {
    assert(profile.username == ?"bobby");
    Debug.print("PASS [FLOW]: user2 profile matches");
  };
  case (null) { assert(false) };
};

switch (UserService.updateUsername(userSvc, p1, "alice_2")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL [FLOW]: username must be permanent") };
  case (#err(_)) { Debug.print("PASS [FLOW]: user1 cannot rename after claiming") };
};

switch (UserService.resolveUsername(userSvc, "alice")) {
  case (?p) {
    assert(p == p1);
    Debug.print("PASS [FLOW]: original username still resolves to user1");
  };
  case (null) { assert(false); Debug.print("FAIL [FLOW]: claimed username stopped resolving") };
};

switch (UserService.checkAvailability(userSvc, "alice_2")) {
  case (true) { Debug.print("PASS [FLOW]: rejected name was never claimed") };
  case (false) { assert(false); Debug.print("FAIL [FLOW]: rejected name must stay free") };
};

switch (UserService.checkAvailability(userSvc, "alice")) {
  case (false) { Debug.print("PASS [FLOW]: claimed username stays permanently taken") };
  case (true) { assert(false); Debug.print("FAIL [FLOW]: claimed username must never free up") };
};

Debug.print("ALL INTEGRATION FLOW TESTS PASSED");
