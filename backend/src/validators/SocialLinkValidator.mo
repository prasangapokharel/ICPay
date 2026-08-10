import Text "mo:core/Text";
import Types "../types";

module {
  let ALLOWED_TLDS = [".com", ".app", ".ai", ".shop", ".net", ".io"];

  func hasAllowedTld(url: Text): Bool {
    for (tld in ALLOWED_TLDS.vals()) {
      // The TLD must appear before any trailing path: check that the url
      // contains the TLD followed by either "/" or end of string.
      let withSlash = tld # "/";
      if (Text.endsWith(url, #text tld) or url.contains(#text withSlash)) {
        return true;
      };
    };
    false;
  };

  public func validate(platform: Types.SocialPlatform, url: Text): ?Text {
    if (not Text.startsWith(url, #text "https://")) {
      return ?"URL must start with https://";
    };
    switch (platform) {
      case (#github) {
        if (not url.contains(#text "://github.com/") and not url.contains(#text "://www.github.com/")) {
          return ?"GitHub URL must be github.com/";
        };
      };
      case (#linkedin) {
        if (not url.contains(#text "://linkedin.com/in/") and not url.contains(#text "://www.linkedin.com/in/")) {
          return ?"LinkedIn URL must be linkedin.com/in/";
        };
      };
      case (#website) {
        if (url.contains(#text "localhost") or url.contains(#text "127.0.0.1")) {
          return ?"Localhost URLs are not allowed";
        };
        if (not hasAllowedTld(url)) {
          return ?"Website must use an allowed TLD: .com .app .ai .shop .net .io";
        };
      };
    };
    null;
  };
};
