import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";
import UserStorage "../../src/storage/UserStorage";
import AuthService "../../src/services/AuthService";
import ReservedStorage "../../src/storage/ReservedUsernameStorage";
import RateLimitStorage "../../src/storage/RateLimitStorage";

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();
let reserved = ReservedStorage.createReservedUsernameSet();
var uidCounter = 0;
func nextUid(): Text {
  uidCounter += 1;
  Time.now().toText() # "-" # Int.toText(uidCounter);
};
let auth = AuthService.create(users, usernames, usersById, reserved, nextUid, RateLimitStorage.createRateLimitMap(), null);

let anon = Principal.fromText("2vxsx-fae");
switch (AuthService.login(auth, anon)) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: login should reject anonymous") };
  case (#err(msg)) { Debug.print("PASS: anonymous login rejected: " # msg) };
};

let userPrincipal = Principal.fromText("aaaaa-aa");
switch (AuthService.login(auth, userPrincipal)) {
  case (#ok(result)) {
    assert(result.isNew == true);
    assert(result.user.displayName == "");
    assert(result.user.username == null);
    Debug.print("PASS: first login creates new user");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL: first login failed: " # msg) };
};

switch (AuthService.login(auth, userPrincipal)) {
  case (#ok(result)) {
    assert(result.isNew == false);
    Debug.print("PASS: second login returns existing user");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL: second login failed: " # msg) };
};

switch (AuthService.register(auth, anon, "testuser")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: register should reject anonymous") };
  case (#err(msg)) { Debug.print("PASS: anonymous register rejected: " # msg) };
};

let newUserPrincipal = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
switch (AuthService.register(auth, newUserPrincipal, "testuser")) {
  case (#ok(result)) {
    assert(result.isNew == true);
    assert(result.user.username == ?"testuser");
    Debug.print("PASS: register creates user with username");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL: register failed: " # msg) };
};

switch (AuthService.register(auth, userPrincipal, "another")) {
  case (#ok(result)) {
    assert(result.isNew == false);
    assert(result.user.username == ?"another");
    Debug.print("PASS: register adds username to existing user");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL: register for existing user failed: " # msg) };
};

switch (AuthService.register(auth, userPrincipal, "testuser")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: register should reject taken username") };
  case (#err(msg)) { Debug.print("PASS: taken username rejected: " # msg) };
};

switch (AuthService.register(auth, Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"), "ab")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: register should reject short username") };
  case (#err(msg)) { Debug.print("PASS: short username rejected on register: " # msg) };
};

Debug.print("ALL AUTH SERVICE TESTS PASSED");
