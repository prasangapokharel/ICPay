import Array "mo:core/Array";
import Debug "mo:core/Debug";
import Config "../../src/config/Config";

assert(Config.ICP_LEDGER_CANISTER_ID == "ryjl3-tyaaa-aaaaa-aaaba-cai");
Debug.print("PASS: ICP_LEDGER_CANISTER_ID is correct");

// The chain-key ledgers must always resolve, even when SNS-W is cold: an empty
// or stale allowlist must never make ICP unspendable.
assert(Array.contains<Text>(Config.CHAIN_KEY_LEDGERS, func(a, b) { a == b }, "ryjl3-tyaaa-aaaaa-aaaba-cai"));
assert(Array.contains<Text>(Config.CHAIN_KEY_LEDGERS, func(a, b) { a == b }, "mxzaz-hqaaa-aaaar-qaada-cai")); // ckBTC
assert(Array.contains<Text>(Config.CHAIN_KEY_LEDGERS, func(a, b) { a == b }, "ss2fx-dyaaa-aaaar-qacoq-cai")); // ckETH
assert(Array.contains<Text>(Config.CHAIN_KEY_LEDGERS, func(a, b) { a == b }, "xevnm-gaaaa-aaaar-qafnq-cai")); // ckUSDC
assert(Array.contains<Text>(Config.CHAIN_KEY_LEDGERS, func(a, b) { a == b }, "cngnf-vqaaa-aaaar-qag4q-cai")); // ckUSDT
Debug.print("PASS: chain-key ledgers compiled into the allowlist");

assert(Config.SNS_WASM_CANISTER_ID == "qaa6y-5yaaa-aaaaa-aaafa-cai");
Debug.print("PASS: SNS_WASM_CANISTER_ID is the official SNS-W");

assert(Config.MAX_USERNAME_LENGTH == 8);
Debug.print("PASS: MAX_USERNAME_LENGTH is 8");

assert(Config.MIN_USERNAME_LENGTH == 1);
Debug.print("PASS: MIN_USERNAME_LENGTH is 1");

assert(Config.FREE_MIN_USERNAME_LENGTH == 5);
assert(Config.FREE_MIN_USERNAME_LENGTH > Config.MIN_USERNAME_LENGTH);
Debug.print("PASS: free claims start at 5 chars, leaving 1-4 purchasable");

assert(Config.PAGE_SIZE == 20);
Debug.print("PASS: PAGE_SIZE is 20");

Debug.print("ALL CONFIG TESTS PASSED");
