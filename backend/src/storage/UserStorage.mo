import Map "mo:core/Map";
import Types "../types";

module {
  public type UserMap = Map.Map<Principal, Types.User>;
  public type UsernameMap = Map.Map<Text, Principal>;
  public type UserIdMap = Map.Map<Text, Principal>;

  public func createUserMap(): UserMap { Map.empty<Principal, Types.User>() };
  public func createUsernameMap(): UsernameMap { Map.empty<Text, Principal>() };
  public func createUserIdMap(): UserIdMap { Map.empty<Text, Principal>() };
};
