import Time "mo:core/Time";
import Int "mo:core/Int";

module {
  // Returns a timestamp-based id. Time.now() already distinguishes ids across
  // rounds, since rounds are at least ~milliseconds apart in wall time. It is
  // NOT enough on its own to distinguish two rows minted in the same round
  // (Time.now() is constant for the duration of an update call), so the actor
  // decorates this with a monotonic counter (see nextUid in src/main.mo) at the
  // call sites that create more than one row per round. The library itself must
  // stay stateless: moc rejects a module-level `var` in a non-actor module.
  public func generate(): Text {
    Int.toText(Time.now());
  };
};
