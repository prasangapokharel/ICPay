import Debug "mo:core/Debug";
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
import UserRepo "../../src/repositories/UserRepository";
import BucketService "../../src/services/BucketService";
import TransferService "../../src/services/TransferService";
import LedgerService "../../src/services/LedgerService";
import Config "../../src/config/Config";
import Types "../../src/types";
import BucketUrls "../../src/utils/BucketUrls";
import Fixtures "./Fixtures";
import BlobHarness "./BlobHarness";

// --- Harness (no ledger calls — bucket rows seeded after "payment") ---------

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();
let txs = TxStorage.createTxList();
let txsByUser = TxStorage.createTxByUser();
let ledgerRegistry = LedgerStorage.createLedgerRegistry();
let ledger = LedgerService.create(Principal.fromText("aaaaa-aa"), ledgerRegistry);
let store = BucketStorage.empty();
let names = Map.empty<Text, Text>();

let owner = Principal.fromText("aaaaa-aa");
let stranger = Principal.fromText("2vxsx-fae");
let now = Time.now();

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
let blobs = BlobHarness.local();
let svc = BucketService.create(
  users, store, names, blobs, null, transfers, nextUid,
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  BucketService.createUploadSessionStore(),
);

ignore UserRepo.create(users, usernames, usersById, "uid-owner", owner, null, "", now, null);

func seedBucket(id: Text, visibility: Types.BucketVisibility, expiresAt: Int) {
  let bucket : Types.Bucket = {
    id = id;
    owner = owner;
    var name = "my-assets";
    capacity = 10_000_000;
    var storageUsed = 0;
    var visibility = visibility;
    var status = #ACTIVE;
    var expiresAt = expiresAt;
    createdAt = now;
  };
  BucketRepository.save(store, names, bucket);
};

let webp = Fixtures.webp();

// --- E2E: upload → encrypted at rest → download → delete --------------------

seedBucket("bucket-flow-1", #Public, now + Config.BUCKET_PERIOD_NS);

switch (
  await BucketService.uploadFile(svc, owner, "bucket-flow-1", "/logo.webp", webp, "image/webp", null)
) {
  case (#ok(fileId)) {
    assert await BucketService.isStoredEncrypted(svc, fileId, webp);
    Debug.print("PASS [FLOW]: upload encrypts at rest");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [FLOW]: upload: " # e) };
};

switch (await BucketService.downloadFile(svc, owner, "bucket-flow-1", "/logo.webp", null)) {
  case (#ok(data)) {
    assert data == webp;
    Debug.print("PASS [FLOW]: owner download decrypts");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [FLOW]: download: " # e) };
};

switch (await BucketService.downloadFile(svc, stranger, "bucket-flow-1", "/logo.webp", null)) {
  case (#ok(_)) {
    assert true;
    Debug.print("PASS [FLOW]: public bucket readable by stranger");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [FLOW]: public read: " # e) };
};

switch (BucketService.listFiles(svc, owner, "bucket-flow-1", 0, 20, null)) {
  case (#ok(page)) {
    assert page.items.size() == 1;
    switch (page.items[0].publicUrl) {
      case (null) { assert false };
      case (?url) {
        assert url == BucketUrls.fileUrl(
          Config.BACKEND_CANISTER_ID, "my-assets", "/logo.webp",
        );
      };
    };
    Debug.print("PASS [FLOW]: list files with public URL");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [FLOW]: list: " # e) };
};

switch (await BucketService.deleteFile(svc, owner, "bucket-flow-1", "/logo.webp", null)) {
  case (#ok()) { Debug.print("PASS [FLOW]: delete file") };
  case (#err(e)) { assert false; Debug.print("FAIL [FLOW]: delete: " # e) };
};

// --- Empty MIME (Linux file picker) -----------------------------------------

seedBucket("bucket-empty-mime", #Public, now + Config.BUCKET_PERIOD_NS);

switch (
  await BucketService.uploadFile(svc, owner, "bucket-empty-mime", "/sniff.webp", webp, "", null)
) {
  case (#ok(_)) { Debug.print("PASS [FLOW]: WebP upload with empty MIME") };
  case (#err(e)) { assert false; Debug.print("FAIL [FLOW]: empty MIME: " # e) };
};

// --- Private bucket ---------------------------------------------------------

seedBucket("bucket-private", #Private, now + Config.BUCKET_PERIOD_NS);

switch (
  await BucketService.uploadFile(svc, owner, "bucket-private", "/secret.webp", webp, "image/webp", null)
) {
  case (#ok(_)) { Debug.print("PASS [FLOW]: private upload") };
  case (#err(e)) { assert false; Debug.print("FAIL [FLOW]: private upload: " # e) };
};

switch (await BucketService.downloadFile(svc, stranger, "bucket-private", "/secret.webp", null)) {
  case (#ok(_)) { assert false; Debug.print("FAIL [FLOW]: stranger read private") };
  case (#err(_)) { Debug.print("PASS [FLOW]: private bucket blocks stranger") };
};

// --- Expiration: read-only --------------------------------------------------

seedBucket("bucket-expired", #Public, now + Config.BUCKET_PERIOD_NS);

switch (
  await BucketService.uploadFile(svc, owner, "bucket-expired", "/kept.webp", webp, "image/webp", null)
) {
  case (#ok(_)) { Debug.print("PASS [FLOW]: seed file before expiry") };
  case (#err(e)) { assert false; Debug.print("FAIL [FLOW]: pre-expiry upload: " # e) };
};

switch (BucketRepository.get(store, "bucket-expired")) {
  case (null) { assert false };
  case (?b) {
    b.expiresAt := now - 1;
    b.status := #EXPIRED;
    BucketRepository.save(store, names, b);
  };
};

switch (
  await BucketService.uploadFile(svc, owner, "bucket-expired", "/x.webp", webp, "image/webp", null)
) {
  case (#ok(_)) { assert false; Debug.print("FAIL [FLOW]: expired upload allowed") };
  case (#err(_)) { Debug.print("PASS [FLOW]: expired bucket blocks upload") };
};

switch (await BucketService.downloadFile(svc, stranger, "bucket-expired", "/kept.webp", null)) {
  case (#ok(data)) {
    assert data == webp;
    Debug.print("PASS [FLOW]: expired bucket still readable");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [FLOW]: expired read: " # e) };
};

// --- Validation gates -------------------------------------------------------

switch (
  await BucketService.uploadFile(svc, owner, "bucket-flow-1", "/bad.webp", Blob.fromArray([0, 0, 0, 0]), "image/webp", null)
) {
  case (#ok(_)) { assert false; Debug.print("FAIL [FLOW]: fake webp accepted") };
  case (#err(_)) { Debug.print("PASS [FLOW]: invalid webp rejected") };
};

switch (
  await BucketService.uploadFile(svc, owner, "bucket-flow-1", "/screenshot.png", Fixtures.png(), "image/png", null)
) {
  case (#ok(_)) { Debug.print("PASS [FLOW]: png accepted") };
  case (#err(e)) { assert false; Debug.print("FAIL [FLOW]: png upload: " # e) };
};

switch (
  await BucketService.uploadFile(svc, owner, "bucket-flow-1", "/clip.mp4", Blob.fromArray([0, 0, 0, 0]), "video/mp4", null)
) {
  case (#ok(_)) { assert false; Debug.print("FAIL [FLOW]: mp4 accepted") };
  case (#err(_)) { Debug.print("PASS [FLOW]: video blocked") };
};

switch (BucketService.getPrice(25)) {
  case (#ok(price)) {
    assert price > 0;
    Debug.print("PASS [FLOW]: pricing for 25GB");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [FLOW]: price: " # e) };
};

switch (BucketService.getPrice(3)) {
  case (#ok(_)) { assert false; Debug.print("FAIL [FLOW]: invalid tier accepted") };
  case (#err(_)) { Debug.print("PASS [FLOW]: invalid capacity rejected") };
};

switch (BucketService.listFiles(svc, owner, "my-assets", 0, 20, null)) {
  case (#ok(page)) {
    assert page.items.size() >= 1;
    Debug.print("PASS [FLOW]: listFiles resolves public bucket name");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [FLOW]: list by name: " # e) };
};

Debug.print("Bucket e2e flow tests done");
