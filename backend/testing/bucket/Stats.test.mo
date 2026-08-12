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
import BillingService "../../src/services/BillingService";
import Fixtures "./Fixtures";

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

let transfers = TransferService.create(
  users, usernames, txs, txsByUser, ledger, nextUid, RateLimitStorage.createRateLimitMap(),
);
let svc = BucketService.create(
  users, store, names, transfers, nextUid,
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
);

ignore UserRepo.create(users, usernames, usersById, "uid-owner", owner, null, "", now);

let webp = Fixtures.webp();
let future = now + Config.BUCKET_PERIOD_NS;

let bucket : Types.Bucket = {
  id = "stats-bucket";
  owner = owner;
  var name = "cdn-demo";
  capacity = 1_000_000_000;
  var storageUsed = 0;
  visibility = #Public;
  var status = #ACTIVE;
  var expiresAt = future;
  createdAt = now;
};
BucketRepository.save(store, names, bucket);

switch (
  await BucketService.uploadFile(svc, owner, "stats-bucket", "/hero.webp", webp, "image/webp", null)
) {
  case (#ok(_)) { Debug.print("PASS [STATS]: seed upload") };
  case (#err(e)) { assert false; Debug.print("FAIL [STATS]: upload: " # e) };
};

switch (BucketService.getBucketStats(svc, owner, "stats-bucket")) {
  case (#ok(stats)) {
    assert stats.fileCount == 1;
    assert stats.storageUsed > 0;
    assert stats.usagePercent >= 0;
    assert stats.daysRemaining > 0;
    assert stats.renewPriceE8s > 0;
    assert stats.periodDays == Config.BUCKET_PERIOD_DAYS;
    assert BucketUrls.backendEndpoint(Config.BACKEND_CANISTER_ID)
      == "https://6vbhm-nqaaa-aaaan-q6muq-cai.raw.icp0.io/";
    switch (stats.publicBaseUrl) {
      case (null) { assert false };
      case (?url) {
        assert url == BucketUrls.bucketBase(Config.BACKEND_CANISTER_ID, "cdn-demo");
        Debug.print("PASS [STATS]: dashboard stats + public base URL");
      };
    };
  };
  case (#err(e)) { assert false; Debug.print("FAIL [STATS]: stats: " # e) };
};

switch (BucketService.getRenewQuote(svc, owner, "stats-bucket")) {
  case (#ok(quote)) {
    assert quote.priceE8s > 0;
    assert quote.newExpiresAt == future + Config.BUCKET_PERIOD_NS;
    Debug.print("PASS [STATS]: renew quote stacks on remaining time");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [STATS]: renew quote: " # e) };
};

switch (BucketService.listFiles(svc, owner, "stats-bucket", 0, 20)) {
  case (#ok(page)) {
    switch (page.items[0].publicUrl) {
      case (null) { assert false };
      case (?url) {
        assert url == BucketUrls.fileUrl(
          Config.BACKEND_CANISTER_ID, "cdn-demo", "/hero.webp",
        );
        Debug.print("PASS [STATS]: copyable CDN file URL");
      };
    };
  };
  case (#err(e)) { assert false; Debug.print("FAIL [STATS]: list files: " # e) };
};

switch (BucketService.getPublicFileUrl(svc, "stats-bucket", "/hero.webp")) {
  case (#ok(url)) {
    assert url == BucketUrls.fileUrl(
      Config.BACKEND_CANISTER_ID, "cdn-demo", "/hero.webp",
    );
    Debug.print("PASS [STATS]: public file URL query");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [STATS]: public url: " # e) };
};

assert BucketRepository.countAllBuckets(store) == 1;
assert BucketRepository.countActiveBuckets(store) == 1;
assert BucketRepository.countExpiredBuckets(store) == 0;
assert BucketRepository.countFiles(store) == 1;
assert BucketRepository.getTotalStorageUsed(store) > 0;
assert BucketRepository.getTotalCapacity(store) == 1_000_000_000;
assert BillingService.calculatePrice(1_000_000_000) == 100_000_000;
Debug.print("PASS [STATS]: cloud rollup counts (cycle balance tested on-chain)");

switch (BucketRepository.get(store, "stats-bucket")) {
  case (null) { assert false };
  case (?b) {
    b.expiresAt := now - 1;
    b.status := #EXPIRED;
    BucketRepository.save(store, names, b);
  };
};

switch (BucketService.getRenewQuote(svc, owner, "stats-bucket")) {
  case (#ok(quote)) {
    assert quote.newExpiresAt == now + Config.BUCKET_PERIOD_NS;
    Debug.print("PASS [STATS]: expired renew extends from now");
  };
  case (#err(e)) { assert false; Debug.print("FAIL [STATS]: expired quote: " # e) };
};

Debug.print("Bucket stats tests done");
