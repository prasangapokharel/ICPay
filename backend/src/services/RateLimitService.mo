import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import RateLimitRepo "../repositories/RateLimitRepository";
import RateLimitStorage "../storage/RateLimitStorage";

module {
  // windowSeconds as Nat so a policy literal (e.g. 60) needs no cast; converted
  // to nanoseconds once per check against Time.now(), which is already Int.
  public type Policy = { maxPerWindow: Nat; windowSeconds: Nat };

  public func message(policy: Policy): Text {
    "Rate limit exceeded. Retry in " # Nat.toText(policy.windowSeconds) # "s.";
  };

  // The key is the caller alone, so one map is one budget. Paths that must not
  // spend each other's budget get their own map rather than a composite key --
  // see the RATE_* policies in Config.mo and the maps in main.mo.
  public func allow(
    limits: RateLimitStorage.RateLimitMap,
    key: Principal,
    policy: Policy,
    now: Int,
  ): Bool {
    let windowNanos = Int.fromNat(policy.windowSeconds * 1_000_000_000);
    switch (RateLimitRepo.get(limits, key)) {
      case (null) {
        RateLimitRepo.put(limits, key, { var windowStart = now; var count = 1 });
        true;
      };
      case (?w) {
        if (now - w.windowStart >= windowNanos) {
          w.windowStart := now;
          w.count := 1;
          true;
        } else if (w.count < policy.maxPerWindow) {
          w.count += 1;
          true;
        } else {
          false;
        };
      };
    };
  };
};
