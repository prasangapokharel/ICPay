import Text "mo:core/Text";

module {
  public func stripQuery(url: Text) : Text {
    switch (Text.split(url, #char '?').next()) {
      case (null) url;
      case (?base) base;
    }
  };

  public func stripFragment(url: Text) : Text {
    switch (Text.split(url, #char '#').next()) {
      case (null) url;
      case (?base) base;
    }
  };

  public func normalizePath(path: Text) : Text {
    if (path.size() == 0) { "/" }
    else if (Text.startsWith(path, #text "/")) { path }
    else { "/" # path }
  };

  public func join(base: Text, segment: Text) : Text {
    let s = normalizePath(segment);
    if (base.size() == 0) { s }
    else if (Text.endsWith(base, #text "/")) {
      if (Text.startsWith(s, #text "/") and s.size() > 1) {
        base # dropFirst(s)
      } else if (s == "/") { base }
      else { base # s }
    } else { base # s }
  };

  func dropFirst(text: Text) : Text {
    var out = "";
    var skip = true;
    for (c in text.chars()) {
      if (skip) { skip := false }
      else { out := out # Text.fromChar(c) };
    };
    out
  };

  public func fileName(path: Text) : Text {
    var last = "";
    for (part in Text.split(path, #char '/')) {
      if (part.size() > 0) { last := part };
    };
    last
  };

  public func extension(path: Text) : ?Text {
    let name = fileName(path);
    var last : ?Text = null;
    for (part in Text.split(name, #char '.')) {
      last := ?part;
    };
    switch (last) {
      case (null) null;
      case (?ext) {
        if (ext == name) { null } else { ?ext }
      };
    }
  };
};
