import Debug "mo:core/Debug";
import SettingsModel "../../src/models/Settings";
import Types "../../src/types";

let now = 1000;
let s = SettingsModel.new("user-1", now);

assert(s.userId == "user-1");
assert(s.theme == "light");
assert(s.language == "en");
assert(s.notifications == true);
assert(s.updatedAt == now);
Debug.print("PASS: Settings.new() creates settings with defaults");

s.update("dark", "de", false, 2000);
assert(s.theme == "dark");
assert(s.language == "de");
assert(s.notifications == false);
assert(s.updatedAt == 2000);
Debug.print("PASS: Settings.update() changes all fields");

s.update("light", "en", true, 3000);
assert(s.theme == "light");
assert(s.language == "en");
assert(s.notifications == true);
assert(s.updatedAt == 3000);
Debug.print("PASS: Settings.update() reverts to defaults");

let s2 = SettingsModel.new("user-2", 4000);
assert(s2.userId == "user-2");
assert(s2.theme == "light");
Debug.print("PASS: Settings.new() creates independent instances");

Debug.print("ALL SETTINGS MODEL TESTS PASSED");
