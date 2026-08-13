import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Map "mo:core/Map";
import RateLimitStorage "../../../src/storage/RateLimitStorage";
import BucketStorage "../../../src/storage/BucketStorage";
import BucketRepository "../../../src/repositories/BucketRepository";
import BucketService "../../../src/services/BucketService";
import TransferService "../../../src/services/TransferService";
import LedgerService "../../../src/services/LedgerService";
import LedgerStorage "../../../src/storage/LedgerStorage";
import UserStorage "../../../src/storage/UserStorage";
import TxStorage "../../../src/storage/TransactionStorage";
import RateLimitService "../../../src/services/RateLimitService";
import Config "../../../src/config/Config";
import Types "../../../src/types";
import Fixtures "../../bucket/Fixtures";
import DsaFixtures "../lib/Fixtures";

/// Mock concurrency — 100 principals each open an upload session at once.
/// No real bytes uploaded; proves session map + per-user rate limits are isolated.
let parallelUsers : Nat = 100;
let now = Time.now();

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let txs = TxStorage.createTxList();
let txsByUser = TxStorage.createTxByUser();
let ledger = LedgerService.create(Principal.fromText("aaaaa-aa"), LedgerStorage.createLedgerRegistry());
let store = BucketStorage.empty();
let names = Map.empty<Text, Text>();

var idCounter = 0;
func nextId() : Text {
  idCounter += 1;
  "upload-" # Int.toText(idCounter);
};

let depositSubaccounts = UserStorage.createDepositSubaccountIndex();
let depositAccountIds = UserStorage.createDepositAccountIdIndex();
let transfers = TransferService.create(
  users, usernames, txs, txsByUser, ledger, nextId, RateLimitStorage.createRateLimitMap(),
  depositSubaccounts, depositAccountIds,
);
let uploadLimits = RateLimitStorage.createRateLimitMap();
let svc = BucketService.create(
  users, store, names, transfers, nextId,
  RateLimitStorage.createRateLimitMap(),
  uploadLimits,
  RateLimitStorage.createRateLimitMap(),
  RateLimitStorage.createRateLimitMap(),
  BucketService.createUploadSessionStore(),
);

func seedBucket(id: Text, owner: Principal) {
  let bucket : Types.Bucket = {
    id = id;
    owner = owner;
    var name = "assets-" # id;
    capacity = 100_000_000;
    var storageUsed = 0;
    visibility = #Private;
    var status = #ACTIVE;
    var expiresAt = now + Config.BUCKET_PERIOD_NS;
    createdAt = now;
  };
  BucketRepository.save(store, names, bucket);
};

var i = 0;
while (i < parallelUsers) {
  let owner = DsaFixtures.principalAt(i);
  seedBucket("bucket-" # Nat.toText(i), owner);
  i += 1;
};

var sessionCount : Nat = 0;
let uploadIds = Map.empty<Text, Principal>();
i := 0;
while (i < parallelUsers) {
  let owner = DsaFixtures.principalAt(i);
  let bucketId = "bucket-" # Nat.toText(i);
  let path = "/parallel-" # Nat.toText(i) # ".webp";
  switch (
    await BucketService.beginFileUpload(
      svc, owner, bucketId, path, "image/webp", 1024, null,
    )
  ) {
    case (#ok(uploadId)) {
      sessionCount += 1;
      Map.add(uploadIds, Text.compare, uploadId, owner);
    };
    case (#err(e)) {
      assert false;
      Debug.print("FAIL: beginFileUpload user " # Nat.toText(i) # ": " # e);
    };
  };
  i += 1;
};

assert(sessionCount == parallelUsers);
Debug.print("PASS: " # Nat.toText(parallelUsers) # " parallel upload sessions opened");

// Spot-check three sessions accept chunks without cross-talk.
let sampleChunk = Fixtures.webp();
for (idx in [0, 49, 99].vals()) {
  let owner = DsaFixtures.principalAt(idx);
  let bucketId = "bucket-" # Nat.toText(idx);
  let path = "/spot-" # Nat.toText(idx) # ".webp";
  switch (
    await BucketService.beginFileUpload(svc, owner, bucketId, path, "image/webp", sampleChunk.size(), null)
  ) {
    case (#ok(uploadId)) {
      switch (await BucketService.uploadFileChunkIndexed(svc, owner, uploadId, 0, sampleChunk)) {
        case (#ok(received)) {
          assert(received == sampleChunk.size());
        };
        case (#err(e)) {
          assert false;
          Debug.print("FAIL: chunk user " # Nat.toText(idx) # ": " # e);
        };
      };
      let stranger = DsaFixtures.principalAt(idx + 1);
      switch (await BucketService.uploadFileChunkIndexed(svc, stranger, uploadId, 0, sampleChunk)) {
        case (#ok(_)) {
          assert false;
          Debug.print("FAIL: stranger wrote to foreign session");
        };
        case (#err(_)) {};
      };
    };
    case (#err(e)) {
      assert false;
      Debug.print("FAIL: spot begin " # Nat.toText(idx) # ": " # e);
    };
  };
};
Debug.print("PASS: chunk uploads isolated per owner (spot-checked 3/100)");

// Per-user rate limit — 100 principals each get their own budget, not one global cap.
var rateOk : Nat = 0;
i := 0;
while (i < parallelUsers) {
  let owner = DsaFixtures.principalAt(i);
  if (RateLimitService.allow(uploadLimits, owner, Config.RATE_BUCKET_UPLOAD, Time.now())) {
    rateOk += 1;
  };
  i += 1;
};
assert(rateOk == parallelUsers);
Debug.print("PASS: rate limit is per-principal (" # Nat.toText(parallelUsers) # " independent budgets)");

// Same principal hits cap after maxPerWindow — not a parallel blocker for others.
let heavy = DsaFixtures.principalAt(999);
var heavyCount : Nat = 0;
while (heavyCount < Config.RATE_BUCKET_UPLOAD.maxPerWindow) {
  assert(RateLimitService.allow(uploadLimits, heavy, Config.RATE_BUCKET_UPLOAD, Time.now()));
  heavyCount += 1;
};
assert(not RateLimitService.allow(uploadLimits, heavy, Config.RATE_BUCKET_UPLOAD, Time.now()));
assert(RateLimitService.allow(uploadLimits, DsaFixtures.principalAt(0), Config.RATE_BUCKET_UPLOAD, Time.now()));
Debug.print("PASS: one saturated user does not block others");

Debug.print("ALL bucket-parallel MOCK TESTS PASSED");
