import Principal "mo:core/Principal";
import Types "../types";

module {
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
