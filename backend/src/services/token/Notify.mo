import Nat64 "mo:core/Nat64";
import Cmc "../../ledger/Cmc";

module {
  public func describeNotifyError(e: Cmc.NotifyError): Text {
    switch (e) {
      case (#Refunded({ reason; block_index })) {
        switch (block_index) {
          case (?b) { "Cycles purchase refunded at block " # Nat64.toText(b) # ": " # reason };
          case (null) { "Cycles purchase refunded: " # reason };
        };
      };
      case (#InvalidTransaction(m)) { "Cycles minting rejected the payment: " # m };
      case (#Other({ error_message })) { error_message };
      case (#Processing) { "Cycles purchase is still processing, please retry" };
      case (#TransactionTooOld(_)) { "Payment expired before it reached the minter" };
    };
  };
};
