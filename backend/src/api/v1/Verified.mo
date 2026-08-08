import UserService "../../services/UserService";
import UsernameValidator "../../validators/UsernameValidator";

// Public by design and keyed by user id rather than caller: the badge is
// rendered next to other people's handles, so it has to be readable without
// being that user.
mixin (users: UserService.UserService) {
  public shared query func getVerifiedTier(userId: Text) : async ?UsernameValidator.Tier {
    UserService.getVerifiedTier(users, userId);
  };
};
