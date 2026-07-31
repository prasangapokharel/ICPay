import Types "../../types";
import SettingsService "../../services/SettingsService";
import MiddlewareAuth "../../middleware/Auth";

mixin (settings: SettingsService.SettingsService, mwConfig: MiddlewareAuth.Config) {
  public shared ({ caller }) func getSettings() : async Types.ApiResult<Types.SettingsPublic> {
    SettingsService.getSettings(settings, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };

  public shared ({ caller }) func updateSettings(theme: Text, language: Text, notifications: Bool) : async Types.ApiResult<Types.SettingsPublic> {
    SettingsService.updateSettings(settings, MiddlewareAuth.effectiveCaller(mwConfig, caller), theme, language, notifications);
  };
};
