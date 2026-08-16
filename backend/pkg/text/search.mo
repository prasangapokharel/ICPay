import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Array "mo:core/Array";

module {
  public func hasPrefix(haystack: Text, prefix: Text) : Bool {
    if (prefix.size() == 0) { true }
    else { Text.startsWith(haystack, #text prefix) }
  };

  public func hasSuffix(haystack: Text, suffix: Text) : Bool {
    if (suffix.size() == 0) { true }
    else { Text.endsWith(haystack, #text suffix) }
  };

  public func containsIgnoreCase(haystack: Text, needle: Text) : Bool {
    if (needle.size() == 0) { return true };
    let h = Text.toArray(Text.toLower(haystack));
    let n = Text.toArray(Text.toLower(needle));
    if (n.size() > h.size()) { return false };
    var i = 0;
    label search while (i + n.size() <= h.size()) {
      var matched = true;
      var j : Nat = 0;
      while (j < n.size()) {
        if (h[i + j] != n[j]) {
          matched := false;
          j := n.size();
        } else {
          j += 1;
        };
      };
      if (matched) { return true };
      i += 1;
    };
    false
  };

  public func equalsIgnoreCase(a: Text, b: Text) : Bool {
    Text.toLower(a) == Text.toLower(b)
  };
};
