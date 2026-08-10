import Types "../../types";
import SocialLinkService "../../services/SocialLinkService";
import MiddlewareAuth "../../middleware/Auth";

mixin (social: SocialLinkService.SocialLinkService, mwConfig: MiddlewareAuth.Config) {
  public shared ({ caller }) func setSocialLink(platform: Types.SocialPlatform, url: Text)
    : async Types.ApiResult<Types.UserPublic> {
    SocialLinkService.setSocialLink(social, MiddlewareAuth.effectiveCaller(mwConfig, caller), platform, url);
  };

  public shared ({ caller }) func removeSocialLink(platform: Types.SocialPlatform)
    : async Types.ApiResult<Types.UserPublic> {
    SocialLinkService.removeSocialLink(social, MiddlewareAuth.effectiveCaller(mwConfig, caller), platform);
  };
};
