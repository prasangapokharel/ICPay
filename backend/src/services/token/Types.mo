import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Nat16 "mo:core/Nat16";
import Nat64 "mo:core/Nat64";
import LedgerTypes "../../ledger/Types";

module {
  public type LedgerInitArgs = {
    token_name: Text;
    token_symbol: Text;
    decimals: ?Nat8;
    transfer_fee: Nat;
    minting_account: LedgerTypes.Account;
    fee_collector_account: ?LedgerTypes.Account;
    initial_balances: [(LedgerTypes.Account, Nat)];
    metadata: [(Text, LedgerTypes.Value)];
    max_memo_length: ?Nat16;
    index_principal: ?Principal;
    archive_options: {
      num_blocks_to_archive: Nat64;
      max_transactions_per_response: ?Nat64;
      trigger_threshold: Nat64;
      max_message_size_bytes: ?Nat64;
      cycles_for_archive_creation: ?Nat64;
      node_max_memory_size_bytes: ?Nat64;
      controller_id: Principal;
      more_controller_ids: ?[Principal];
    };
    feature_flags: ?{ icrc2: Bool };
  };

  public type LedgerArg = { #Init: LedgerInitArgs };
};
