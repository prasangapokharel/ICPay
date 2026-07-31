import Debug "mo:core/Debug";
import Config "../../src/config/Config";

assert(Config.ICP_LEDGER_CANISTER_ID == "ryjl3-tyaaa-aaaaa-aaaba-cai");
Debug.print("PASS: ICP_LEDGER_CANISTER_ID is correct");

assert(Config.ICP_DECIMALS == 8);
Debug.print("PASS: ICP_DECIMALS is 8");

assert(Config.ICP_FEE == 10_000);
Debug.print("PASS: ICP_FEE is 10_000");

assert(Config.MAX_USERNAME_LENGTH == 32);
Debug.print("PASS: MAX_USERNAME_LENGTH is 32");

assert(Config.MIN_USERNAME_LENGTH == 3);
Debug.print("PASS: MIN_USERNAME_LENGTH is 3");

assert(Config.PAGE_SIZE == 20);
Debug.print("PASS: PAGE_SIZE is 20");

Debug.print("ALL CONFIG TESTS PASSED");
