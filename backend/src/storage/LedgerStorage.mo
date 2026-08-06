import Set "mo:core/Set";
import Text "mo:core/Text";
import Config "../config/Config";

module {
  // Which ledgers the custodian is willing to call. This is a security boundary,
  // not a convenience list: `actor(id)` on an unvalidated string would let a
  // caller point the custodian at a canister they wrote, which can return a
  // forged #Ok and write a "you received funds" row into someone else's history.
  //
  // Only the SNS-discovered half is stored. The chain-key ledgers are compiled
  // in, so an empty or stale cache can never make ICP unspendable.
  public type LedgerRegistry = Set.Set<Text>;

  public func createLedgerRegistry(): LedgerRegistry { Set.empty<Text>() };

  // Callers must have established that the ledger is one this canister created
  // or that the NNS vouches for. Nothing here re-checks that, so an unvalidated
  // id reaching this function widens the boundary described above.
  public func register(registry: LedgerRegistry, ledgerId: Text): Bool {
    if (Set.contains(registry, Text.compare, ledgerId)) { return false };
    Set.add(registry, Text.compare, ledgerId);
    true;
  };

  public func isAllowed(registry: LedgerRegistry, ledgerId: Text): Bool {
    for (id in Config.CHAIN_KEY_LEDGERS.vals()) {
      if (id == ledgerId) { return true };
    };
    Set.contains(registry, Text.compare, ledgerId);
  };
};
