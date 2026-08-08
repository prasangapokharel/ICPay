import Principal "mo:core/Principal";
import Map "mo:core/Map";
import RateLimitStorage "../storage/RateLimitStorage";

module {
  public func get(limits: RateLimitStorage.RateLimitMap, key: Principal): ?RateLimitStorage.Window {
    limits.get(key);
  };

  // swap, not add: `add` only inserts absent keys, so reusing it to rewrite an
  // expired window would silently leave the stale counter in place.
  public func put(limits: RateLimitStorage.RateLimitMap, key: Principal, window: RateLimitStorage.Window) {
    ignore limits.swap(key, window);
  };
};
