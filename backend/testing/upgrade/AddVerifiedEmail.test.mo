import Debug "mo:core/Debug";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AddVerifiedEmail "../../src/migrations/AddVerifiedEmail";

let p = Principal.fromText("aaaaa-aa");

let oldUser : AddVerifiedEmail.OldUser = {
  id = "user-1";
  principal = p;
  var username = ?"alice";
  var displayName = "Alice";
  var socialLinks = [];
  createdAt = 1000;
  var updatedAt = 1000;
};

let oldUsers = Map.empty<Principal, AddVerifiedEmail.OldUser>();
Map.add(oldUsers, Principal.compare, p, oldUser);

let result = AddVerifiedEmail.migration({ users = oldUsers });

switch (Map.get(result.users, Principal.compare, p)) {
  case (?u) {
    assert(u.verifiedEmail == null);
    assert(u.displayName == "Alice");
    Debug.print("PASS: AddVerifiedEmail migration adds verifiedEmail");
  };
  case (null) { assert(false) };
};
