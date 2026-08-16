import Text "mo:core/Text";
import Nat "mo:core/Nat";

module {
  public func byteLength(text: Text) : Nat {
    Text.encodeUtf8(text).size()
  };

  /// Truncate at a UTF-8 byte boundary (safe for ledger memos and HTTP headers).
  public func truncateUtf8(text: Text, maxBytes: Nat) : Text {
    if (byteLength(text) <= maxBytes) { return text };
    var out = "";
    var used = 0;
    for (c in text.chars()) {
      let piece = Text.fromChar(c);
      let pieceBytes = Text.encodeUtf8(piece).size();
      if (used + pieceBytes > maxBytes) { return out };
      out := out # piece;
      used += pieceBytes;
    };
    out
  };

  public func prefixWithBudget(prefix: Text, body: Text, suffix: Text, maxBytes: Nat) : Text {
    let fixed = byteLength(prefix # suffix);
    if (fixed >= maxBytes) {
      truncateUtf8(prefix # suffix, maxBytes)
    } else {
      prefix # truncateUtf8(body, maxBytes - fixed) # suffix
    }
  };
};
