import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types";
import UserRepo "../repositories/UserRepository";
import SettingsRepo "../repositories/SettingsRepository";
import UserStorage "../storage/UserStorage";
import SettingsStorage "../storage/SettingsStorage";

module {
  public func create(users: UserStorage.UserMap, settings: SettingsStorage.SettingsMap): SettingsService {
    { users; settings };
  };

  public type SettingsService = {
    users: UserStorage.UserMap;
    settings: SettingsStorage.SettingsMap;
  };

  public func getSettings(service: SettingsService, caller: Principal): Types.ApiResult<Types.SettingsPublic> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) {
        let now = Time.now();
        let s = SettingsRepo.getOrCreate(service.settings, user.id, now);
        #ok(Types.settingsToPublic(s));
      };
      case (null) { #err("User not found") };
    };
  };

  public func updateSettings(service: SettingsService, caller: Principal, theme: Text, language: Text, notifications: Bool): Types.ApiResult<Types.SettingsPublic> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) {
        let now = Time.now();
        switch (SettingsRepo.update(service.settings, user.id, theme, language, notifications, now)) {
          case (?s) { #ok(Types.settingsToPublic(s)) };
          case (null) { #err("Settings not found") };
        };
      };
      case (null) { #err("User not found") };
    };
  };
};
