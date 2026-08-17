import Debug "mo:core/Debug";
import Blob "mo:core/Blob";
import Config "../../src/config/Config";

let sale = Config.SALE_SUBACCOUNT;
assert (sale.size() == 32);
assert (Blob.toArray(sale)[0] == 2);
Debug.print("PASS: SALE_SUBACCOUNT is 32 bytes starting with \\02");

assert (Config.ICPAY_PER_ICP == 20_000);
assert (Config.MIN_BUY_ICP == 10_000_000);
assert (Config.MAX_BUY_ICP == 5_000_000_000);
Debug.print("PASS: presale amount bounds");

Debug.print("ALL SALE SECURITY TESTS PASSED");
