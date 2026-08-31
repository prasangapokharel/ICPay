import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Types "../types";
import BucketStorage "../storage/BucketStorage";

// Adds empty API-key indexes to an existing bucketStore on upgrade.
//
// APPLIED on mainnet — do NOT re-wire into main.mo. The live canister already
// has apiKeys / keyHashIndex / bucketKeyIndex. Re-attaching this migration
// makes moc reject the upgrade (M0216 — migration would drop those fields).
// Kept for the record and for testing/upgrade/AddBucketApiKeys.test.mo.
module {
  public type OldBucketStore = {
    buckets: Map.Map<Types.BucketId, Types.Bucket>;
    files: Map.Map<Types.FileId, Types.StoredFile>;
    fileData: Map.Map<Types.FileId, Blob>;
    pathIndex: Map.Map<Text, Types.FileId>;
    ownerIndex: Map.Map<Principal, [Types.BucketId]>;
  };

  public func migration(old : { bucketStore : OldBucketStore }) : {
    bucketStore : BucketStorage.BucketStore;
  } {
    {
      bucketStore = {
        buckets = old.bucketStore.buckets;
        files = old.bucketStore.files;
        pathIndex = old.bucketStore.pathIndex;
        folders = Map.empty<Text, Int>();
        ownerIndex = old.bucketStore.ownerIndex;
        apiKeys = Map.empty<Text, Types.ApiKey>();
        keyHashIndex = Map.empty<Text, Text>();
        bucketKeyIndex = Map.empty<Types.BucketId, [Text]>();
      };
    }
  };
};
