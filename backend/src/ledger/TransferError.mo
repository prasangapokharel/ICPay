import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Types "Types";

// The ledger is the only thing that checks funds now, so its rejection is the
// only message a user ever sees for a failed send. debug_show would render
// #InsufficientFunds({balance = 1_234}) -- these turn each variant into a
// sentence, and carry the balance the ledger already reported back out.
module {
  public func describe(e: Types.TransferError): Text {
    switch (e) {
      case (#InsufficientFunds({ balance })) {
        "Insufficient balance (have " # Nat.toText(balance) # " e8s)";
      };
      case (#BadFee({ expected_fee })) {
        "Ledger fee changed (expected " # Nat.toText(expected_fee) # " e8s)";
      };
      case (#BadBurn({ min_burn_amount })) {
        "Amount below the minimum burn (" # Nat.toText(min_burn_amount) # " e8s)";
      };
      case (#TooOld) { "Request expired before it reached the ledger, please retry" };
      case (#CreatedInFuture(_)) { "Device clock is ahead of the network, please retry" };
      case (#Duplicate({ duplicate_of })) {
        "Already sent (block " # Nat.toText(duplicate_of) # ")";
      };
      case (#TemporarilyUnavailable) { "Ledger is temporarily unavailable, please retry" };
      case (#GenericError({ message })) { message };
    };
  };

  public func describeOld(e: Types.OldTransferError): Text {
    switch (e) {
      case (#InsufficientFunds({ balance })) {
        "Insufficient balance (have " # Nat64.toText(balance.e8s) # " e8s)";
      };
      case (#BadFee({ expected_fee })) {
        "Ledger fee changed (expected " # Nat64.toText(expected_fee.e8s) # " e8s)";
      };
      case (#TxTooOld(_)) { "Request expired before it reached the ledger, please retry" };
      case (#TxCreatedInFuture) { "Device clock is ahead of the network, please retry" };
      case (#TxDuplicate({ duplicate_of })) {
        "Already sent (block " # Nat64.toText(duplicate_of) # ")";
      };
    };
  };
};
