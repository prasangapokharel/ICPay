import Debug "mo:core/Debug";
import SettingsStorage "../../src/storage/SettingsStorage";
import SettingsRepo "../../src/repositories/SettingsRepository";

let settingsMap = SettingsStorage.createSettingsMap();
let now = 1000;
let userId = "user-1";

switch (SettingsRepo.getByUserId(settingsMap, userId)) {
  case (?_) { assert(false); Debug.print("FAIL: getByUserId returned settings before creation") };
  case (null) { Debug.print("PASS: getByUserId returns null for new user") };
};

let s1 = SettingsRepo.getOrCreate(settingsMap, userId, now);
assert(s1.userId == userId);
assert(s1.theme == "light");
assert(s1.language == "en");
assert(s1.notifications == true);
assert(s1.updatedAt == now);
Debug.print("PASS: getOrCreate creates settings with defaults");

let s2 = SettingsRepo.getOrCreate(settingsMap, userId, now);
assert(s2.userId == userId);
assert(s2.theme == "light");
Debug.print("PASS: getOrCreate returns existing settings");

switch (SettingsRepo.update(settingsMap, userId, "dark", "de", false, 2000)) {
  case (?s) {
    assert(s.theme == "dark");
    assert(s.language == "de");
    assert(s.notifications == false);
    assert(s.updatedAt == 2000);
    Debug.print("PASS: update modifies settings fields");
  };
  case (null) { assert(false); Debug.print("FAIL: update returned null for existing user") };
};

switch (SettingsRepo.getByUserId(settingsMap, userId)) {
  case (?s) {
    assert(s.theme == "dark");
    Debug.print("PASS: getByUserId returns updated settings");
  };
  case (null) { assert(false); Debug.print("FAIL: getByUserId returned null after update") };
};

switch (SettingsRepo.update(settingsMap, "non-existent-user", "dark", "de", false, 3000)) {
  case (?_) { assert(false); Debug.print("FAIL: update should return null for non-existent user") };
  case (null) { Debug.print("PASS: update returns null for non-existent user") };
};

let now2 = 5000;
let userId2 = "user-2";
let s3 = SettingsRepo.getOrCreate(settingsMap, userId2, now2);
assert(s3.userId == userId2);
assert(s3.updatedAt == now2);
Debug.print("PASS: getOrCreate creates independent settings per user");

Debug.print("ALL SETTINGS REPOSITORY TESTS PASSED");
