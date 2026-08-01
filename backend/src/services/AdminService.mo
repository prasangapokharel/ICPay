import Principal "mo:core/Principal";
import Types "../types";
import ReservedRepo "../repositories/ReservedUsernameRepository";
import ReservedStorage "../storage/ReservedUsernameStorage";
import UserRepo "../repositories/UserRepository";
import UserStorage "../storage/UserStorage";
import UsernameValidator "../validators/UsernameValidator";

module {
  public func create(reserved: ReservedStorage.ReservedUsernameSet, users: UserStorage.UserMap, usernames: UserStorage.UsernameMap): AdminService {
    { reserved; users; usernames };
  };

  public type AdminService = {
    reserved: ReservedStorage.ReservedUsernameSet;
    users: UserStorage.UserMap;
    usernames: UserStorage.UsernameMap;
  };

  // Authorization is the canister's own controller list rather than a principal
  // stored in state: it cannot drift, needs no bootstrap call that a stranger
  // could win, and revoking admin is a dfx controller change rather than an
  // upgrade. A caller that can change controllers can already reinstall the
  // canister, so this grants no authority they did not already hold.
  func requireController(caller: Principal): ?Text {
    if (Principal.isController(caller)) { null } else { ?"Not authorized" };
  };

  public func reserveUsername(service: AdminService, caller: Principal, name: Types.Username): Types.ApiResult<Text> {
    switch (requireController(caller)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (UsernameValidator.validate(name)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    // Usernames are permanent, so a name already claimed cannot be taken back by
    // reserving it -- that would leave the holder and the reservation disagreeing.
    if (UserRepo.usernameExists(service.usernames, name)) {
      return #err("Username already claimed by a user");
    };
    ReservedRepo.reserve(service.reserved, name);
    #ok(UsernameValidator.normalize(name));
  };

  public func releaseUsername(service: AdminService, caller: Principal, name: Types.Username): Types.ApiResult<Text> {
    switch (requireController(caller)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    if (not ReservedRepo.isReserved(service.reserved, name)) {
      return #err("Username is not reserved");
    };
    ReservedRepo.release(service.reserved, name);
    #ok(UsernameValidator.normalize(name));
  };

  public func listReservedUsernames(service: AdminService, caller: Principal): Types.ApiResult<[Text]> {
    switch (requireController(caller)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    #ok(ReservedRepo.list(service.reserved));
  };
};
