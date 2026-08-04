import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Char "mo:core/Char";

module {
  public func validatePrincipal(p: Principal): ?Text {
    if (Principal.isAnonymous(p)) {
      ?"Invalid principal (anonymous)";
    } else {
      null;
    };
  };

  // An account identifier must be exactly 32 bytes of hex, and every character
  // has to be a real hex digit. A silent misread here would turn the identifier
  // into the wrong account -- the ledger would reject on checksum or length,
  // but only after we had already written the transaction row and paid for the
  // round.
  public func validateAccountId(id: Text): ?Text {
    if (id.size() != 64) {
      return ?"Invalid account identifier length (expected 64 hex chars)";
    };
    for (c in Text.toArray(id).vals()) {
      if (not isHex(c)) {
        return ?"Invalid account identifier (non-hex character)";
      };
    };
    null;
  };

  func isHex(c: Char): Bool {
    let code = Char.toNat32(c);
    (code >= 0x30 and code <= 0x39) // 0-9
      or (code >= 0x61 and code <= 0x66) // a-f
      or (code >= 0x41 and code <= 0x46); // A-F
  };
};
