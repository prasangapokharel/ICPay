import Config "../config/Config";

module {
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

  func isValidChar(c: Char): Bool {
    (c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or (c >= '0' and c <= '9') or c == '_';
  };
};
