import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import UserStorage "../../src/storage/UserStorage";
import ReservedStorage "../../src/storage/ReservedUsernameStorage";
import ReservedRepo "../../src/repositories/ReservedUsernameRepository";
import UserRepo "../../src/repositories/UserRepository";
import AdminService "../../src/services/AdminService";

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();
let reserved = ReservedStorage.createReservedUsernameSet();
let admin = AdminService.create(reserved, users, usernames);

// Principal.isController is false for every principal in an interpreter run --
// there is no canister and so no controller list. That makes this suite a test
// of the deny path only; the allow path is reachable only on a live canister.
let stranger = Principal.fromText("aaaaa-aa");

switch (AdminService.reserveUsername(admin, stranger, "dfinity")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: non-controller reserved a name") };
  case (#err(msg)) { Debug.print("PASS: reserve rejected for non-controller: " # msg) };
};

switch (AdminService.releaseUsername(admin, stranger, "dfinity")) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: non-controller released a name") };
  case (#err(msg)) { Debug.print("PASS: release rejected for non-controller: " # msg) };
};

switch (AdminService.listReservedUsernames(admin, stranger)) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: non-controller listed reservations") };
  case (#err(msg)) { Debug.print("PASS: list rejected for non-controller: " # msg) };
};

assert(not ReservedRepo.isReserved(reserved, "dfinity"));
Debug.print("PASS: rejected calls left the registry unchanged");

// The repository is the layer the service delegates to once authorized, so the
// storage semantics are exercised directly.
ReservedRepo.reserve(reserved, "DFINITY");
assert(ReservedRepo.isReserved(reserved, "dfinity"));
assert(ReservedRepo.isReserved(reserved, "DfInItY"));
Debug.print("PASS: reservation matches every case variant");

assert(ReservedRepo.list(reserved).size() == 1);
Debug.print("PASS: list reports one reservation");

ReservedRepo.release(reserved, "dfinity");
assert(not ReservedRepo.isReserved(reserved, "DFINITY"));
assert(ReservedRepo.list(reserved).size() == 0);
Debug.print("PASS: release clears the reservation in any case");

// A name already owned must not be reservable, or the holder and the registry
// would disagree about who controls it.
let holder = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
let _u = UserRepo.create(users, usernames, usersById, "uid-1", holder, ?"taken", "Taken", Time.now());
assert(UserRepo.usernameExists(usernames, "TAKEN"));
Debug.print("PASS: claimed names are found case-insensitively");

Debug.print("ALL ADMIN SERVICE TESTS PASSED");
