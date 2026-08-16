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
import ApiKeyService "../../src/services/ApiKeyService";
import TransferService "../../src/services/TransferService";
import LedgerService "../../src/services/LedgerService";
import Config "../../src/config/Config";
import Types "../../src/types";
import Fixtures "./Fixtures";

// Mock harness — no ledger, buckets seeded directly (same pattern as Flow.test.mo).

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
let svc = BucketService.create(
  users, store, names, transfers, nextUid,
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  BucketService.createUploadSessionStore(),
);

ignore UserRepo.create(users, usernames, usersById, "uid-owner", owner, null, "", now, null);

func seedPrivateBucket(id: Text, bucketName: Text) {
  let bucket : Types.Bucket = {
    id = id;
    owner = owner;
    var name = bucketName;
    capacity = 10_000_000;
    var storageUsed = 0;
    var visibility = #Private;
    var status = #ACTIVE;
    var expiresAt = now + Config.BUCKET_PERIOD_NS;
    createdAt = now;
  };
  BucketRepository.save(store, names, bucket);
};

let webp = Fixtures.webp();
seedPrivateBucket("bucket-api-key-1", "site-assets");

switch (
  await BucketService.uploadFile(
    svc, owner, "site-assets", "/hero.webp", webp, "image/webp", null,
  )
) {
  case (#ok(_)) { Debug.print("PASS [APIKEY]: seed private file") };
  case (#err(e)) { assert false; Debug.print("FAIL [APIKEY]: seed upload: " # e) };
};

// --- Read-only key on private bucket ----------------------------------------

let readPerms : Types.ApiKeyPermissions = { read = true; write = false; delete = false };
let writePerms : Types.ApiKeyPermissions = { read = false; write = true; delete = false };
let fullPerms : Types.ApiKeyPermissions = { read = true; write = true; delete = true };

var readSecret = "";
var readKeyId = "";
var writeSecret = "";

switch (BucketService.createApiKey(svc, owner, "site-assets", "reader", readPerms)) {
  case (#ok(result)) {
    readSecret := result.secret;
    readKeyId := result.id;
    Debug.print("PASS [APIKEY]: create read key by bucket name");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [APIKEY]: create read key: " # e) };
};

switch (BucketService.createApiKey(svc, owner, "bucket-api-key-1", "writer", writePerms)) {
  case (#ok(result)) {
    writeSecret := result.secret;
    Debug.print("PASS [APIKEY]: create write key by bucket id");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [APIKEY]: create write key: " # e) };
};

switch (BucketService.downloadFile(svc, stranger, "site-assets", "/hero.webp", ?readSecret)) {
  case (#ok(data)) {
    assert data == webp;
    Debug.print("PASS [APIKEY]: read key downloads private file by bucket name");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [APIKEY]: read download: " # e) };
};

switch (BucketService.listFiles(svc, stranger, "site-assets", 0, 20, ?readSecret)) {
  case (#ok(page)) {
    assert page.items.size() == 1;
    Debug.print("PASS [APIKEY]: read key lists private files");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [APIKEY]: read list: " # e) };
};

switch (BucketService.downloadFile(svc, stranger, "site-assets", "/hero.webp", ?writeSecret)) {
  case (#ok(_)) { assert false; Debug.print("FAIL [APIKEY]: write key allowed download") };
  case (#err(e)) {
    assert e == "API key lacks read permission";
    Debug.print("PASS [APIKEY]: write-only key blocked from download");
  };
};

switch (BucketService.downloadFile(svc, stranger, "site-assets", "/hero.webp", null)) {
  case (#ok(_)) { assert false; Debug.print("FAIL [APIKEY]: stranger read private without key") };
  case (#err(_)) { Debug.print("PASS [APIKEY]: private bucket blocks stranger without key") };
};

// --- Key CRUD -----------------------------------------------------------------

switch (BucketService.getApiKey(svc, owner, "site-assets", readKeyId)) {
  case (#ok(key)) {
    assert key.name == "reader";
    assert key.permissions.read;
    assert not key.permissions.write;
    Debug.print("PASS [APIKEY]: getApiKey by bucket name");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [APIKEY]: getApiKey: " # e) };
};

switch (
  BucketService.updateApiKey(
    svc, owner, "site-assets", readKeyId, ?"cdn-reader", ?fullPerms,
  )
) {
  case (#ok(key)) {
    assert key.name == "cdn-reader";
    assert key.permissions.write;
    Debug.print("PASS [APIKEY]: updateApiKey name and permissions");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [APIKEY]: updateApiKey: " # e) };
};

var rotatedSecret = "";
switch (BucketService.regenerateApiKey(svc, owner, "site-assets", readKeyId)) {
  case (#ok(result)) {
    rotatedSecret := result.secret;
    assert result.secret != readSecret;
    Debug.print("PASS [APIKEY]: regenerateApiKey returns new secret");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [APIKEY]: regenerate: " # e) };
};

switch (BucketService.downloadFile(svc, stranger, "site-assets", "/hero.webp", ?readSecret)) {
  case (#ok(_)) { assert false; Debug.print("FAIL [APIKEY]: old secret still works") };
  case (#err(_)) { Debug.print("PASS [APIKEY]: old secret rejected after rotate") };
};

switch (BucketService.downloadFile(svc, stranger, "site-assets", "/hero.webp", ?rotatedSecret)) {
  case (#ok(data)) {
    assert data == webp;
    Debug.print("PASS [APIKEY]: rotated secret downloads file");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [APIKEY]: rotated download: " # e) };
};

switch (ApiKeyService.revokeApiKey(svc.store, names, owner, "site-assets", readKeyId)) {
  case (#ok()) { Debug.print("PASS [APIKEY]: revokeApiKey") };
  case (#err(e)) { assert false; Debug.print("FAIL [APIKEY]: revoke: " # e) };
};

switch (BucketService.downloadFile(svc, stranger, "site-assets", "/hero.webp", ?rotatedSecret)) {
  case (#ok(_)) { assert false; Debug.print("FAIL [APIKEY]: revoked key still works") };
  case (#err(e)) {
    assert e == "API key revoked";
    Debug.print("PASS [APIKEY]: revoked key rejected");
  };
};

switch (BucketService.getApiKey(svc, stranger, "site-assets", readKeyId)) {
  case (#ok(_)) { assert false; Debug.print("FAIL [APIKEY]: stranger got key details") };
  case (#err(_)) { Debug.print("PASS [APIKEY]: getApiKey owner-only") };
};

Debug.print("Bucket API key tests done");
