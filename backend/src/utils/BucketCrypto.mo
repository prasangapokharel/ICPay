import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Nat32 "mo:core/Nat32";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Config "../config/Config";
import Sha256 "Sha256";
import BlobUtil "BlobUtil";

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
    sealFromChunks([plaintext], key)
  };

  // Encrypt + fingerprint in one pass over ordered chunks — avoids assembling a full
  // plaintext blob before seal (completeFileUpload would otherwise copy twice).
  public func sealFromChunks(chunks: [Blob], key: [Nat8]) : SealedBlob {
    if (chunks.size() == 0) {
      return { ciphertext = Blob.fromArray([]); fingerprint = fingerprintText(FP_SEED, 0) };
    };
    var hash = FP_SEED;
    var totalSize : Nat = 0;
    var cipherParts : [Blob] = [];
    for (chunk in chunks.vals()) {
      let bytes = Blob.toVarArray(chunk);
      let n = bytes.size();
      if (n == 0 or key.size() == 0) {
        var j = 0;
        while (j < n) {
          hash := mixByte(hash, bytes[j]);
          j += 1;
        };
        cipherParts := Array.concat(cipherParts, [chunk]);
      } else {
        var j = 0;
        while (j < n) {
          let plain = bytes[j];
          hash := mixByte(hash, plain);
          bytes[j] := xor8(plain, key[(totalSize + j) % key.size()]);
          j += 1;
        };
        cipherParts := Array.concat(cipherParts, [Blob.fromVarArray(bytes)]);
      };
      totalSize += n;
    };
    let ciphertext = if (cipherParts.size() == 1) {
      cipherParts[0]
    } else {
      BlobUtil.concat(cipherParts)
    };
    {
      ciphertext;
      fingerprint = fingerprintText(hash, totalSize);
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
    let lenInt = Int.sub(Int.fromNat(end), Int.fromNat(offset));
    if (lenInt <= 0) return Blob.fromArray([]);
    let len = Int.toNat(lenInt);
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
