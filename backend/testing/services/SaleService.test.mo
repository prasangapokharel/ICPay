import Debug "mo:core/Debug";
import Blob "mo:core/Blob";
import Principal "mo:core/Principal";
import Config "../../src/config/Config";
import Subaccount "../../src/ledger/Subaccount";
import SaleService "../../src/services/SaleService";

// Fixed rate: both tokens are 8-decimal, so e8s multiply directly.
assert (SaleService.icpayAmountFor(100_000_000) == 2_000_000_000_000); // 1 ICP -> 20k ICPAY
assert (SaleService.icpayAmountFor(10_000_000) == 200_000_000_000); // 0.1 ICP -> 2k ICPAY
assert (SaleService.icpayAmountFor(250_000_000) == 5_000_000_000_000); // 2.5 ICP
assert (SaleService.icpayAmountFor(5_000_000_000) == 100_000_000_000_000); // 50 ICP max
Debug.print("PASS: icpayAmountFor at 0.1, 1, 2.5 and 50 ICP");

assert (SaleService.rate() == 20_000);
Debug.print("PASS: rate is 20_000 ICPAY per ICP");

switch (SaleService.validateIcpAmount(0)) {
  case (?_) { Debug.print("PASS: zero refused") };
  case (null) { assert false };
};
switch (SaleService.validateIcpAmount(9_999_999)) {
  case (?_) { Debug.print("PASS: below 0.1 ICP refused") };
  case (null) { assert false };
};
switch (SaleService.validateIcpAmount(5_000_000_001)) {
  case (?_) { Debug.print("PASS: above 50 ICP refused") };
  case (null) { assert false };
};
switch (SaleService.validateIcpAmount(100_000_000)) {
  case (null) { Debug.print("PASS: 1 ICP accepted") };
  case (?_) { assert false };
};

// Sale subaccount must not collide with user-derived accounts.
let sale = Config.SALE_SUBACCOUNT;
assert (sale.size() == 32);
assert (Blob.toArray(sale)[0] == 2);
assert (sale != Config.REVENUE_SUBACCOUNT);
assert (Blob.toArray(Config.REVENUE_SUBACCOUNT)[0] == 1);
assert (sale != Subaccount.fromPrincipal(Principal.fromText(Config.TREASURY)));
Debug.print("PASS: sale subaccount is disjoint from revenue and user accounts");

assert (Config.SALE_INVENTORY_CAP == 1_000_000_000_000_000);
Debug.print("PASS: inventory cap is 10M ICPAY e8s");

assert (SaleService.sweepAmount(10_000, 10_000) == null);
assert (SaleService.sweepAmount(10_001, 10_000) == ?1);
Debug.print("PASS: sweepAmount leaves fee on the account");

Debug.print("ALL SALE SERVICE TESTS PASSED");
