import Int "mo:core/Int";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

module {
  public type Policy = {
    maxPerWindow: Nat;
    windowSeconds: Nat;
  };

  public type Window = {
    var windowStart: Int;
    var count: Nat;
  };

  public type Store = Map.Map<Text, Window>;

  public func empty() : Store {
    Map.empty<Text, Window>()
  };

  public func message(policy: Policy) : Text {
    "Rate limit exceeded. Retry in " # Nat.toText(policy.windowSeconds) # "s."
  };

  public func allow(
    store: Store,
    key: Text,
    policy: Policy,
    now: Int,
  ) : Bool {
    let windowNanos = Int.fromNat(policy.windowSeconds * 1_000_000_000);
    switch (store.get(key)) {
      case (null) {
        store.add(key, { var windowStart = now; var count = 1 });
        true
      };
      case (?w) {
        if (now - w.windowStart >= windowNanos) {
          w.windowStart := now;
          w.count := 1;
          true
        } else if (w.count < policy.maxPerWindow) {
          w.count += 1;
          true
        } else {
          false
        };
      };
    }
  };
};
