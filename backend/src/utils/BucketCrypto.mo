import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Nat32 "mo:core/Nat32";
import Array "mo:core/Array";
import Config "../config/Config";
import Sha256 "Sha256";

// Per-bucket encryption at rest. Derives a 256-bit key once, then XORs the
// plaintext in one pass — fast enough for 10 MB uploads on a canister.
module {

  private let FP_SEED : Nat = 5381;
  private let FP_MOD : Nat = 18446744073709551616;
  private let FINGERPRINT_PREFIX = "fp:";

  public func deriveKey(owner: Principal, bucketId: Text) : [Nat8] {
    let material = Principal.toText(owner) # ":" # bucketId # ":" # Config.BUCKET_CRYPTO_SALT;
    Sha256.sha256(Blob.toArray(Text.encodeUtf8(material)))
  };

  public type SealedBlob = {
    ciphertext: Blob;
    fingerprint: Text;
  };

  // Encrypt and fingerprint in one pass over the plaintext — avoids a separate
  // full-file SHA256, which exceeds the 40B instruction limit on multi-MB files.
  public func seal(plaintext: Blob, key: [Nat8]) : SealedBlob {
    let bytes = Blob.toVarArray(plaintext);
    let n = bytes.size();
    if (n == 0 or key.size() == 0) {
      return { ciphertext = plaintext; fingerprint = fingerprintText(FP_SEED, 0) };
    };
    var hash = FP_SEED;
    var i = 0;
    while (i < n) {
      let plain = bytes[i];
      hash := mixByte(hash, plain);
      bytes[i] := xor8(plain, key[i % key.size()]);
      i += 1;
    };
    {
      ciphertext = Blob.fromVarArray(bytes);
      fingerprint = fingerprintText(hash, n);
    }
  };

  public func open(ciphertext: Blob, key: [Nat8], expected: Text) : ?Blob {
    if (not Text.startsWith(expected, #text FINGERPRINT_PREFIX)) {
      return null;
    };
    let bytes = Blob.toVarArray(ciphertext);
    let n = bytes.size();
    if (n == 0 or key.size() == 0) {
      if (expected == fingerprintText(FP_SEED, 0)) {
        return ?ciphertext;
      };
      return null;
    };
    var hash = FP_SEED;
    var i = 0;
    while (i < n) {
      let enc = bytes[i];
      let plain = xor8(enc, key[i % key.size()]);
      hash := mixByte(hash, plain);
      bytes[i] := plain;
      i += 1;
    };
    if (fingerprintText(hash, n) != expected) return null;
    ?Blob.fromVarArray(bytes)
  };

  public func encrypt(plaintext: Blob, key: [Nat8]) : Blob {
    seal(plaintext, key).ciphertext
  };

  public func decrypt(ciphertext: Blob, key: [Nat8]) : Blob {
    let bytes = Blob.toVarArray(ciphertext);
    let n = bytes.size();
    if (n == 0 or key.size() == 0) return ciphertext;
    var i = 0;
    while (i < n) {
      bytes[i] := xor8(bytes[i], key[i % key.size()]);
      i += 1;
    };
    Blob.fromVarArray(bytes)
  };

  // XOR decrypt a byte range only — used for HTTP streaming without loading the full file.
  public func decryptSlice(ciphertext: Blob, key: [Nat8], offset: Nat, limit: Nat) : Blob {
    if (key.size() == 0) return Blob.fromArray([]);
    let bytes = Blob.toArray(ciphertext);
    let n = bytes.size();
    if (offset >= n) return Blob.fromArray([]);
    let end = if (offset + limit > n) { n } else { offset + limit };
    let len = end - offset;
    if (len == 0) return Blob.fromArray([]);
    Blob.fromArray(
      Array.tabulate<Nat8>(len, func(i) {
        let pos = offset + i;
        xor8(bytes[pos], key[pos % key.size()])
      }),
    )
  };

  public func isFastFingerprint(checksum: Text) : Bool {
    Text.startsWith(checksum, #text FINGERPRINT_PREFIX)
  };

  private func fingerprintText(hash: Nat, size: Nat) : Text {
    FINGERPRINT_PREFIX # Nat.toText(hash) # ":" # Nat.toText(size)
  };

  private func mixByte(hash: Nat, byte: Nat8) : Nat {
    Nat.rem(hash * 33 + Nat8.toNat(byte), FP_MOD)
  };

  private func xor8(a: Nat8, b: Nat8) : Nat8 {
    let x = Nat32.fromNat(Nat8.toNat(a));
    let y = Nat32.fromNat(Nat8.toNat(b));
    Nat8.fromNat(Nat32.toNat(x ^ y))
  };

};
