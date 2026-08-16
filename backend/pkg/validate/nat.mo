import Nat "mo:core/Nat";
import Text "mo:core/Text";

module {
  public func positive(amount: Nat, field: Text) : ?Text {
    if (amount == 0) { ?(field # " must be greater than 0") } else { null }
  };

  public func atLeast(amount: Nat, min: Nat, field: Text) : ?Text {
    if (amount < min) {
      ?(field # " must be at least " # Nat.toText(min))
    } else {
      null
    }
  };

  public func atMost(amount: Nat, max: Nat, field: Text) : ?Text {
    if (amount > max) {
      ?(field # " must be at most " # Nat.toText(max))
    } else {
      null
    }
  };

  public func inRange(amount: Nat, min: Nat, max: Nat, field: Text) : ?Text {
    switch (atLeast(amount, min, field)) {
      case (?e) { ?e };
      case (null) { atMost(amount, max, field) };
    }
  };
};
