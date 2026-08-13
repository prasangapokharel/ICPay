import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Types "../types";

module {
  public type UserMap = Map.Map<Principal, Types.User>;
  public type UsernameMap = Map.Map<Text, Principal>;
  public type UserIdMap = Map.Map<Text, Principal>;

  /// Subaccount blob → owner principal (O(1) transfer recipient lookup).
  public type DepositSubaccountIndex = Map.Map<Blob, Principal>;
  /// 64-char account-id hex → owner principal.
  public type DepositAccountIdIndex = Map.Map<Text, Principal>;

  public func createUserMap(): UserMap { Map.empty<Principal, Types.User>() };
  public func createUsernameMap(): UsernameMap { Map.empty<Text, Principal>() };
  public func createUserIdMap(): UserIdMap { Map.empty<Text, Principal>() };
  public func createDepositSubaccountIndex(): DepositSubaccountIndex {
    Map.empty<Blob, Principal>()
  };
  public func createDepositAccountIdIndex(): DepositAccountIdIndex {
    Map.empty<Text, Principal>()
  };
};
