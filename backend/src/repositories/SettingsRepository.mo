import Map "mo:core/Map";
import Text "mo:core/Text";
import Types "../types";
import SettingsModel "../models/Settings";
import SettingsStorage "../storage/SettingsStorage";

module {
  public func getByUserId(settings: SettingsStorage.SettingsMap, userId: Types.UserId): ?Types.Settings {
    settings.get(userId);
  };

  public func getOrCreate(settings: SettingsStorage.SettingsMap, userId: Types.UserId, now: Int): Types.Settings {
    switch (settings.get(userId)) {
      case (?s) { s };
      case (null) {
        let s = SettingsModel.new(userId, now);
        settings.add(userId, s);
        s;
      };
    };
  };

  public func update(
    settings: SettingsStorage.SettingsMap,
    userId: Types.UserId,
    theme: Text,
    language: Text,
    notifications: Bool,
    now: Int,
  ): ?Types.Settings {
    switch (settings.get(userId)) {
      case (?s) {
        s.update(theme, language, notifications, now);
        ?s;
      };
      case (null) { null };
    };
  };
};
