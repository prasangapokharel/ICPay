import Debug "mo:core/Debug";
import Config "../../src/config/Config";
import LedgerStorage "../../src/storage/LedgerStorage";

// The registry decides which canisters the custodian is willing to call, so a
// bug that widens it is a forged-history bug, not a display bug.

let registry = LedgerStorage.createLedgerRegistry();

// Chain-key ledgers answer before the set is consulted at all, so an empty or
// wiped registry can never make ICP unspendable.
for (id in Config.CHAIN_KEY_LEDGERS.vals()) {
  assert (LedgerStorage.isAllowed(registry, id));
};
Debug.print("PASS: chain-key ledgers are allowed with an empty registry");

let launched = "5fsnk-rqaaa-aaaan-q6m4q-cai";
assert (not LedgerStorage.isAllowed(registry, launched));
assert (LedgerStorage.register(registry, launched));
assert (LedgerStorage.isAllowed(registry, launched));
Debug.print("PASS: a registered ledger becomes callable");

// The return value is what the backfill endpoint counts, so a re-run has to
// report zero rather than claiming it added the same ledger twice.
assert (not LedgerStorage.register(registry, launched));
Debug.print("PASS: registering twice reports no addition");

// Registering one ledger must not vouch for its neighbours.
assert (not LedgerStorage.isAllowed(registry, "god5q-iaaaa-aaaae-qkiea-cai"));
for (id in Config.CHAIN_KEY_LEDGERS.vals()) {
  assert (LedgerStorage.isAllowed(registry, id));
};
Debug.print("PASS: registration widens the boundary by exactly one id");

Debug.print("ALL LEDGER STORAGE TESTS PASSED");
