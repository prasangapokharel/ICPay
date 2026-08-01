import Principal "mo:core/Principal";
import Map "mo:core/Map";
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

  public func searchByUsername(usernames: UserStorage.UsernameMap, users: UserStorage.UserMap, search: Text): [Types.UserPublic] {
    let needle = UsernameValidator.normalize(search);
    let results = List.empty<Types.UserPublic>();
    for ((name, p) in usernames.entries()) {
      if (name.contains(#text(needle))) {
        switch (users.get(p)) {
          case (?u) { results.add(Types.userToPublic(u)) };
          case (null) {};
        };
      };
    };
    List.toArray(results);
  };
};
