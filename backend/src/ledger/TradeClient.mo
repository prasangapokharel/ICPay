import Principal "mo:core/Principal";
import LedgerTypes "../ledger/Types";

module {
  public type Actor = actor {
    credit_from_wallet : shared (Principal, Text, Nat, Nat64) -> async { #Ok; #Err: Text };
    debit_to_wallet : shared (Principal, Text, Nat, LedgerTypes.Account) -> async { #Ok: Nat; #Err: Text };
  };

  public func connect(canisterId: Text) : Actor {
    actor (canisterId) : Actor
  };
};
