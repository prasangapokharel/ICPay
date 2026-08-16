import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import UserStorage "../../src/storage/UserStorage";
import UserService "../../src/services/UserService";
import UserRepo "../../src/repositories/UserRepository";
import ReservedStorage "../../src/storage/ReservedUsernameStorage";
import ReservedRepo "../../src/repositories/ReservedUsernameRepository";
import RateLimitStorage "../../src/storage/RateLimitStorage";

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();
let reserved = ReservedStorage.createReservedUsernameSet();
let svc = UserService.create(users, usernames, usersById, reserved, RateLimitStorage.createRateLimitMap());

let p1 = Principal.fromText("aaaaa-aa");
let p2 = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
let now = Time.now();

let _u1 = UserRepo.create(users, usernames, usersById, "uid-1", p1, null, "Alice", now, null);
let _u2 = UserRepo.create(users, usernames, usersById, "uid-2", p2, ?"bob", "Bob", now, null);

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

switch (UserService.updateUsername(svc, p1, "alice2")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: username must be permanent once claimed") };
  case (#err(msg)) { Debug.print("PASS: second claim rejected: " # msg) };
};

// Every remaining claim check needs a principal that has not claimed yet,
// otherwise the permanence rule short-circuits before the check under test.
let p3 = Principal.fromText("r7inp-6aaaa-aaaaa-aaabq-cai");
let _u3 = UserRepo.create(users, usernames, usersById, "uid-3", p3, null, "Carol", now, null);

switch (UserService.updateUsername(svc, p3, "bob")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: updateUsername should reject taken name") };
  case (#err(msg)) { Debug.print("PASS: taken username rejected on update: " # msg) };
};

switch (UserService.updateUsername(svc, p3, "BOB")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: uniqueness must be case-insensitive") };
  case (#err(msg)) { Debug.print("PASS: case variant of taken name rejected: " # msg) };
};

switch (UserService.updateUsername(svc, p3, "ab")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: updateUsername should reject short name") };
  case (#err(msg)) { Debug.print("PASS: short username rejected: " # msg) };
};

switch (UserService.updateUsername(svc, Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"), "newuser")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: updateUsername should reject unknown user") };
  case (#err(msg)) { Debug.print("PASS: updateUsername for unknown user rejected: " # msg) };
};

let available = UserService.checkAvailability(svc, "availab");
assert(available == true);
Debug.print("PASS: checkAvailability returns true for available name");

let notAvailable = UserService.checkAvailability(svc, "bob");
assert(notAvailable == false);
Debug.print("PASS: checkAvailability returns false for taken name");

let invalidCheck = UserService.checkAvailability(svc, "a b");
assert(invalidCheck == false);
Debug.print("PASS: checkAvailability returns false for invalid name");

// A short name is well-formed and unclaimed, so it reports available: it is
// simply not free. Price, not availability, is what gates it.
let shortAvailable = UserService.checkAvailability(svc, "ab");
assert(shortAvailable == true);
Debug.print("PASS: a short unclaimed name is available to buy");

let caseVariantTaken = UserService.checkAvailability(svc, "BoB");
assert(caseVariantTaken == false);
Debug.print("PASS: checkAvailability is case-insensitive");

ReservedRepo.reserve(reserved, "dfinity");
assert(UserService.checkAvailability(svc, "dfinity") == false);
assert(UserService.checkAvailability(svc, "DFINITY") == false);
Debug.print("PASS: reserved names report unavailable in any case");

switch (UserService.updateUsername(svc, p3, "dfinity")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: reserved name must be rejected") };
  case (#err(msg)) { Debug.print("PASS: reserved username rejected: " # msg) };
};

ReservedRepo.release(reserved, "dfinity");
switch (UserService.updateUsername(svc, p3, "dfinity")) {
  case (#ok(profile)) {
    assert(profile.username == ?"dfinity");
    Debug.print("PASS: released name becomes claimable");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL: released name still blocked: " # msg) };
};

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

assert (UserService.usernameCount(svc) == 3);
Debug.print("PASS: usernameCount = 3 (alice, bob, dfinity)");

assert(UserService.getVerifiedTier(svc, "uid-2") == ?#ultra);
Debug.print("PASS: getVerifiedTier reports the tier of a claimed handle");

assert(UserService.getVerifiedTier(svc, "uid-3") == ?#basic);
Debug.print("PASS: getVerifiedTier reflects a later claim, not just the first");

// 5 chars is the first free length, so it is the boundary the badge rule cares
// about: standard and basic are paid tiers in name only.
assert(UserService.getVerifiedTier(svc, "uid-1") == ?#standard);
Debug.print("PASS: getVerifiedTier reports #standard at the free-claim boundary");

assert(UserService.getVerifiedTier(svc, "no-such-id") == null);
Debug.print("PASS: getVerifiedTier returns null for an unknown user id");

// Null rather than #basic: an account that has claimed nothing has no badge,
// and #basic would render one on every user who never picked a handle.
let p4 = Principal.fromText("rno2w-sqaaa-aaaaa-aaacq-cai");
let _u4 = UserRepo.create(users, usernames, usersById, "uid-4", p4, null, "Dave", now, null);
assert(UserService.getVerifiedTier(svc, "uid-4") == null);
Debug.print("PASS: getVerifiedTier returns null for a user with no handle");

Debug.print("ALL USER SERVICE TESTS PASSED");
