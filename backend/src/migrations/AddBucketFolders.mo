import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Types "../types";
import BucketStorage "../storage/BucketStorage";

// Adds persisted empty-folder markers to bucketStore on upgrade.
//
// APPLIED on mainnet (hash 0x1ee569c1f54ae79d56122c1b1ebee04daaf05b98dd927701afc1b3e061654c0d)
// Do NOT re-wire to main.mo.
module {
  public type OldBucketStore = {
    buckets: Map.Map<Types.BucketId, Types.Bucket>;
    files: Map.Map<Types.FileId, Types.StoredFile>;
    pathIndex: Map.Map<Text, Types.FileId>;
    ownerIndex: Map.Map<Principal, [Types.BucketId]>;
    apiKeys: Map.Map<Text, Types.ApiKey>;
    keyHashIndex: Map.Map<Text, Text>;
    bucketKeyIndex: Map.Map<Types.BucketId, [Text]>;
  };

  public func migration(old: { bucketStore: OldBucketStore }) : {
    bucketStore: BucketStorage.BucketStore;
  } {
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
    }
  };
};
