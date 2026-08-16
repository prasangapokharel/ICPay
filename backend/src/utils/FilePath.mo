import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Char "mo:core/Char";

module {
  public func fileName(path: Text) : Text {
    let parts = Iter.toArray(Text.split(path, #char '/'));
    if (parts.size() == 0) return path;
    let last = parts[parts.size() - 1];
    if (last.size() > 0) last else path
  };

  public func hasPrefix(path: Text, prefix: Text) : Bool {
    if (prefix.size() == 0) return true;
    Text.startsWith(path, #text prefix)
  };

  public func containsIgnoreCase(haystack: Text, needle: Text) : Bool {
    if (needle.size() == 0) return true;
    let h = Text.toArray(Text.toLower(haystack));
    let n = Text.toArray(Text.toLower(needle));
    if (n.size() > h.size()) return false;
    var i = 0;
    while (i + n.size() <= h.size()) {
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
      if (matched) return true;
      i += 1;
    };
    false
  };
};
