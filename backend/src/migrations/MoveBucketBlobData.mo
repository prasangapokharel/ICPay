import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Types "../types";
import BucketStorage "../storage/BucketStorage";
import BlobStore "../blob/BlobStore";

// APPLIED — do NOT re-wire.
// Moved bucket file bytes out of bucketStore.fileData into legacyBlobStore for
// the external blob store rollout (mainnet upgraded 2026-08).
module {
  public type OldStoredFile = Types.StoredFile;

  public type OldBucket = Types.Bucket;

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

  public func migration(old: { bucketStore: OldBucketStore }) : {
    bucketStore: BucketStorage.BucketStore;
    legacyBlobStore: BlobStore.Store;
  } {
    let legacy = BlobStore.emptyStore();
    for ((id, data) in old.bucketStore.fileData.entries()) {
      legacy.blobs.add(id, data);
    };
    {
      bucketStore = {
        buckets = old.bucketStore.buckets;
        files = old.bucketStore.files;
        pathIndex = old.bucketStore.pathIndex;
        folders = Map.empty<Text, Int>();
        ownerIndex = old.bucketStore.ownerIndex;
        apiKeys = old.bucketStore.apiKeys;
        keyHashIndex = old.bucketStore.keyHashIndex;
        bucketKeyIndex = old.bucketStore.bucketKeyIndex;
      };
      legacyBlobStore = legacy;
    }
  };
};
