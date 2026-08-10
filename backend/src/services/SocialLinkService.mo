import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Types "../types";
import UserRepo "../repositories/UserRepository";
import UserStorage "../storage/UserStorage";
import SocialLinkValidator "../validators/SocialLinkValidator";

module {
  public type SocialLinkService = {
    users: UserStorage.UserMap;
  };

  public func create(users: UserStorage.UserMap): SocialLinkService {
    { users };
  };

  public func setSocialLink(
    service: SocialLinkService,
    caller: Principal,
    platform: Types.SocialPlatform,
    url: Text,
  ): Types.ApiResult<Types.UserPublic> {
    switch (SocialLinkValidator.validate(platform, url)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (null) { #err("User not found") };
      case (?user) {
        let entry: Types.SocialLink = { platform; url };
        let filtered = Array.filter<Types.SocialLink>(
          user.socialLinks,
          func(l) { l.platform != platform },
        );
        user.socialLinks := Array.concat(filtered, [entry]);
        user.updatedAt := Time.now();
        #ok(Types.userToPublic(user));
      };
    };
  };

  public func removeSocialLink(
    service: SocialLinkService,
    caller: Principal,
    platform: Types.SocialPlatform,
  ): Types.ApiResult<Types.UserPublic> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (null) { #err("User not found") };
      case (?user) {
        user.socialLinks := Array.filter<Types.SocialLink>(
          user.socialLinks,
          func(l) { l.platform != platform },
        );
        user.updatedAt := Time.now();
        #ok(Types.userToPublic(user));
      };
    };
  };
};
