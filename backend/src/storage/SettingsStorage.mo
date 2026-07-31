import Map "mo:core/Map";
import Types "../types";

module {
  public type SettingsMap = Map.Map<Text, Types.Settings>;

  public func createSettingsMap(): SettingsMap { Map.empty<Text, Types.Settings>() };
};
