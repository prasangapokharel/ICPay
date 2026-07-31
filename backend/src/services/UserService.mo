import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types";
import UserRepo "../repositories/UserRepository";
import UserStorage "../storage/UserStorage";
import UsernameValidator "../validators/UsernameValidator";

module {
  public func create(users: UserStorage.UserMap, usernames: UserStorage.UsernameMap, usersById: UserStorage.UserIdMap): UserService {
    { users; usernames; usersById };
  };

  public type UserService = {
    users: UserStorage.UserMap;
    usernames: UserStorage.UsernameMap;
    usersById: UserStorage.UserIdMap;
  };

  public func getProfile(service: UserService, caller: Principal): ?Types.UserPublic {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) { ?Types.userToPublic(user) };
      case (null) { null };
    };
  };

  public func updateUsername(service: UserService, caller: Principal, newUsername: Types.Username): Types.ApiResult<Types.UserPublic> {
    switch (UsernameValidator.validate(newUsername)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) {
        if (UserRepo.usernameExists(service.usernames, newUsername)) {
          return #err("Username already taken");
        };
        let now = Time.now();
        UserRepo.setUsername(service.users, service.usernames, user, user.username, newUsername, now);
        #ok(Types.userToPublic(user));
      };
      case (null) { #err("User not found") };
    };
  };

  public func checkAvailability(service: UserService, name: Types.Username): Bool {
    if (UsernameValidator.validate(name) != null) { return false };
    not UserRepo.usernameExists(service.usernames, name);
  };

  public func search(service: UserService, searchText: Text): [Types.UserPublic] {
    UserRepo.searchByUsername(service.usernames, service.users, searchText);
  };

  public func resolveUsername(service: UserService, name: Types.Username): ?Principal {
    switch (UserRepo.getByUsername(service.usernames, service.users, name)) {
      case (?user) { ?user.principal };
      case (null) { null };
    };
  };
};
