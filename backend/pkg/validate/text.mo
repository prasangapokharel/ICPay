import Text "mo:core/Text";
import Nat "mo:core/Nat";

module {
  public func required(value: Text, field: Text) : ?Text {
    if (value.size() == 0) { ?(field # " is required") } else { null }
  };

  public func minLen(value: Text, min: Nat, field: Text) : ?Text {
    if (value.size() < min) {
      ?(field # " must be at least " # Nat.toText(min) # " characters")
    } else {
      null
    }
  };

  public func maxLen(value: Text, max: Nat, field: Text) : ?Text {
    if (value.size() > max) {
      ?(field # " must be at most " # Nat.toText(max) # " characters")
    } else {
      null
    }
  };

  public func slug(value: Text, field: Text) : ?Text {
    if (value.size() == 0) { return ?(field # " is required") };
    for (c in value.chars()) {
      let ok = (c >= 'a' and c <= 'z')
        or (c >= '0' and c <= '9')
        or c == '-';
      if (not ok) {
        return ?(field # " may only contain lowercase letters, digits, and hyphens");
      };
    };
    null
  };

  public func absPath(path: Text) : ?Text {
    if (path.size() == 0) { return ?("Path is required") };
    if (not Text.startsWith(path, #text "/")) { return ?("Path must start with /") };
    if (Text.contains(path, #text "..")) { return ?("Path may not contain ..") };
    null
  };

  public func noSpaces(value: Text, field: Text) : ?Text {
    for (c in value.chars()) {
      if (c == ' ') { return ?(field # " may not contain spaces") };
    };
    null
  };
};
