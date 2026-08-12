import Nat "mo:core/Nat";

module {
  let NS_PER_DAY: Nat = 86_400_000_000_000;

  // mo:core has no calendar, only a nanosecond counter, so the civil date is
  // derived here. Howard Hinnant's civil_from_days: the era shift moves the
  // year start to March so the leap day lands at the end of a 146097-day
  // 400-year cycle and needs no special case.
  public func toYmd(nanos: Nat): (Nat, Nat, Nat) {
    let days = nanos / NS_PER_DAY;
    let z = days + 719_468;
    let era = z / 146_097;
    let doe = z % 146_097;
    let yoe = ((doe - doe / 1_460 + doe / 36_524 - doe / 146_096 : Nat) / 365 : Nat);
    let doy = (doe - (365 * yoe + yoe / 4 - yoe / 100) : Nat);
    let mp = (5 * doy + 2) / 153;
    let d = (doy - (153 * mp + 2) / 5 + 1 : Nat);
    let m = if (mp < 10) { mp + 3 } else { (mp - 9 : Nat) };
    let y = yoe + era * 400 + (if (m <= 2) { 1 } else { 0 });
    (y, m, d);
  };

  // ISO 8601 date. Zero-padded so the memo is a fixed 10 bytes and sorts
  // lexicographically.
  public func toIsoDate(nanos: Nat): Text {
    let (y, m, d) = toYmd(nanos);
    Nat.toText(y) # "-" # pad2(m) # "-" # pad2(d);
  };

  func pad2(n: Nat): Text {
    if (n < 10) { "0" # Nat.toText(n) } else { Nat.toText(n) };
  };
};
