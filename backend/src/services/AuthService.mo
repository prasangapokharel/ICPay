import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types";
import UUID "../utils/UUID";
import UserRepo "../repositories/UserRepository";
import UserStorage "../storage/UserStorage";
import PrincipalValidator "../validators/PrincipalValidator";
import UsernameValidator "../validators/UsernameValidator";

module {
  public func create(users: UserStorage.UserMap, usernames: UserStorage.UsernameMap, usersById: UserStorage.UserIdMap): AuthService {
    { users; usernames; usersById };
  };

  public type AuthService = {
    users: UserStorage.UserMap;
    usernames: UserStorage.UsernameMap;
    usersById: UserStorage.UserIdMap;
  };

  public func login(service: AuthService, caller: Principal): Types.AuthResult {
    switch (PrincipalValidator.validate(caller)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) {
        #ok({ user = Types.userToPublic(user); isNew = false });
      };
      case (null) {
        let id = UUID.generate();
        let now = Time.now();
        let user = UserRepo.create(service.users, service.usernames, service.usersById, id, caller, null, "", now);
        #ok({ user = Types.userToPublic(user); isNew = true });
      };
    };
  };

  public func register(service: AuthService, caller: Principal, username: Types.Username): Types.AuthResult {
    switch (PrincipalValidator.validate(caller)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (UsernameValidator.validate(username)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    if (UserRepo.usernameExists(service.usernames, username)) {
      return #err("Username already taken");
    };
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) {
        if (user.username != null) {
          return #err("User already has a username");
        };
        let now = Time.now();
        UserRepo.setUsername(service.users, service.usernames, user, null, username, now);
        #ok({ user = Types.userToPublic(user); isNew = false });
      };
      case (null) {
        let id = UUID.generate();
        let now = Time.now();
        let user = UserRepo.create(service.users, service.usernames, service.usersById, id, caller, ?username, username, now);
        #ok({ user = Types.userToPublic(user); isNew = true });
      };
    };
  };

  public func getProfile(service: AuthService, caller: Principal): ?Types.UserPublic {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) { ?Types.userToPublic(user) };
      case (null) { null };
    };
  };
};
