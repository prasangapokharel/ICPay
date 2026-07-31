import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Nat8 "mo:core/Nat8";
import Text "mo:core/Text";

module {
  public func now(): Int {
    0
  };

  public func hexToBlob(hex: Text): Blob {
    let len = hex.size() / 2;
    let chars = Text.toArray(hex);
    let bytes = Array.tabulate<Nat8>(len, func(i) {
      (nibble(chars[i * 2]) << 4) | nibble(chars[i * 2 + 1])
    });
    Blob.fromArray(bytes)
  };

  func nibble(c: Char): Nat8 {
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
    };
  };
};
