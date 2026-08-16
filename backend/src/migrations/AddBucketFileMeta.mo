import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Types "../types";
import BucketStorage "../storage/BucketStorage";
import FilePath "../utils/FilePath";

// Adds name, updatedAt, metadata, tags to StoredFile rows and makes Bucket.visibility
// mutable (var). Wire once via `(with migration = AddBucketFileMeta.migration)` on
// main.mo for the deploy that ships file metadata + updateBucket.
//
// APPLIED on mainnet — do NOT re-wire into main.mo. The live canister already
// has var visibility and extended StoredFile fields. Re-attaching this migration
// makes moc reject the upgrade (M0170 — OldBucket visibility is not a subtype
// of the current Bucket). Kept for testing/upgrade/AddBucketFileMeta.test.mo.
module {
  public type OldStoredFile = {
    id: Types.FileId;
    bucketId: Types.BucketId;
    path: Text;
    size: Nat;
    contentType: Text;
    checksum: Text;
    createdAt: Int;
  };

  // Exact mainnet shape before this upgrade — visibility is immutable (not var).
  public type OldBucket = {
    id: Types.BucketId;
    owner: Principal;
    var name: Text;
    capacity: Nat;
    var storageUsed: Nat;
    visibility: Types.BucketVisibility;
    var status: Types.BucketStatus;
    var expiresAt: Int;
    createdAt: Int;
  };

  public type OldBucketStore = {
    buckets: Map.Map<Types.BucketId, OldBucket>;
    files: Map.Map<Types.FileId, OldStoredFile>;
    fileData: Map.Map<Types.FileId, Blob>;
    pathIndex: Map.Map<Text, Types.FileId>;
    ownerIndex: Map.Map<Principal, [Types.BucketId]>;
    apiKeys: Map.Map<Text, Types.ApiKey>;
    keyHashIndex: Map.Map<Text, Text>;
    bucketKeyIndex: Map.Map<Types.BucketId, [Text]>;
  };

  func migrateFile(old: OldStoredFile) : Types.StoredFile {
    {
      id = old.id;
      bucketId = old.bucketId;
      path = old.path;
      name = FilePath.fileName(old.path);
      size = old.size;
      contentType = old.contentType;
      checksum = old.checksum;
      createdAt = old.createdAt;
      updatedAt = null;
      metadata = null;
      tags = [];
    }
  };

  func migrateFiles(old: Map.Map<Types.FileId, OldStoredFile>) : Map.Map<Types.FileId, Types.StoredFile> {
    let next = Map.empty<Types.FileId, Types.StoredFile>();
    for ((id, file) in old.entries()) {
      next.add(id, migrateFile(file));
    };
    next
  };

  func migrateBucket(old: OldBucket) : Types.Bucket {
    {
      id = old.id;
      owner = old.owner;
      var name = old.name;
      capacity = old.capacity;
      var storageUsed = old.storageUsed;
      var visibility = old.visibility;
      var status = old.status;
      var expiresAt = old.expiresAt;
      createdAt = old.createdAt;
    }
  };

  func migrateBuckets(old: Map.Map<Types.BucketId, OldBucket>) : Map.Map<Types.BucketId, Types.Bucket> {
    let next = Map.empty<Types.BucketId, Types.Bucket>();
    for ((id, bucket) in old.entries()) {
      next.add(id, migrateBucket(bucket));
    };
    next
  };

  public func migration(old: { bucketStore: OldBucketStore }) : {
    bucketStore: BucketStorage.BucketStore;
  } {
    {
      bucketStore = {
        buckets = migrateBuckets(old.bucketStore.buckets);
        files = migrateFiles(old.bucketStore.files);
        fileData = old.bucketStore.fileData;
        pathIndex = old.bucketStore.pathIndex;
        ownerIndex = old.bucketStore.ownerIndex;
        apiKeys = old.bucketStore.apiKeys;
        keyHashIndex = old.bucketStore.keyHashIndex;
        bucketKeyIndex = old.bucketStore.bucketKeyIndex;
      };
    }
  };
};
