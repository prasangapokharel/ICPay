import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import UserStorage "../../src/storage/UserStorage";
import BookmarkStorage "../../src/storage/BookmarkStorage";
import BookmarkService "../../src/services/BookmarkService";
import UserRepo "../../src/repositories/UserRepository";

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();
let bookmarkMap = BookmarkStorage.createBookmarkMap();
let svc = BookmarkService.create(users, usersById, bookmarkMap);

let p1 = Principal.fromText("aaaaa-aa");
let p2 = Principal.fromText("2vxsx-fae");
let now = Time.now();
let uid1 = "uid-1";
let uid2 = "uid-2";

// --- setup: two users ---
let _ = UserRepo.create(users, usernames, usersById, uid1, p1, null, "", now, null);
let _ = UserRepo.create(users, usernames, usersById, uid2, p2, ?"bob", "bob", now, null);

// unknown caller is rejected — use a valid but unregistered principal
switch (BookmarkService.list(svc, Principal.fromText("mk4xk-sqaaa-aaaaa-qadjq-cai"))) {
  case (#ok(_)) { assert false; Debug.print("FAIL: list should reject unknown caller") };
  case (#err(_)) { Debug.print("PASS: list rejects unknown caller") };
};

// empty list before any bookmark
switch (BookmarkService.list(svc, p1)) {
  case (#ok(bs)) {
    assert bs.size() == 0;
    Debug.print("PASS: list returns empty for new user");
  };
  case (#err(e)) { assert false; Debug.print("FAIL: list: " # e) };
};

// add bookmark
switch (BookmarkService.add(svc, p1, uid2)) {
  case (#ok(b)) {
    assert b.targetUserId == uid2;
    switch (b.username) {
      case (?name) { assert name == "bob" };
      case (null) { assert false };
    };
    Debug.print("PASS: add bookmark");
  };
  case (#err(e)) { assert false; Debug.print("FAIL: add: " # e) };
};

// duplicate add is idempotent (replaces, not duplicates)
switch (BookmarkService.add(svc, p1, uid2)) {
  case (#ok(_)) {
    switch (BookmarkService.list(svc, p1)) {
      case (#ok(bs)) {
        assert bs.size() == 1;
        Debug.print("PASS: duplicate add does not create two entries");
      };
      case (#err(e)) { assert false; Debug.print("FAIL: list after dup add: " # e) };
    };
  };
  case (#err(e)) { assert false; Debug.print("FAIL: second add: " # e) };
};

// cannot bookmark yourself
switch (BookmarkService.add(svc, p1, uid1)) {
  case (#ok(_)) { assert false; Debug.print("FAIL: should not bookmark self") };
  case (#err(_)) { Debug.print("PASS: cannot bookmark yourself") };
};

// target user not found
switch (BookmarkService.add(svc, p1, "uid-nonexistent")) {
  case (#ok(_)) { assert false; Debug.print("FAIL: should reject unknown target") };
  case (#err(_)) { Debug.print("PASS: unknown target user rejected") };
};

// remove
switch (BookmarkService.remove(svc, p1, uid2)) {
  case (#ok(())) {
    switch (BookmarkService.list(svc, p1)) {
      case (#ok(bs)) {
        assert bs.size() == 0;
        Debug.print("PASS: remove bookmark");
      };
      case (#err(e)) { assert false; Debug.print("FAIL: list after remove: " # e) };
    };
  };
  case (#err(e)) { assert false; Debug.print("FAIL: remove: " # e) };
};

// remove non-existent returns error
switch (BookmarkService.remove(svc, p1, uid2)) {
  case (#ok(())) { assert false; Debug.print("FAIL: remove should err on missing bookmark") };
  case (#err(_)) { Debug.print("PASS: remove non-existent returns error") };
};

Debug.print("BookmarkService tests done");
