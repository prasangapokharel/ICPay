import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import UserStorage "../../src/storage/UserStorage";
import SettingsStorage "../../src/storage/SettingsStorage";
import SettingsService "../../src/services/SettingsService";
import UserRepo "../../src/repositories/UserRepository";
import RateLimitStorage "../../src/storage/RateLimitStorage";

let users = UserStorage.createUserMap();
let settings = SettingsStorage.createSettingsMap();
let svc = SettingsService.create(users, settings, RateLimitStorage.createRateLimitMap());

let unknownUser = Principal.fromText("2vxsx-fae");
switch (SettingsService.getSettings(svc, unknownUser)) {
  case (#ok(_)) { assert(false); Debug.print("FAIL: getSettings should reject unknown user") };
  case (#err(msg)) { Debug.print("PASS: getSettings for unknown user rejected: " # msg) };
};

let p = Principal.fromText("aaaaa-aa");
let now = Time.now();
let _ = UserRepo.create(users, UserStorage.createUsernameMap(), UserStorage.createUserIdMap(), "uid-1", p, null, "Alice", now, null);

switch (SettingsService.getSettings(svc, p)) {
  case (#ok(s)) {
    assert(s.theme == "light");
    assert(s.language == "en");
    assert(s.notifications == true);
    Debug.print("PASS: getSettings creates and returns defaults");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL: getSettings failed: " # msg) };
};

switch (SettingsService.updateSettings(svc, p, "dark", "de", false)) {
  case (#ok(s)) {
    assert(s.theme == "dark");
    assert(s.language == "de");
    assert(s.notifications == false);
    Debug.print("PASS: updateSettings modifies all fields");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL: updateSettings failed: " # msg) };
};

switch (SettingsService.getSettings(svc, p)) {
  case (#ok(s)) {
    assert(s.theme == "dark");
    Debug.print("PASS: getSettings returns updated values");
  };
  case (#err(msg)) { assert(false); Debug.print("FAIL: getSettings after update failed: " # msg) };
};

Debug.print("ALL SETTINGS SERVICE TESTS PASSED");
