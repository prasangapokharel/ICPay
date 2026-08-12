import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Config "../config/Config";

// Ledger memos are capped at 32 UTF-8 bytes. Helpers keep service memos inside
// that limit without rejecting otherwise-valid bucket names.
module {
  public func byteLength(t: Text) : Nat {
    Text.encodeUtf8(t).size()
  };

  public func truncateUtf8(t: Text, maxBytes: Nat) : Text {
    if (byteLength(t) <= maxBytes) return t;
    var out = "";
    var used = 0;
    for (c in t.chars()) {
      let piece = Text.fromChar(c);
      let pieceBytes = Text.encodeUtf8(piece).size();
      if (used + pieceBytes > maxBytes) return out;
      out := out # piece;
      used += pieceBytes;
    };
    out
  };

  public func bucketCreate(name: Text, capacityGB: Nat) : Text {
    let suffix = ":" # Nat.toText(capacityGB) # "G";
    let prefix = "B:";
    let budget = Nat.sub(Config.MEMO_MAX_BYTES, byteLength(prefix # suffix));
    prefix # truncateUtf8(name, budget) # suffix
  };

  public func bucketRenew(name: Text) : Text {
    let prefix = "R:";
    let budget = Nat.sub(Config.MEMO_MAX_BYTES, byteLength(prefix));
    prefix # truncateUtf8(name, budget)
  };
};
