import Text "mo:core/Text";

module {
  public func fromExtension(ext: Text) : Text {
    let lower = lowercase(ext);
    switch (lower) {
      case ("html" or "htm") "text/html; charset=utf-8";
      case ("css") "text/css; charset=utf-8";
      case ("js" or "mjs") "application/javascript; charset=utf-8";
      case ("json") "application/json; charset=utf-8";
      case ("txt") "text/plain; charset=utf-8";
      case ("svg") "image/svg+xml";
      case ("png") "image/png";
      case ("jpg" or "jpeg") "image/jpeg";
      case ("gif") "image/gif";
      case ("webp") "image/webp";
      case ("ico") "image/x-icon";
      case ("wasm") "application/wasm";
      case ("pdf") "application/pdf";
      case ("xml") "application/xml; charset=utf-8";
      case ("csv") "text/csv; charset=utf-8";
      case ("mp3") "audio/mpeg";
      case ("mp4") "video/mp4";
      case ("woff") "font/woff";
      case ("woff2") "font/woff2";
      case (_) "application/octet-stream";
    }
  };

  public func fromPath(path: Text) : Text {
    switch (lastSegment(path)) {
      case (null) "application/octet-stream";
      case (?name) {
        switch (lastPart(name, '.')) {
          case (null) "application/octet-stream";
          case (?ext) {
            if (ext == name) { "application/octet-stream" }
            else { fromExtension(ext) }
          };
        }
      };
    }
  };

  func lastSegment(path: Text) : ?Text {
    var last : ?Text = null;
    for (part in Text.split(path, #char '/')) {
      if (part.size() > 0) { last := ?part };
    };
    last
  };

  func lastPart(text: Text, sep: Char) : ?Text {
    var last : ?Text = null;
    for (part in Text.split(text, #char sep)) {
      last := ?part;
    };
    last
  };

  func lowercase(text: Text) : Text {
    var out = "";
    for (c in text.chars()) {
      out := out # (if (c >= 'A' and c <= 'Z') { charLower(c) } else { Text.fromChar(c) });
    };
    out
  };

  func charLower(c: Char) : Text {
    switch (c) {
      case ('A') "a"; case ('B') "b"; case ('C') "c"; case ('D') "d";
      case ('E') "e"; case ('F') "f"; case ('G') "g"; case ('H') "h";
      case ('I') "i"; case ('J') "j"; case ('K') "k"; case ('L') "l";
      case ('M') "m"; case ('N') "n"; case ('O') "o"; case ('P') "p";
      case ('Q') "q"; case ('R') "r"; case ('S') "s"; case ('T') "t";
      case ('U') "u"; case ('V') "v"; case ('W') "w"; case ('X') "x";
      case ('Y') "y"; case ('Z') "z";
      case (_) Text.fromChar(c);
    }
  };
};
