import Principal "mo:core/Principal";
import Text "mo:core/Text";

/// Patterns for async inter-canister calls on ICP.
///
/// Queries are free; updates cost cycles and take ~2–3s per sequential `await`.
/// Start independent calls before awaiting any of them so the IC runs them
/// concurrently:
///
///   let f1 = ledger.getBalance(account);
///   let f2 = ledger.getFee();
///   let b = await f1;
///   let fee = await f2;
///
/// Do not add pre-flight balance reads before transfers — the ledger returns
/// `#InsufficientFunds` and a pre-read is racy.
module {
  public func samePrincipal(a: Principal, b: Principal) : Bool {
    a == b
  };
};
