import Debug "mo:core/Debug";
import Text "mo:core/Text";
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
import UserRepo "../../src/repositories/UserRepository";
import BucketService "../../src/services/BucketService";
import CloudHttpService "../../src/services/CloudHttpService";
import TransferService "../../src/services/TransferService";
import LedgerService "../../src/services/LedgerService";
import Config "../../src/config/Config";
import Types "../../src/types";
import BucketUrls "../../src/utils/BucketUrls";
import Fixtures "./Fixtures";

// Upload → parse CDN path → http serve (prepareServe) — the curl GET path.

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
let svc = BucketService.create(
  users, store, names, transfers, nextUid,
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  BucketService.createUploadSessionStore(),
);

ignore UserRepo.create(users, usernames, usersById, "uid-owner", owner, null, "", now, null);

let webp = Fixtures.webp();
let bucketId = "bucket-http-1";
let filePath = "/logo.webp";

func seedBucket(id: Text, visibility: Types.BucketVisibility) {
  let bucket : Types.Bucket = {
    id = id;
    owner = owner;
    var name = "cdn-test";
    capacity = 10_000_000;
    var storageUsed = 0;
    visibility = visibility;
    var status = #ACTIVE;
    var expiresAt = now + Config.BUCKET_PERIOD_NS;
    createdAt = now;
  };
  BucketRepository.save(store, names, bucket);
};

func bodyText(body: Blob) : Text {
  switch (Text.decodeUtf8(body)) {
    case (?t) t;
    case null "";
  }
};

seedBucket(bucketId, #Public);

switch (
  await BucketService.uploadFile(svc, owner, bucketId, filePath, webp, "image/webp", null)
) {
  case (#ok(_)) { Debug.print("PASS [HTTP-SERVE]: upload seed file") };
  case (#err(e)) { assert false; Debug.print("FAIL [HTTP-SERVE]: upload: " # e) };
};

let cdnUrl = BucketUrls.fileUrl(Config.BACKEND_CANISTER_ID, "cdn-test", filePath);
let urlPathByName = "/cloud/cdn-test" # filePath;
let urlPathById = "/cloud/" # bucketId # filePath;

switch (CloudHttpService.parseCloudPath(urlPathByName)) {
  case (null) { assert false; Debug.print("FAIL [HTTP-SERVE]: parse CDN path by name") };
  case (?parsed) {
    assert parsed.bucketSegment == "cdn-test";
    assert parsed.path == filePath;
    Debug.print("PASS [HTTP-SERVE]: parse CDN path by bucket name");
  };
};

switch (CloudHttpService.parseCloudPath(urlPathById)) {
  case (null) { assert false; Debug.print("FAIL [HTTP-SERVE]: parse CDN path by id") };
  case (?parsed) {
    assert parsed.bucketSegment == bucketId;
    assert parsed.path == filePath;
    Debug.print("PASS [HTTP-SERVE]: parse CDN path by bucket id");
  };
};

switch (CloudHttpService.prepareServe(svc, "cdn-test", filePath)) {
  case (#err(resp)) {
    assert false;
    Debug.print("FAIL [HTTP-SERVE]: prepareServe public file status=" # Nat16.toText(resp.status_code));
  };
  case (#ok(#Direct({ contentType; data }))) {
    assert contentType == "image/webp";
    assert data == webp;
    Debug.print("PASS [HTTP-SERVE]: GET would return 200 WebP");
  };
  case (#ok(#Stream(_))) {
    assert false;
    Debug.print("FAIL [HTTP-SERVE]: small file should not stream");
  };
};

let largePng = Fixtures.largePng();
let pngPath = "/photo.png";
switch (
  await BucketService.uploadFile(svc, owner, bucketId, pngPath, largePng, "image/png", null)
) {
  case (#ok(_)) { Debug.print("PASS [HTTP-SERVE]: upload large png seed") };
  case (#err(e)) { assert false; Debug.print("FAIL [HTTP-SERVE]: large png upload: " # e) };
};

switch (CloudHttpService.prepareServe(svc, "cdn-test", pngPath)) {
  case (#err(resp)) {
    assert false;
    Debug.print(
      "FAIL [HTTP-SERVE]: large png prepareServe status=" # Nat16.toText(resp.status_code),
    );
  };
  case (#ok(#Direct({ contentType; data }))) {
    assert contentType == "image/png";
    assert data.size() == largePng.size();
    Debug.print("PASS [HTTP-SERVE]: GET would return 200 PNG (~700KB slice decrypt)");
  };
  case (#ok(#Stream(_))) {
    assert false;
    Debug.print("FAIL [HTTP-SERVE]: 700KB png should fit direct response");
  };
};

switch (CloudHttpService.prepareServe(svc, bucketId, "/missing.webp")) {
  case (#err(resp)) {
    assert resp.status_code == 404;
    assert Text.contains(bodyText(resp.body), #text "File not found");
    Debug.print("PASS [HTTP-SERVE]: missing file → File not found");
  };
  case (#ok(_)) { assert false; Debug.print("FAIL [HTTP-SERVE]: missing file served") };
};

switch (CloudHttpService.prepareServe(svc, "no-such-bucket", filePath)) {
  case (#err(resp)) {
    assert resp.status_code == 404;
    assert Text.contains(bodyText(resp.body), #text "Bucket not found");
    Debug.print("PASS [HTTP-SERVE]: missing bucket → Bucket not found");
  };
  case (#ok(_)) { assert false; Debug.print("FAIL [HTTP-SERVE]: missing bucket served") };
};

// Regression: API key secrets must not be used as bucket ids in CDN URLs.
let apiKeyAsBucket = "icp_cloud_6713d85f346ce88ba1f3836fcaa367c5";
switch (CloudHttpService.prepareServe(svc, apiKeyAsBucket, "/logo.webp")) {
  case (#err(resp)) {
    assert resp.status_code == 404;
    assert Text.contains(bodyText(resp.body), #text "not an API key");
    Debug.print("PASS [HTTP-SERVE]: API key shape rejected as bucket id");
  };
  case (#ok(_)) { assert false; Debug.print("FAIL [HTTP-SERVE]: API key accepted as bucket") };
};

seedBucket("bucket-http-private", #Private);
switch (
  await BucketService.uploadFile(
    svc, owner, "bucket-http-private", "/secret.webp", webp, "image/webp", null,
  )
) {
  case (#ok(_)) {};
  case (#err(e)) { assert false; Debug.print("FAIL [HTTP-SERVE]: private upload: " # e) };
};

switch (CloudHttpService.prepareServe(svc, "bucket-http-private", "/secret.webp")) {
  case (#err(resp)) {
    assert resp.status_code == 403;
    Debug.print("PASS [HTTP-SERVE]: private bucket → 403 Forbidden");
  };
  case (#ok(_)) { assert false; Debug.print("FAIL [HTTP-SERVE]: private file served") };
};

Debug.print("CDN URL example: " # cdnUrl);
Debug.print("Bucket HTTP serve tests done");
