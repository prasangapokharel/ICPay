import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types";
import UserRepo "../repositories/UserRepository";
import UserStorage "../storage/UserStorage";
import ReservedRepo "../repositories/ReservedUsernameRepository";
import ReservedStorage "../storage/ReservedUsernameStorage";
import UsernameValidator "../validators/UsernameValidator";

module {
  public func create(users: UserStorage.UserMap, usernames: UserStorage.UsernameMap, usersById: UserStorage.UserIdMap, reserved: ReservedStorage.ReservedUsernameSet): UserService {
    { users; usernames; usersById; reserved };
  };

  public type UserService = {
    users: UserStorage.UserMap;
    usernames: UserStorage.UsernameMap;
    usersById: UserStorage.UserIdMap;
    reserved: ReservedStorage.ReservedUsernameSet;
  };

  public func getProfile(service: UserService, caller: Principal): ?Types.UserPublic {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) { ?Types.userToPublic(user) };
      case (null) { null };
    };
  };

  // A username is a payment destination: other people memorise it and send funds
  // to it. Letting it be reassigned would let one user inherit another's inbound
  // tips, so the first claim is permanent and there is no release path.
  public func updateUsername(service: UserService, caller: Principal, newUsername: Types.Username): Types.ApiResult<Types.UserPublic> {
    switch (UsernameValidator.validateFreeClaim(newUsername)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) {
        if (user.username != null) {
          return #err("Username is permanent and cannot be changed");
        };
        if (ReservedRepo.isReserved(service.reserved, newUsername)) {
          return #err("Username is reserved");
        };
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
    if (ReservedRepo.isReserved(service.reserved, name)) { return false };
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
