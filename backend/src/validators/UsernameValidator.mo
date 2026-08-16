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

  // Priced tier by length alone, so both a quote and a badge cost no state read
  // and the frontend can mirror the rule without a call.
  public type Tier = { #ultra; #premium; #standard; #basic };

  public func tierFor(name: Text): Tier {
    let len = name.size();
    if (len <= 3) { #ultra }
    else if (len == 4) { #premium }
    else if (len == 5) { #standard }
    else { #basic };
  };

  public func priceFor(name: Text): Nat {
    switch (tierFor(name)) {
      case (#ultra) { Config.PRICE_ULTRA_PREMIUM };
      case (#premium) { Config.PRICE_PREMIUM };
      case (#standard) { Config.PRICE_STANDARD };
      case (#basic) { Config.PRICE_BASIC };
    };
  };

  // Analytics and free CSV export are tied to the two scarcest paid tiers only.
  public func hasAnalyticsAccess(name: Text): Bool {
    let len = name.size();
    len >= Config.MIN_USERNAME_LENGTH and len <= 4;
  };

  public func hasFreeAnalyticsExport(name: Text): Bool {
    hasAnalyticsAccess(name);
  };

  func isValidChar(c: Char): Bool {
    (c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or (c >= '0' and c <= '9') or c == '_';
  };
};
