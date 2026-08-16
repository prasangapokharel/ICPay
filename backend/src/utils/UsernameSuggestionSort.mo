import Order "mo:core/Order";
import Text "mo:core/Text";
import Config "../config/Config";
import Types "../types";

module {
  type BadgeTier = { #gold; #blue };

  // Mirrors frontend/lib/verifed/premium-tick.ts — gold is 1-2 chars, blue is 3-4,
  // free is 5+. Paid handles outrank free ones; within a paid band shorter wins.
  func premiumTier(name: Text): ?BadgeTier {
    let len = name.size();
    if (len == 0 or len >= Config.FREE_MIN_USERNAME_LENGTH) { null }
    else if (len <= 2) { ?#gold }
    else { ?#blue };
  };

  func rank(name: Text): Nat {
    switch (premiumTier(name)) {
      case (?#gold) { 0 };
      case (?#blue) { 1 };
      case (null) { 2 };
    };
  };

  public func compareUsername(a: Text, b: Text): Order.Order {
    let ra = rank(a);
    let rb = rank(b);
    if (ra != rb) {
      if (ra < rb) { #less } else { #greater };
    } else if (ra != 2 and a.size() != b.size()) {
      if (a.size() < b.size()) { #less } else { #greater };
    } else {
      Text.compare(a, b);
    };
  };

  public func compareUserPublic(a: Types.UserPublic, b: Types.UserPublic): Order.Order {
    let na = switch (a.username) { case (?n) n; case (null) "" };
    let nb = switch (b.username) { case (?n) n; case (null) "" };
    compareUsername(na, nb);
  };
};
