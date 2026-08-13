import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Nat8 "mo:core/Nat8";
import Array "mo:core/Array";
import BucketCrypto "../../src/utils/BucketCrypto";
import BlobUtil "../../src/utils/BlobUtil";

let owner = Principal.fromText("aaaaa-aa");
let bucketId = "bucket-crypto-1";
let plaintext = Blob.fromArray([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

let key = BucketCrypto.deriveKey(owner, bucketId);
let encrypted = BucketCrypto.encrypt(plaintext, key);
let decrypted = BucketCrypto.decrypt(encrypted, key);

assert decrypted == plaintext;
assert encrypted != plaintext;
Debug.print("PASS: encrypt/decrypt round trip");

let otherKey = BucketCrypto.deriveKey(Principal.fromText("2vxsx-fae"), bucketId);
let wrong = BucketCrypto.decrypt(encrypted, otherKey);
assert wrong != plaintext;
Debug.print("PASS: different owner key yields different plaintext");

let big = Blob.fromArray(Array.tabulate<Nat8>(2048, func(i) { Nat8.fromNat(i % 256) }));
let bigEnc = BucketCrypto.encrypt(big, key);
let bigDec = BucketCrypto.decrypt(bigEnc, key);
assert bigDec == big;
Debug.print("PASS: 2KB payload round trip");

let sealed = BucketCrypto.seal(big, key);
let opened = BucketCrypto.open(sealed.ciphertext, key, sealed.fingerprint);
assert opened == ?big;
Debug.print("PASS: seal/open round trip with fingerprint");

let partA = Blob.fromArray(Array.tabulate<Nat8>(1024, func(i) { Nat8.fromNat(i % 256) }));
let partB = Blob.fromArray(Array.tabulate<Nat8>(1024, func(i) { Nat8.fromNat((i + 128) % 256) }));
let sealedParts = BucketCrypto.sealFromChunks([partA, partB], key);
let openedParts = BucketCrypto.open(sealedParts.ciphertext, key, sealedParts.fingerprint);
assert openedParts == ?BlobUtil.join(partA, partB);
Debug.print("PASS: sealFromChunks matches joined plaintext");

let tampered = Blob.fromArray([0x00]);
assert BucketCrypto.open(tampered, key, sealed.fingerprint) == null;
Debug.print("PASS: fingerprint rejects tampered ciphertext");

let slice = BucketCrypto.decryptSlice(bigEnc, key, 100, 64);
let fullSlice = Blob.fromArray(Array.tabulate<Nat8>(64, func(i) { Nat8.fromNat((100 + i) % 256) }));
assert slice == fullSlice;
Debug.print("PASS: decryptSlice returns range without full decrypt");

Debug.print("BucketCrypto tests done");
