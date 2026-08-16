import Nat "mo:core/Nat";

module {
  public func min(a: Nat, b: Nat) : Nat {
    if (a < b) { a } else { b }
  };

  public func max(a: Nat, b: Nat) : Nat {
    if (a > b) { a } else { b }
  };

  public func clamp(value: Nat, low: Nat, high: Nat) : Nat {
    if (value < low) { low }
    else if (value > high) { high }
    else { value }
  };

  public func saturatingSub(a: Nat, b: Nat) : Nat {
    if (a >= b) { Nat.sub(a, b) } else { 0 }
  };

  public func percent(part: Nat, whole: Nat) : Nat {
    if (whole == 0) { 0 } else { part * 100 / whole }
  };
};
