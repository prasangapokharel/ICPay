import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
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
import Fixtures "./Fixtures";
import BlobHarness "./BlobHarness";

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

let webp = Fixtures.webp();

func seedBucket(id: Text, bucketName: Text) {
  let bucket : Types.Bucket = {
    id = id;
    owner = owner;
    var name = bucketName;
    capacity = 10_000_000;
    var storageUsed = 0;
    var visibility = #Public;
    var status = #ACTIVE;
    var expiresAt = now + Config.BUCKET_PERIOD_NS;
    createdAt = now;
  };
  BucketRepository.save(store, names, bucket);
};

seedBucket("files-bucket-1", "cdn-assets");

switch (
  await BucketService.uploadFile(svc, owner, "cdn-assets", "/img/logo.webp", webp, "image/webp", null)
) {
  case (#ok(_)) { Debug.print("PASS [FILES]: seed upload") };
  case (#err(e)) { assert false; Debug.print("FAIL [FILES]: seed: " # e) };
};

switch (BucketService.getFile(svc, owner, "cdn-assets", "/img/logo.webp", null)) {
  case (#ok(file)) {
    assert file.name == "logo.webp";
    assert file.path == "/img/logo.webp";
    Debug.print("PASS [FILES]: getFile");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [FILES]: getFile: " # e) };
};

switch (BucketService.fileExists(svc, owner, "cdn-assets", "/img/logo.webp", null)) {
  case (#ok(true)) { Debug.print("PASS [FILES]: fileExists true") };
  case (#err(e)) { assert false; Debug.print("FAIL [FILES]: fileExists: " # e) };
  case (#ok(false)) { assert false; Debug.print("FAIL [FILES]: fileExists false") };
};

switch (
  BucketService.updateFile(svc, owner, "cdn-assets", "/img/logo.webp", ?"Brand Logo", null, ?"{\"v\":1}", null)
) {
  case (#ok(file)) {
    assert file.name == "Brand Logo";
    assert file.metadata == ?"{\"v\":1}";
    Debug.print("PASS [FILES]: updateFile metadata");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [FILES]: updateFile: " # e) };
};

switch (BucketService.setFileTags(svc, owner, "cdn-assets", "/img/logo.webp", ["hero", "web"], null)) {
  case (#ok(file)) {
    assert file.tags.size() == 2;
    Debug.print("PASS [FILES]: setFileTags");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [FILES]: tags: " # e) };
};

switch (BucketService.searchFiles(svc, owner, "cdn-assets", "brand", 0, 20, null)) {
  case (#ok(page)) {
    assert page.items.size() == 1;
    Debug.print("PASS [FILES]: searchFiles");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [FILES]: search: " # e) };
};

switch (BucketService.listFolder(svc, owner, "cdn-assets", "/img/", 0, 20, null)) {
  case (#ok(page)) {
    assert page.items.size() == 1;
    Debug.print("PASS [FILES]: listFolder");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [FILES]: listFolder: " # e) };
};

switch (await BucketService.copyFile(svc, owner, "cdn-assets", "/img/logo.webp", "/img/logo-copy.webp", null)) {
  case (#ok(_)) { Debug.print("PASS [FILES]: copyFile") };
  case (#err(e)) { assert false; Debug.print("FAIL [FILES]: copy: " # e) };
};

switch (BucketService.moveFile(svc, owner, "cdn-assets", "/img/logo-copy.webp", "/archive/logo.webp", null)) {
  case (#ok(file)) {
    assert file.path == "/archive/logo.webp";
    Debug.print("PASS [FILES]: moveFile");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [FILES]: move: " # e) };
};

switch (
  await BucketService.beginFileUpload(svc, owner, "cdn-assets", "/pending.webp", "image/webp", webp.size(), null)
) {
  case (#ok(uploadId)) {
    switch (BucketService.getUpload(svc, owner, uploadId)) {
      case (#ok(status)) {
        assert status.status == "active";
        Debug.print("PASS [FILES]: getUpload");
      };
      case (#err(e)) { assert false; Debug.print("FAIL [FILES]: getUpload: " # e) };
    };
    switch (BucketService.cancelUpload(svc, owner, uploadId)) {
      case (#ok()) { Debug.print("PASS [FILES]: cancelUpload") };
      case (#err(e)) { assert false; Debug.print("FAIL [FILES]: cancel: " # e) };
    };
  };
  case (#err(e)) { assert false; Debug.print("FAIL [FILES]: begin upload: " # e) };
};

switch (BucketService.updateBucket(svc, owner, "cdn-assets", ?"site-cdn", null)) {
  case (#ok(b)) {
    assert b.name == "site-cdn";
    Debug.print("PASS [FILES]: updateBucket rename");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [FILES]: updateBucket: " # e) };
};

switch (await BucketService.deleteBucket(svc, owner, "empty-bucket")) {
  case (#err(_)) { Debug.print("PASS [FILES]: deleteBucket rejects missing") };
  case (#ok()) { assert false; Debug.print("FAIL [FILES]: delete missing bucket") };
};

Debug.print("Bucket file phase tests done");
