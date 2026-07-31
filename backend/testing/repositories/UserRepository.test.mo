import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import UserStorage "../../src/storage/UserStorage";
import UserRepo "../../src/repositories/UserRepository";

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();

let p1 = Principal.fromText("aaaaa-aa");
let p2 = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
let now = Time.now();

let user1 = UserRepo.create(users, usernames, usersById, "user-id-1", p1, null, "Alice", now);
assert(user1.id == "user-id-1");
assert(user1.principal == p1);
Debug.print("PASS: create user without username");

let user2 = UserRepo.create(users, usernames, usersById, "user-id-2", p2, ?"bob", "Bob", now);
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

let results = UserRepo.searchByUsername(usernames, users, "alice");
assert(results.size() == 1);
assert(results[0].username == ?"alice_new");
Debug.print("PASS: searchByUsername finds matching users");

let noResults = UserRepo.searchByUsername(usernames, users, "xyz123");
assert(noResults.size() == 0);
Debug.print("PASS: searchByUsername returns empty for no match");

Debug.print("ALL USER REPOSITORY TESTS PASSED");
