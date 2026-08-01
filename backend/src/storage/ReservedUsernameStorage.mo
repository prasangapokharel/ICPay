import Set "mo:core/Set";

module {
  // Keys are the normalized (lowercase) form, matching UsernameMap, so a
  // reservation blocks every case variant of the name.
  public type ReservedUsernameSet = Set.Set<Text>;

  public func createReservedUsernameSet(): ReservedUsernameSet { Set.empty<Text>() };
};
