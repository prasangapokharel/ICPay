import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Types "../types";
import Config "../config/Config";

module {
  // The ledger rejects an oversized memo, but only after we have written the
  // transaction row and paid for a consensus round. Rejecting it up front keeps
  // a failed row out of permanent storage and returns a message the user can act
  // on instead of the raw ledger error.
  public func validateMemo(memo: ?Text): ?Text {
    switch (memo) {
      case (?m) {
        if (Text.encodeUtf8(m).size() > Config.MEMO_MAX_BYTES) {
          return ?("Memo must be at most " # debug_show Config.MEMO_MAX_BYTES # " bytes");
        };
        null;
      };
      case (null) { null };
    };
  };

  public func validateDestination(dest: Text): ?Text {
    if (dest.size() == 0) {
      return ?"Destination cannot be empty";
    };
    null;
  };

  public func validateUsernameTransfer(name: Text): ?Text {
    if (name.size() == 0) {
      return ?"Username cannot be empty";
    };
    if (name.size() > 32) {
      return ?"Username too long";
    };
    null;
  };

  public func validateSelfTransfer(sender: Principal, recipient: Types.User): ?Text {
    if (sender == recipient.principal) {
      return ?"Cannot transfer to yourself";
    };
    null;
  };
};
