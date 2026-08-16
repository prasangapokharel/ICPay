import Cycles "mo:core/Cycles";
import Nat "mo:core/Nat";

module {
  public func balance() : Nat {
    Cycles.balance()
  };

  public func hasMinimum(reserve: Nat) : Bool {
    Cycles.balance() >= reserve
  };

  public func belowReserve(reserve: Nat) : ?Text {
    if (hasMinimum(reserve)) { null }
    else { ?("Insufficient cycles") }
  };
};
