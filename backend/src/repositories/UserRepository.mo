import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Text "mo:core/Text";
import Types "../types";
import UserModel "../models/User";
import UserStorage "../storage/UserStorage";
import UsernameValidator "../validators/UsernameValidator";

module {
  public func getByPrincipal(users: UserStorage.UserMap, p: Principal): ?Types.User {
    users.get(p);
  };

  public func getByUsername(usernames: UserStorage.UsernameMap, users: UserStorage.UserMap, name: Text): ?Types.User {
    switch (usernames.get(UsernameValidator.normalize(name))) {
      case (?p) { users.get(p) };
      case (null) { null };
    };
  };

  public func getById(usersById: UserStorage.UserIdMap, users: UserStorage.UserMap, id: Types.UserId): ?Types.User {
    switch (usersById.get(id)) {
      case (?p) { users.get(p) };
      case (null) { null };
    };
  };

  public func usernameExists(usernames: UserStorage.UsernameMap, name: Text): Bool {
    switch (usernames.get(UsernameValidator.normalize(name))) {
      case (?_) { true };
      case (null) { false };
    };
  };

  public func create(
    users: UserStorage.UserMap,
    usernames: UserStorage.UsernameMap,
    usersById: UserStorage.UserIdMap,
    id: Types.UserId,
    principal: Principal,
    username: ?Types.Username,
    displayName: Text,
    now: Int,
  ): Types.User {
    let user = UserModel.new(id, principal, username, displayName, now);
    users.add(principal, user);
    usersById.add(id, principal);
    switch (username) {
      case (?name) { usernames.add(UsernameValidator.normalize(name), principal) };
      case (null) {};
    };
    user;
  };

  public func setUsername(
    _users: UserStorage.UserMap,
    usernames: UserStorage.UsernameMap,
    user: Types.User,
    oldUsername: ?Types.Username,
    newUsername: Types.Username,
    now: Int,
  ) {
    switch (oldUsername) {
      case (?old) { usernames.remove(UsernameValidator.normalize(old)) };
      case (null) {};
    };
    usernames.add(UsernameValidator.normalize(newUsername), user.principal);
    user.setUsername(newUsername, now);
  };

  // A purchase keeps every handle the buyer has ever held pointing at them:
  // people memorise a handle as a payment address, so releasing the old one
  // would let a stranger claim it and collect funds meant for the buyer. Only
  // the primary display handle moves.
  public func addAlias(
    usernames: UserStorage.UsernameMap,
    user: Types.User,
    newUsername: Types.Username,
    now: Int,
  ) {
    usernames.add(UsernameValidator.normalize(newUsername), user.principal);
    user.setUsername(newUsername, now);
  };

  // Keyed by principal, not by name: a user who bought a handle keeps their old
  // ones as aliases, and every alias is a separate key here. Emitting one row
  // per key listed the same account once per handle it has ever held, each row
  // rendering that account's current username -- so one person showed up as
  // several identical entries.
  // Stops once the cap is filled rather than returning every match, so the
  // response size is bounded by the cap instead of by how many accounts exist.
  // The caller ranks and trims what it gets, so a cut here only ever removes
  // rows that were already past the end of any rendered list.
  public func searchByUsername(usernames: UserStorage.UsernameMap, users: UserStorage.UserMap, search: Text, limit: Nat): [Types.UserPublic] {
    let needle = UsernameValidator.normalize(search);
    let results = List.empty<Types.UserPublic>();
    let seen = Set.empty<Principal>();
    label scan for ((name, p) in usernames.entries()) {
      if (name.contains(#text(needle)) and not seen.contains(p)) {
        switch (users.get(p)) {
          case (?u) {
            seen.add(p);
            results.add(Types.userToPublic(u));
            if (results.size() >= limit) { break scan };
          };
          case (null) {};
        };
      };
    };
    List.toArray(results);
  };
};
