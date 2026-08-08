import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types";
import UserRepo "../repositories/UserRepository";
import UserStorage "../storage/UserStorage";
import ReservedRepo "../repositories/ReservedUsernameRepository";
import ReservedStorage "../storage/ReservedUsernameStorage";
import UsernameValidator "../validators/UsernameValidator";
import Config "../config/Config";
import RateLimitService "RateLimitService";
import RateLimitStorage "../storage/RateLimitStorage";

module {
  public func create(users: UserStorage.UserMap, usernames: UserStorage.UsernameMap, usersById: UserStorage.UserIdMap, reserved: ReservedStorage.ReservedUsernameSet, claimLimits: RateLimitStorage.RateLimitMap): UserService {
    { users; usernames; usersById; reserved; claimLimits };
  };

  public type UserService = {
    users: UserStorage.UserMap;
    usernames: UserStorage.UsernameMap;
    usersById: UserStorage.UserIdMap;
    reserved: ReservedStorage.ReservedUsernameSet;
    // Shared with AuthService.register: same free-claim budget either route.
    claimLimits: RateLimitStorage.RateLimitMap;
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
    if (not RateLimitService.allow(service.claimLimits, caller, Config.RATE_CLAIM_USERNAME, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_CLAIM_USERNAME));
    };
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
    UserRepo.searchByUsername(service.usernames, service.users, searchText, Config.MAX_SEARCH_RESULTS);
  };

  public func resolveUsername(service: UserService, name: Types.Username): ?Principal {
    switch (UserRepo.getByUsername(service.usernames, service.users, name)) {
      case (?user) { ?user.principal };
      case (null) { null };
    };
  };

  // Null for a user with no handle rather than #basic: the tier answers "which
  // badge", and an account that has claimed nothing has not earned one.
  public func getVerifiedTier(service: UserService, userId: Types.UserId): ?UsernameValidator.Tier {
    switch (UserRepo.getById(service.usersById, service.users, userId)) {
      case (?user) {
        switch (user.username) {
          case (?name) { ?UsernameValidator.tierFor(name) };
          case (null) { null };
        };
      };
      case (null) { null };
    };
  };
};
