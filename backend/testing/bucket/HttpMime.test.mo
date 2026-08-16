import Debug "mo:core/Debug";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Nat16 "mo:core/Nat16";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Map "mo:core/Map";
import UserStorage "../../src/storage/UserStorage";
import TxStorage "../../src/storage/TransactionStorage";
import RateLimitStorage "../../src/storage/RateLimitStorage";
import LedgerStorage "../../src/storage/LedgerStorage";
import BucketStorage "../../src/storage/BucketStorage";
import BucketRepository "../../src/repositories/BucketRepository";
import BucketService "../../src/services/BucketService";
import CloudHttpService "../../src/services/CloudHttpService";
import TransferService "../../src/services/TransferService";
import LedgerService "../../src/services/LedgerService";
import FileValidator "../../src/utils/FileValidator";
import BucketCrypto "../../src/utils/BucketCrypto";
import Config "../../src/config/Config";
import Types "../../src/types";
import Fixtures "./Fixtures";

// CDN serve: every allowed extension → 200 + correct Content-Type (slice decrypt).

let store = BucketStorage.empty();
let names = Map.empty<Text, Text>();
let owner = Principal.fromText("aaaaa-aa");
let bucketId = "bucket-mime";
let now = Time.now();

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let txs = TxStorage.createTxList();
let txsByUser = TxStorage.createTxByUser();
let ledger = LedgerService.create(owner, LedgerStorage.createLedgerRegistry());
var uidCounter = 0;
func nextUid() : Text {
  uidCounter += 1;
  now.toText() # "-" # Int.toText(uidCounter);
};
let depositSubaccounts = UserStorage.createDepositSubaccountIndex();
let depositAccountIds = UserStorage.createDepositAccountIdIndex();
let transfers = TransferService.create(
  users, usernames, txs, txsByUser, ledger, nextUid, RateLimitStorage.createRateLimitMap(),
  depositSubaccounts, depositAccountIds,
);
let svc = BucketService.create(
  users, store, names, transfers, nextUid,
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  BucketService.createUploadSessionStore(),
);

let bucket : Types.Bucket = {
  id = bucketId;
  owner = owner;
  var name = "mime-test";
  capacity = 50_000_000;
  var storageUsed = 0;
  var visibility = #Public;
  var status = #ACTIVE;
  var expiresAt = now + Config.BUCKET_PERIOD_NS;
  createdAt = now;
};
BucketRepository.save(store, names, bucket);

func sampleBlob(ext: Text) : Blob {
  switch (ext) {
    case ("webp") { Fixtures.webp() };
    case ("png") { Fixtures.png() };
    case ("jpg") { Blob.fromArray([0xFF, 0xD8, 0xFF, 0x00]) };
    case ("jpeg") { Blob.fromArray([0xFF, 0xD8, 0xFF, 0x00]) };
    case ("gif") { Blob.fromArray([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]) };
    case ("zip") { Blob.fromArray([0x50, 0x4B, 0x03, 0x04, 0x00]) };
    case ("gz") { Blob.fromArray([0x1F, 0x8B, 0x08]) };
    case ("pdf") { Blob.fromArray([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31]) };
    case ("wasm") { Blob.fromArray([0x00, 0x61, 0x73, 0x6D, 0x01, 0x00]) };
    case (_) { Blob.fromArray([0x41]) };
  }
};

func headerContentType(headers: [(Text, Text)]) : ?Text {
  for ((k, v) in headers.vals()) {
    if (k == "Content-Type") return ?v;
  };
  null
};

let key = BucketCrypto.deriveKey(owner, bucketId);
var fileCounter : Nat = 0;

func seedFile(path: Text, data: Blob, contentType: Text) {
  fileCounter += 1;
  let sealed = BucketCrypto.seal(data, key);
  let file : Types.StoredFile = {
    id = "mime-f-" # Nat.toText(fileCounter);
    bucketId;
    path;
    size = data.size();
    contentType;
    checksum = sealed.fingerprint;
    createdAt = now;
  };
  BucketRepository.saveFile(store, file, sealed.ciphertext);
};

var served : Nat = 0;
for (ext in FileValidator.allowedExtensions().vals()) {
  let expected = switch (FileValidator.mimeFromExtension(ext)) {
    case (?m) m;
    case (null) { assert false; "" };
  };
  let path = "/cdn-" # ext # "." # ext;
  seedFile(path, sampleBlob(ext), expected);

  switch (CloudHttpService.prepareServe(svc, "mime-test", path)) {
    case (#err(resp)) {
      Debug.print(
        "FAIL [MIME-CDN]: serve ." # ext # " status=" # Nat16.toText(resp.status_code),
      );
      assert false;
    };
    case (#ok(#Direct({ contentType; data = body }))) {
      assert contentType == expected;
      assert body.size() > 0;
      let resp = CloudHttpService.buildDirectResponse(contentType, body);
      assert resp.status_code == 200;
      switch (headerContentType(resp.headers)) {
        case (?ct) { assert ct == expected };
        case (null) { assert false };
      };
      served += 1;
    };
    case (#ok(#Stream(_))) {
      Debug.print("FAIL [MIME-CDN]: small ." # ext # " should not stream");
      assert false;
    };
  };
};

let big = Fixtures.largePng();
seedFile("/large.png", big, "image/png");
switch (CloudHttpService.prepareServe(svc, "mime-test", "/large.png")) {
  case (#ok(#Direct({ contentType; data }))) {
    assert contentType == "image/png";
    assert data.size() == big.size();
    served += 1;
    Debug.print("PASS [MIME-CDN]: large png 200 image/png");
  };
  case (_) {
    Debug.print("FAIL [MIME-CDN]: large png serve");
    assert false;
  };
};

Debug.print(
  "PASS [MIME-CDN]: all extensions served with correct Content-Type (count="
  # Nat.toText(served)
  # ")",
);
Debug.print("ALL CDN MIME TESTS PASSED");
