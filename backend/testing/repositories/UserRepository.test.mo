import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Text "mo:core/Text";
import UserStorage "../../src/storage/UserStorage";
import UserRepo "../../src/repositories/UserRepository";
import Types "../../src/types";
import AccountHelper "../../src/ledger/Account";

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();

let p1 = Principal.fromText("aaaaa-aa");
let p2 = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
let now = Time.now();

let user1 = UserRepo.create(users, usernames, usersById, "user-id-1", p1, null, "Alice", now, null);
assert(user1.id == "user-id-1");
assert(user1.principal == p1);
Debug.print("PASS: create user without username");

let user2 = UserRepo.create(users, usernames, usersById, "user-id-2", p2, ?"bob", "Bob", now, null);
assert(user2.id == "user-id-2");
assert(user2.principal == p2);
assert(user2.username == ?"bob");
Debug.print("PASS: create user with username");

switch (UserRepo.getByPrincipal(users, p1)) {
  case (?u) {
    assert(u.id == "user-id-1");
    Debug.print("PASS: getByPrincipal returns correct user");
  };
  case (null) { assert(false); Debug.print("FAIL: getByPrincipal returned null") };
};

switch (UserRepo.getByUsername(usernames, users, "bob")) {
  case (?u) {
    assert(u.id == "user-id-2");
    Debug.print("PASS: getByUsername returns correct user");
  };
  case (null) { assert(false); Debug.print("FAIL: getByUsername returned null") };
};

switch (UserRepo.getById(usersById, users, "user-id-1")) {
  case (?u) {
    assert(u.id == "user-id-1");
    Debug.print("PASS: getById returns correct user");
  };
  case (null) { assert(false); Debug.print("FAIL: getById returned null") };
};

switch (UserRepo.getByPrincipal(users, Principal.fromText("2vxsx-fae"))) {
  case (?_) { assert(false); Debug.print("FAIL: getByPrincipal returned user for unknown") };
  case (null) { Debug.print("PASS: getByPrincipal returns null for unknown principal") };
};

assert(UserRepo.usernameExists(usernames, "bob") == true);
Debug.print("PASS: usernameExists returns true for taken username");

assert(UserRepo.usernameExists(usernames, "alice") == false);
Debug.print("PASS: usernameExists returns false for available username");

let _ = UserRepo.setUsername(users, usernames, user1, null, "alice", now);
assert(user1.username == ?"alice");
assert(UserRepo.usernameExists(usernames, "alice") == true);
Debug.print("PASS: setUsername adds username to user");

let _ = UserRepo.setUsername(users, usernames, user1, ?"alice", "alice_new", now);
assert(user1.username == ?"alice_new");
assert(UserRepo.usernameExists(usernames, "alice") == false);
assert(UserRepo.usernameExists(usernames, "alice_new") == true);
Debug.print("PASS: setUsername replaces old username");

let results = UserRepo.searchByUsername(usernames, users, "alice", 25);
assert(results.size() == 1);
assert(results[0].username == ?"alice_new");
Debug.print("PASS: searchByUsername finds matching users");

let noResults = UserRepo.searchByUsername(usernames, users, "xyz123", 25);
assert(noResults.size() == 0);
Debug.print("PASS: searchByUsername returns empty for no match");

// An empty needle matches every handle, which is what the suggestion list asks
// for, so it is also the case where an uncapped scan would return the registry.
assert(UserRepo.searchByUsername(usernames, users, "", 25).size() == 2);
assert(UserRepo.searchByUsername(usernames, users, "", 1).size() == 1);
Debug.print("PASS: searchByUsername stops at the cap");

// Paid handles rank ahead of free ones; within a band shorter names come first.
let p3 = Principal.fromText("2vxsx-fae");
let p4 = Principal.fromText("mk4xk-sqaaa-aaaaa-qadjq-cai");
let p5 = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
let p6 = Principal.fromText("qhbym-qaaaa-aaaaa-aaafq-cai");
let _u3 = UserRepo.create(users, usernames, usersById, "user-id-3", p3, ?"1", "One", now, null);
let _u4 = UserRepo.create(users, usernames, usersById, "user-id-4", p4, ?"ba", "Ba", now, null);
let _u5 = UserRepo.create(users, usernames, usersById, "user-id-5", p5, ?"12345", "Long", now, null);
let _u6 = UserRepo.create(users, usernames, usersById, "user-id-6", p6, ?"admin", "Admin", now, null);

let ranked = UserRepo.searchByUsername(usernames, users, "", 10);
let rankedNames = Array.map<Types.UserPublic, Text>(
  ranked,
  func(u) { switch (u.username) { case (?n) n; case (null) "" } },
);
assert(rankedNames.size() >= 4);
assert(rankedNames[0] == "1");
assert(rankedNames[1] == "ba");
assert(rankedNames[2] == "bob");
// Free handles follow paid ones; shorter free names before longer ones.
let idx12345 = Array.indexOf<Text>(rankedNames, Text.equal, "12345");
let idxAdmin = Array.indexOf<Text>(rankedNames, Text.equal, "admin");
switch (idx12345, idxAdmin) {
  case (?i12345, ?iAdmin) {
    assert(i12345 > 2);
    assert(iAdmin > i12345);
  };
  case (_, _) { assert(false) };
};
Debug.print("PASS: searchByUsername ranks paid short handles before free ones");

// A bought handle is added as an alias, leaving the buyer under two keys. The
// listing must still show them once, or one person appears as several identical
// rows and their old handle looks like a separate account.
UserRepo.addAlias(usernames, user1, "alice_bought", now);
assert(UserRepo.usernameExists(usernames, "alice_new") == true);
assert(UserRepo.usernameExists(usernames, "alice_bought") == true);
Debug.print("PASS: addAlias keeps the old handle claimed");

let aliased = UserRepo.searchByUsername(usernames, users, "alice", 25);
assert(aliased.size() == 1);
assert(aliased[0].username == ?"alice_bought");
Debug.print("PASS: searchByUsername lists an aliased user once");

// Both handles must keep resolving to the buyer: people memorise a handle as a
// payment address, so an alias that stopped resolving would misdirect funds.
switch (UserRepo.getByUsername(usernames, users, "alice_new")) {
  case (?u) { assert(u.principal == p1) };
  case (null) { assert(false) };
};
switch (UserRepo.getByUsername(usernames, users, "alice_bought")) {
  case (?u) { assert(u.principal == p1) };
  case (null) { assert(false) };
};
Debug.print("PASS: every alias still resolves to its owner");

let depositSubaccounts = UserStorage.createDepositSubaccountIndex();
let depositAccountIds = UserStorage.createDepositAccountIdIndex();
let custodian = Principal.fromText("aaaaa-aa");
let depositIndex : UserRepo.DepositIndexCtx = {
  subaccounts = depositSubaccounts;
  accountIds = depositAccountIds;
  custodian;
};
UserRepo.reindexDepositAccounts(users, depositIndex);

let p1Account = AccountHelper.custodialAccount(custodian, p1);
let p1Sub = switch (p1Account.subaccount) {
  case (?s) { s };
  case (null) { assert(false); Blob.fromArray([]) };
};
switch (UserRepo.getByDepositSubaccount(depositSubaccounts, users, p1Sub)) {
  case (?u) { assert(u.id == "user-id-1") };
  case (null) { assert(false) };
};
switch (UserRepo.getByDepositAccountId(depositAccountIds, users, AccountHelper.toAccountIdentifier(p1Account))) {
  case (?u) { assert(u.id == "user-id-1") };
  case (null) { assert(false) };
};
Debug.print("PASS: reindexDepositAccounts populates lookup indexes");

Debug.print("ALL USER REPOSITORY TESTS PASSED");
