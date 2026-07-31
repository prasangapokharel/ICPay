import Blob "mo:core/Blob";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Nat8 "mo:core/Nat8";

module {
  // Length-prefixed, right-aligned principal in 32 bytes. The prefix makes the
  // encoding injective: without it a short principal zero-padded to 32 bytes
  // could collide with a longer principal whose trailing bytes are zero.
  public func fromPrincipal(p: Principal): Blob {
    let bytes = Blob.toArray(Principal.toBlob(p));
    let len = bytes.size();
    assert (len <= 29);
    let padding = 32 - len - 1 : Nat;
    let sub = Array.tabulate<Nat8>(32, func i {
      if (i < padding) { 0 } else if (i == padding) { Nat8.fromNat(len) } else {
        bytes[i - padding - 1];
      };
    });
    Blob.fromArray(sub);
  };

  public func toArray(b: Blob): [Nat8] {
    Blob.toArray(b);
  };
};
