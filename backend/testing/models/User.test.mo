import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import UserModel "../../src/models/User";
import Types "../../src/types";

let p = Principal.fromText("aaaaa-aa");
let now = 1000;
let user = UserModel.new("user-1", p, null, "Alice", now);
assert(user.id == "user-1");
assert(user.principal == p);
assert(user.username == null);
assert(user.displayName == "Alice");
assert(user.createdAt == now);
assert(user.updatedAt == now);
Debug.print("PASS: User.new() creates user with correct fields");

UserModel.updateDisplayName(user, "Alice Updated", 2000);
assert(user.displayName == "Alice Updated");
assert(user.updatedAt == 2000);
Debug.print("PASS: User.updateDisplayName() updates name and timestamp");

UserModel.setUsername(user, "alice", 3000);
assert(user.username == ?"alice");
assert(user.updatedAt == 3000);
Debug.print("PASS: User.setUsername() sets username and timestamp");

UserModel.clearUsername(user, 4000);
assert(user.username == null);
assert(user.updatedAt == 4000);
Debug.print("PASS: User.clearUsername() clears username and timestamp");

let user2 = UserModel.new("user-2", p, ?"bob", "Bob", 5000);
assert(user2.username == ?"bob");
Debug.print("PASS: User.new() creates user with initial username");

Debug.print("ALL USER MODEL TESTS PASSED");
