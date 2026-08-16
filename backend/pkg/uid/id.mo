import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
  /// Nanosecond timestamp — unique across rounds, not within one update call.
  public func fromTime(now: Int) : Text {
    Int.toText(now)
  };

  /// Current IC time as text id.
  public func now() : Text {
    fromTime(Time.now())
  };

  /// Prefix + monotonic counter — use when multiple ids share one round.
  public func withCounter(prefix: Text, counter: Nat) : Text {
    prefix # "-" # Nat.toText(counter)
  };

  /// Time-based prefix decorated with a counter.
  public func unique(counter: Nat) : Text {
    withCounter(fromTime(Time.now()), counter)
  };

  /// Join non-empty segments with a separator.
  public func join(separator: Text, parts: [Text]) : Text {
    var out = "";
    var first = true;
    for (part in parts.vals()) {
      if (part.size() > 0) {
        if (not first) { out := out # separator };
        out := out # part;
        first := false;
      };
    };
    out
  };
};
