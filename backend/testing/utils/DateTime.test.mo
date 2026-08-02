import Debug "mo:core/Debug";
import DateTime "../../src/utils/DateTime";
import UsernameSaleService "../../src/services/UsernameSaleService";
import Config "../../src/config/Config";

// Nanoseconds since the Unix epoch, matching Time.now().
let DAY: Nat = 86_400_000_000_000;

assert (DateTime.toIsoDate(0) == "1970-01-01");
Debug.print("PASS: epoch is 1970-01-01");

assert (DateTime.toIsoDate(DAY - 1) == "1970-01-01");
assert (DateTime.toIsoDate(DAY) == "1970-01-02");
Debug.print("PASS: the day rolls over exactly at midnight, not before");

// 1972 was a leap year, so Feb 29 must exist and Mar 1 must not be pulled
// forward. Day 789 after the epoch is 1972-02-29.
assert (DateTime.toIsoDate(789 * DAY) == "1972-02-29");
assert (DateTime.toIsoDate(790 * DAY) == "1972-03-01");
Debug.print("PASS: leap day 1972-02-29 resolves and is followed by 03-01");

// 1900 is not a leap year but 2000 is: the century rule is where a naive
// implementation drifts by a day.
assert (DateTime.toIsoDate(11_016 * DAY) == "2000-02-29");
assert (DateTime.toIsoDate(11_017 * DAY) == "2000-03-01");
Debug.print("PASS: 2000 is a leap year (400-year rule)");

// 2100 is divisible by 4 but not a leap year. Feb 28 must be followed by Mar 1.
assert (DateTime.toIsoDate(47_540 * DAY) == "2100-02-28");
assert (DateTime.toIsoDate(47_541 * DAY) == "2100-03-01");
Debug.print("PASS: 2100 is not a leap year (100-year rule)");

// Year boundary, both directions.
assert (DateTime.toIsoDate(20_453 * DAY) == "2025-12-31");
assert (DateTime.toIsoDate(20_454 * DAY) == "2026-01-01");
Debug.print("PASS: year rolls over from 2025-12-31 to 2026-01-01");

// Single-digit month and day are zero-padded, so the memo is a fixed width.
assert (DateTime.toIsoDate(20_461 * DAY) == "2026-01-08");
Debug.print("PASS: month and day are zero-padded to two digits");

let (y, m, d) = DateTime.toYmd(20_461 * DAY);
assert (y == 2026 and m == 1 and d == 8);
Debug.print("PASS: toYmd returns the same date as the ISO string");

// --- sale memo ---

// The ledger rejects a memo over MEMO_MAX_BYTES. Every tier is checked at its
// longest name, because the memo is built from the name and the price.
func memoFits(name: Text): Bool {
  let memo = UsernameSaleService.saleMemo(name, UsernameSaleService.priceOf(name), 20_454 * DAY);
  memo.size() <= Config.MEMO_MAX_BYTES;
};

assert (memoFits("a"));
assert (memoFits("abc"));
assert (memoFits("abcd"));
assert (memoFits("abcde"));
assert (memoFits("abcdefgh"));
Debug.print("PASS: sale memo fits the ledger limit at every price tier");

assert (UsernameSaleService.saleMemo("btc", Config.PRICE_ULTRA_PREMIUM, 20_454 * DAY) == "@btc 10ICP 2026-01-01");
Debug.print("PASS: memo carries the handle, the amount and the date");

assert (UsernameSaleService.saleMemo("alice", Config.PRICE_STANDARD, 20_454 * DAY) == "@alice 2ICP 2026-01-01");
Debug.print("PASS: memo prices a 5-char name at 2 ICP");

Debug.print("ALL DATETIME TESTS PASSED");
