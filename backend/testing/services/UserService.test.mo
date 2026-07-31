import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import UserStorage "../../src/storage/UserStorage";
import UserService "../../src/services/UserService";
import UserRepo "../../src/repositories/UserRepository";

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();
let svc = UserService.create(users, usernames, usersById);

let p1 = Principal.fromText("aaaaa-aa");
let p2 = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
let now = Time.now();

let _u1 = UserRepo.create(users, usernames, usersById, "uid-1", p1, null, "Alice", now);
let _u2 = UserRepo.create(users, usernames, usersById, "uid-2", p2, ?"bob", "Bob", now);

switch (UserService.getProfile(svc, p1)) {
  case (?profile) {
    assert(profile.id == "uid-1");
    Debug.print("PASS: getProfile returns profile for known user");
  };
  case (null) { assert(false); Debug.print("FAIL: getProfile returned null") };
};

switch (UserService.getProfile(svc, Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"))) {
  case (?_) { assert(false); Debug.print("FAIL: getProfile returned profile for unknown") };
  case (null) { Debug.print("PASS: getProfile returns null for unknown user") };
};

switch (UserService.updateUsername(svc, p1, "alice")) {
  case (#ok(profile)) {
    assert(profile.username == ?"alice");
    Debug.print("PASS: updateUsername successfully updates");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL: updateUsername failed: " # msg) };
};

switch (UserService.updateUsername(svc, p1, "bob")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: updateUsername should reject taken name") };
  case (#err(msg)) { Debug.print("PASS: taken username rejected on update: " # msg) };
};

switch (UserService.updateUsername(svc, p1, "ab")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: updateUsername should reject short name") };
  case (#err(msg)) { Debug.print("PASS: short username rejected: " # msg) };
};

switch (UserService.updateUsername(svc, Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"), "newuser")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: updateUsername should reject unknown user") };
  case (#err(msg)) { Debug.print("PASS: updateUsername for unknown user rejected: " # msg) };
};

let available = UserService.checkAvailability(svc, "availableuser");
assert(available == true);
Debug.print("PASS: checkAvailability returns true for available name");

let notAvailable = UserService.checkAvailability(svc, "bob");
assert(notAvailable == false);
Debug.print("PASS: checkAvailability returns false for taken name");

let invalidCheck = UserService.checkAvailability(svc, "ab");
assert(invalidCheck == false);
Debug.print("PASS: checkAvailability returns false for invalid name");

let results = UserService.search(svc, "ali");
assert(results.size() == 1);
assert(results[0].username == ?"alice");
Debug.print("PASS: search finds matching usernames");

let noResults = UserService.search(svc, "zzz");
assert(noResults.size() == 0);
Debug.print("PASS: search returns empty for no matches");

switch (UserService.resolveUsername(svc, "bob")) {
  case (?p) {
    assert(p == p2);
    Debug.print("PASS: resolveUsername returns correct principal");
  };
  case (null) { assert(false); Debug.print("FAIL: resolveUsername returned null for existing") };
};

switch (UserService.resolveUsername(svc, "nonexistent")) {
  case (?_) { assert(false); Debug.print("FAIL: resolveUsername returned principal for unknown") };
  case (null) { Debug.print("PASS: resolveUsername returns null for unknown username") };
};

Debug.print("ALL USER SERVICE TESTS PASSED");
