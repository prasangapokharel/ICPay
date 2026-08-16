import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Nat8 "mo:core/Nat8";
import Text "mo:core/Text";

module {
  private func nibble(c: Char) : Nat8 {
    switch (c) {
      case ('0') { 0 };
      case ('1') { 1 };
      case ('2') { 2 };
      case ('3') { 3 };
      case ('4') { 4 };
      case ('5') { 5 };
      case ('6') { 6 };
      case ('7') { 7 };
      case ('8') { 8 };
      case ('9') { 9 };
      case ('a' or 'A') { 10 };
      case ('b' or 'B') { 11 };
      case ('c' or 'C') { 12 };
      case ('d' or 'D') { 13 };
      case ('e' or 'E') { 14 };
      case ('f' or 'F') { 15 };
      case (_) { 0 };
    }
  };

  public func decode(hex: Text) : Blob {
    let len = hex.size() / 2;
    let chars = Text.toArray(hex);
    let bytes = Array.tabulate<Nat8>(len, func(i) {
      (nibble(chars[i * 2]) << 4) | nibble(chars[i * 2 + 1])
    });
    Blob.fromArray(bytes)
  };

  private let HEX = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

  public func encode(bytes: [Nat8]) : Text {
    var out = "";
    for (byte in bytes.vals()) {
      let n = Nat8.toNat(byte);
      out := out # HEX[n / 16] # HEX[n % 16];
    };
    out
  };

  public func encodeBlob(data: Blob) : Text {
    encode(Blob.toArray(data))
  };

  public func isHex(text: Text) : Bool {
    if (text.size() == 0 or text.size() % 2 != 0) { return false };
    for (c in text.chars()) {
      let ok = (c >= '0' and c <= '9')
        or (c >= 'a' and c <= 'f')
        or (c >= 'A' and c <= 'F');
      if (not ok) { return false };
    };
    true
  };
};
