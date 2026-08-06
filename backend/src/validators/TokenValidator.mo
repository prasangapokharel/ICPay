import Text "mo:core/Text";
import Nat8 "mo:core/Nat8";
import Config "../config/Config";

module {
  public type LaunchParams = {
    name: Text;
    symbol: Text;
    description: Text;
    logo: ?Text;
    website: ?Text;
    telegram: ?Text;
    twitter: ?Text;
    decimals: Nat8;
    totalSupply: Nat;
    immutable: Bool;
  };

  // Symbols are compared case-insensitively so "doge" cannot be launched
  // alongside "DOGE" and pass for it. The form the creator typed is kept on the
  // record; this is only the comparison key.
  public func normalizeSymbol(s: Text): Text {
    Text.toUpper(s);
  };

  public func validate(p: LaunchParams): ?Text {
    switch (validateName(p.name)) { case (?e) { return ?e }; case (null) {} };
    switch (validateSymbol(p.symbol)) { case (?e) { return ?e }; case (null) {} };
    if (p.description.size() > Config.MAX_TOKEN_DESCRIPTION_LENGTH) {
      return ?("Description too long (max " # debug_show Config.MAX_TOKEN_DESCRIPTION_LENGTH # " chars)");
    };
    switch (validateLink(p.website)) { case (?e) { return ?e }; case (null) {} };
    switch (validateLink(p.telegram)) { case (?e) { return ?e }; case (null) {} };
    switch (validateLink(p.twitter)) { case (?e) { return ?e }; case (null) {} };
    switch (validateLogo(p.logo)) { case (?e) { return ?e }; case (null) {} };
    if (p.decimals > Config.MAX_TOKEN_DECIMALS) {
      return ?("Decimals must be at most " # debug_show Config.MAX_TOKEN_DECIMALS);
    };
    if (p.totalSupply == 0) { return ?"Total supply must be greater than zero" };
    null;
  };

  public func validateName(name: Text): ?Text {
    let len = name.size();
    if (len < Config.MIN_TOKEN_NAME_LENGTH) { return ?"Name is required" };
    if (len > Config.MAX_TOKEN_NAME_LENGTH) {
      return ?("Name too long (max " # debug_show Config.MAX_TOKEN_NAME_LENGTH # " chars)");
    };
    null;
  };

  public func validateSymbol(symbol: Text): ?Text {
    let up = normalizeSymbol(symbol);
    let len = up.size();
    if (len < Config.MIN_TOKEN_SYMBOL_LENGTH) {
      return ?("Symbol too short (min " # debug_show Config.MIN_TOKEN_SYMBOL_LENGTH # " chars)");
    };
    if (len > Config.MAX_TOKEN_SYMBOL_LENGTH) {
      return ?("Symbol too long (max " # debug_show Config.MAX_TOKEN_SYMBOL_LENGTH # " chars)");
    };
    for (c in up.chars()) {
      if (not ((c >= 'A' and c <= 'Z') or (c >= '0' and c <= '9'))) {
        return ?"Symbol may contain only letters and digits";
      };
    };
    null;
  };

  // These render as clickable links on the token page. Without a scheme check
  // `javascript:` is stored XSS, so the rule lives here rather than only in the
  // form where a direct canister call would bypass it.
  public func validateLink(link: ?Text): ?Text {
    switch (link) {
      case (null) { null };
      case (?l) {
        if (l.size() == 0) { return null };
        if (l.size() > Config.MAX_TOKEN_LINK_LENGTH) { return ?"Link too long" };
        if (not Text.startsWith(l, #text "https://")) {
          return ?"Links must start with https://";
        };
        null;
      };
    };
  };

  // Stored inline on the record and served to every holder, so the cap is well
  // below what ICRC-1 metadata would permit.
  public func validateLogo(logo: ?Text): ?Text {
    switch (logo) {
      case (null) { null };
      case (?l) {
        if (l.size() == 0) { return null };
        if (not Text.startsWith(l, #text "data:image/")) {
          return ?"Logo must be a data URI";
        };
        if (l.size() > Config.MAX_TOKEN_LOGO_BYTES) {
          return ?("Logo too large (max " # debug_show Config.MAX_TOKEN_LOGO_BYTES # " bytes)");
        };
        null;
      };
    };
  };
};
