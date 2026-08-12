import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Iter "mo:core/Iter";
import Nat8 "mo:core/Nat8";
import Nat "mo:core/Nat";
import Nat32 "mo:core/Nat32";
import Nat64 "mo:core/Nat64";
import VarArray "mo:core/VarArray";

// FIPS 180-4 SHA-256. Pure and dependency-free (no vendored `mo:crypto`
// package), replacing Text.hash -- a 32-bit value with a fixed short domain
// that is fine for a hash map but useless as a file checksum.
module {

  private let K : [Nat32] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  private let H0 : Nat32 = 0x6a09e667;
  private let H1 : Nat32 = 0xbb67ae85;
  private let H2 : Nat32 = 0x3c6ef372;
  private let H3 : Nat32 = 0xa54ff53a;
  private let H4 : Nat32 = 0x510e527f;
  private let H5 : Nat32 = 0x9b05688c;
  private let H6 : Nat32 = 0x1f83d9ab;
  private let H7 : Nat32 = 0x5be0cd19;

  private func rotr(x : Nat32, n : Nat32) : Nat32 {
    (x >> n) | (x << (32 - n))
  };

  private func add32(a : Nat32, b : Nat32) : Nat32 {
    Nat32.fromNat((Nat32.toNat(a) + Nat32.toNat(b)) % 4_294_967_296)
  };

  private func add32All(a : Nat32, b : Nat32, c : Nat32, d : Nat32) : Nat32 {
    add32(add32(add32(a, b), c), d)
  };

  private func be32ToNat32(b : [var Nat8], off : Nat) : Nat32 {
    Nat32.fromNat(Nat8.toNat(b[off])) << 24
    | Nat32.fromNat(Nat8.toNat(b[off + 1])) << 16
    | Nat32.fromNat(Nat8.toNat(b[off + 2])) << 8
    | Nat32.fromNat(Nat8.toNat(b[off + 3]))
  };

  private func nat32ToBe32(w : Nat32) : [Nat8] {
    [
      Nat8.fromNat(Nat32.toNat(w >> 24)),
      Nat8.fromNat(Nat32.toNat((w >> 16) & 0xff)),
      Nat8.fromNat(Nat32.toNat((w >> 8) & 0xff)),
      Nat8.fromNat(Nat32.toNat(w & 0xff)),
    ]
  };

  public func sha256(data : [Nat8]) : [Nat8] {
    let bitLen = Nat64.fromNat(data.size()) * 8;

    // Message padding: append 0x80, then zeros until the length is 56 mod 64,
    // then the 8-byte big-endian bit count.
    let rem = (data.size() + 1) % 64;
    let pad = if (rem <= 56) { Nat.sub(56, rem) } else { Nat.sub(120, rem) };
    let padded : [var Nat8] = VarArray.repeat<Nat8>(0, data.size() + 1 + pad + 8);
    for (i in data.keys()) {
      padded[i] := data[i];
    };
    padded[data.size()] := 0x80;
    let lenOff = Nat.sub(padded.size(), 8);
    padded[lenOff]     := Nat8.fromNat(Nat64.toNat(bitLen >> 56));
    padded[lenOff + 1] := Nat8.fromNat(Nat64.toNat((bitLen >> 48) & 0xff));
    padded[lenOff + 2] := Nat8.fromNat(Nat64.toNat((bitLen >> 40) & 0xff));
    padded[lenOff + 3] := Nat8.fromNat(Nat64.toNat((bitLen >> 32) & 0xff));
    padded[lenOff + 4] := Nat8.fromNat(Nat64.toNat((bitLen >> 24) & 0xff));
    padded[lenOff + 5] := Nat8.fromNat(Nat64.toNat((bitLen >> 16) & 0xff));
    padded[lenOff + 6] := Nat8.fromNat(Nat64.toNat((bitLen >> 8) & 0xff));
    padded[lenOff + 7] := Nat8.fromNat(Nat64.toNat(bitLen & 0xff));

    var h0v = H0;
    var h1v = H1;
    var h2v = H2;
    var h3v = H3;
    var h4v = H4;
    var h5v = H5;
    var h6v = H6;
    var h7v = H7;

    let w = VarArray.repeat<Nat32>(0 : Nat32, 64);
    let blk = VarArray.repeat<Nat8>(0, 64);

    var pos = 0;
    while (pos < padded.size()) {
      for (i in blk.keys()) {
        blk[i] := padded[pos + i];
      };
      pos += 64;

      var wi = 0;
      while (wi <= 15) {
        w[wi] := be32ToNat32(blk, wi * 4);
        wi += 1;
      };
      var i = 16;
      while (i <= 63) {
        let w15 = w[i - 15];
        let w2 = w[i - 2];
        let s0 = rotr(w15, 7) ^ rotr(w15, 18) ^ (w15 >> 3);
        let s1 = rotr(w2, 17) ^ rotr(w2, 19) ^ (w2 >> 10);
        w[i] := add32All(w[i - 16], s0, w[i - 7], s1);
        i += 1;
      };

      var a = h0v;
      var b = h1v;
      var c = h2v;
      var d = h3v;
      var e = h4v;
      var f = h5v;
      var g = h6v;
      var h = h7v;

      i := 0;
      while (i <= 63) {
        let S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        let ch = (e & f) ^ (^e & g);
        let temp1 = add32All(h, S1, ch, add32(K[i], w[i]));
        let S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        let maj = (a & b) ^ (a & c) ^ (b & c);
        let temp2 = add32(S0, maj);
        h := g;
        g := f;
        f := e;
        e := add32(d, temp1);
        d := c;
        c := b;
        b := a;
        a := add32(temp1, temp2);
        i += 1;
      };

      h0v := add32(h0v, a);
      h1v := add32(h1v, b);
      h2v := add32(h2v, c);
      h3v := add32(h3v, d);
      h4v := add32(h4v, e);
      h5v := add32(h5v, f);
      h6v := add32(h6v, g);
      h7v := add32(h7v, h);
    };

    Array.concat(
      Array.concat(
        Array.concat(
          Array.concat(
            Array.concat(
              Array.concat(nat32ToBe32(h0v), nat32ToBe32(h1v)),
              nat32ToBe32(h2v),
            ),
            nat32ToBe32(h3v),
          ),
          nat32ToBe32(h4v),
        ),
        nat32ToBe32(h5v),
      ),
      Array.concat(nat32ToBe32(h6v), nat32ToBe32(h7v)),
    )
  };

  public func sha256Blob(data : Blob) : Blob {
    Blob.fromArray(sha256(Blob.toArray(data)))
  };

  private let HEX = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

  public func toHex(bytes : [Nat8]) : Text {
    var out = "";
    for (byte in bytes.vals()) {
      out := out # HEX[Nat8.toNat(byte) / 16] # HEX[Nat8.toNat(byte) % 16];
    };
    out
  };
};