import Map "mo:core/Map";

module {
  // Per-principal sliding window. `var` fields let a hit rewrite the row in
  // place rather than re-inserting on every call.
  public type Window = { var windowStart: Int; var count: Nat };
  public type RateLimitMap = Map.Map<Principal, Window>;

  public func createRateLimitMap(): RateLimitMap { Map.empty<Principal, Window>() };
};
