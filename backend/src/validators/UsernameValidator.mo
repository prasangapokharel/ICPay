import Text "mo:core/Text";
import Config "../config/Config";

module {
  // Usernames are how one user names another when sending funds, so "Alice" and
  // "alice" must not be separate accounts. Every lookup and uniqueness check
  // goes through this; the display form the user typed is kept on the record.
  public func normalize(name: Text): Text {
    Text.toLower(name);
  };

  public func validate(name: Text): ?Text {
    let len = name.size();
    if (len < Config.MIN_USERNAME_LENGTH) {
      return ?("Username too short (min " # debug_show Config.MIN_USERNAME_LENGTH # " chars)");
    };
    if (len > Config.MAX_USERNAME_LENGTH) {
      return ?("Username too long (max " # debug_show Config.MAX_USERNAME_LENGTH # " chars)");
    };
    for (c in name.chars()) {
      if (not isValidChar(c)) {
        return ?("Invalid character in username (alphanumeric and underscore only)");
      };
    };
    null;
  };

  // Short handles are the scarce inventory, so the free claim is held to 5+
  // chars and 1-4 stay purchasable. validate() is the looser rule the paid
  // path uses.
  public func validateFreeClaim(name: Text): ?Text {
    switch (validate(name)) {
      case (?err) { return ?err };
      case (null) {};
    };
    if (name.size() < Config.FREE_MIN_USERNAME_LENGTH) {
      return ?("Free usernames must be at least " # debug_show Config.FREE_MIN_USERNAME_LENGTH # " characters. Shorter names can be bought.");
    };
    null;
  };

  // Priced on length alone, so a quote costs no state read and the frontend can
  // mirror the same rule without a call.
  public func priceFor(name: Text): Nat {
    let len = name.size();
    if (len <= 3) {
      Config.PRICE_ULTRA_PREMIUM;
    } else if (len == 4) {
      Config.PRICE_PREMIUM;
    } else if (len == 5) {
      Config.PRICE_STANDARD;
    } else {
      Config.PRICE_BASIC;
    };
  };

  func isValidChar(c: Char): Bool {
    (c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or (c >= '0' and c <= '9') or c == '_';
  };
};
