import Int "mo:core/Int";
import Nat "mo:core/Nat";

module {
  public let NS_PER_MS : Nat = 1_000_000;
  public let NS_PER_SECOND : Nat = 1_000_000_000;
  public let NS_PER_MINUTE : Nat = 60_000_000_000;
  public let NS_PER_HOUR : Nat = 3_600_000_000_000;
  public let NS_PER_DAY : Nat = 86_400_000_000_000;

  public func seconds(n: Nat) : Int {
    Int.fromNat(n * NS_PER_SECOND)
  };

  public func days(n: Nat) : Int {
    Int.fromNat(n * NS_PER_DAY)
  };

  public func isPast(deadline: Int, now: Int) : Bool {
    now >= deadline
  };

  public func remaining(deadline: Int, now: Int) : Int {
    if (deadline <= now) { 0 } else { deadline - now }
  };

  public func daysRemaining(deadline: Int, now: Int) : Nat {
    if (deadline <= now) {
      0
    } else {
      Int.abs((deadline - now) / Int.fromNat(NS_PER_DAY))
    }
  };

  public func extendFrom(now: Int, currentDeadline: Int, period: Int) : Int {
    let base = if (currentDeadline > now) { currentDeadline } else { now };
    base + period
  };

  public func percent(used: Nat, capacity: Nat) : Nat {
    if (capacity == 0) { 0 } else { used * 100 / capacity }
  };
};
