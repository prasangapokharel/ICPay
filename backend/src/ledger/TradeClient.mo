import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Text "mo:core/Text";
import LedgerTypes "../ledger/Types";

module {
  public type SwapResultRemote = {
    block_index: Nat64;
    amount_in: Nat;
    amount_out: Nat;
    service_fee: Nat;
    tx_id: Text;
  };

  public type Actor = actor {
    credit_from_wallet : shared (Principal, Text, Nat, Nat64) -> async { #Ok; #Err: Text };
    debit_to_wallet : shared (Principal, Text, Nat, LedgerTypes.Account) -> async { #Ok: Nat; #Err: Text };
    execute_swap_for_user : shared (Principal, Text, Text, Nat, Nat) -> async {
      #Ok: SwapResultRemote;
      #Err: Text;
    };
    get_trading_balance : query (Principal, Text) -> async Nat;
  };

  public func connect(canisterId: Text) : Actor {
    actor (canisterId) : Actor
  };
};
