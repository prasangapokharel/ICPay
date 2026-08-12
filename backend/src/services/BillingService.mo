import Cycles "mo:core/Cycles";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Result "mo:core/Result";
import Debug "mo:core/Debug";

module {
  private let CYCLES_PER_GB_MONTH : Nat = 333_860_000_000;
  private let CYCLES_PER_ICP : Nat = 1_000_000_000_000;
  private let MARGIN_PERCENT : Nat = 50;

  private let CRITICAL_THRESHOLD : Nat = 1_000_000_000_000;
  private let LOW_THRESHOLD : Nat = 10_000_000_000_000;
  private let HEALTHY_THRESHOLD : Nat = 50_000_000_000_000;

  // Reserved capacity tiers (GB). Price is derived, not hand-maintained per tier.
  public let CAPACITY_GB_TIERS : [Nat] = [1, 5, 10, 25, 50, 100, 250, 500];

  public func capacityBytesFromGB(gb: Nat) : ?Nat {
    if (gb == 0) return null;
    for (tier in CAPACITY_GB_TIERS.vals()) {
      if (tier == gb) return ?(gb * 1_000_000_000);
    };
    null
  };

  public func calculatePrice(capacityBytes: Nat) : Nat {
    let capacityGB = capacityBytes / 1_000_000_000;
    let cyclesNeeded = capacityGB * CYCLES_PER_GB_MONTH;
    let cyclesWithMargin = cyclesNeeded * (100 + MARGIN_PERCENT) / 100;
    let priceE8s = cyclesWithMargin * 100_000_000 / CYCLES_PER_ICP;
    roundToHalfICP(priceE8s)
  };

  private func roundToHalfICP(e8s: Nat) : Nat {
    let halfICP = 50_000_000;
    ((e8s + halfICP - 1) / halfICP) * halfICP
  };

  public type CycleStatus = {
    balance: Nat;
    status: { #CRITICAL; #LOW; #HEALTHY; #COMFORTABLE };
    canAcceptNewBuckets: Bool;
    estimatedDaysRemaining: Nat;
    dailyBurn: Nat;
  };

  public func getCycleStatus(totalStorageBytes: Nat) : CycleStatus {
    let balance = Cycles.balance();

    let status = if (balance < CRITICAL_THRESHOLD) {
      #CRITICAL
    } else if (balance < LOW_THRESHOLD) {
      #LOW
    } else if (balance < HEALTHY_THRESHOLD) {
      #HEALTHY
    } else {
      #COMFORTABLE
    };

    let storageGB = totalStorageBytes / 1_000_000_000;
    let cyclesPerSecond = storageGB * 127_000;
    let dailyBurn = cyclesPerSecond * 86_400;

    let daysRemaining = if (dailyBurn > 0) {
      balance / dailyBurn
    } else {
      999
    };

    {
      balance;
      status;
      canAcceptNewBuckets = balance >= CRITICAL_THRESHOLD;
      estimatedDaysRemaining = daysRemaining;
      dailyBurn;
    }
  };

  public func checkBeforeOperation() : Result.Result<(), Text> {
    let balance = Cycles.balance();
    if (balance < CRITICAL_THRESHOLD) {
      #err("Service temporarily unavailable — canister cycles are critically low")
    } else if (balance < LOW_THRESHOLD) {
      Debug.print("WARNING: canister cycles below 10T");
      #ok()
    } else {
      #ok()
    }
  };

  public func formatCycles(cycles: Nat) : Text {
    if (cycles >= 1_000_000_000_000) {
      let t = cycles / 1_000_000_000_000;
      let remainder = (cycles % 1_000_000_000_000) / 100_000_000_000;
      Nat.toText(t) # "." # Nat.toText(remainder) # "T"
    } else if (cycles >= 1_000_000_000) {
      let b = cycles / 1_000_000_000;
      Nat.toText(b) # "B"
    } else {
      Nat.toText(cycles)
    }
  };
};
