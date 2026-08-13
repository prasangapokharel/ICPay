import Debug "mo:core/Debug";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Types "../../src/types";
import AddBucketApiKeys "../../src/migrations/AddBucketApiKeys";

let owner = Principal.fromText("aaaaa-aa");
let bucketId = "bucket-migrate-1";

let bucket : Types.Bucket = {
  id = bucketId;
  owner = owner;
  var name = "demo";
  capacity = 1_000_000_000;
  var storageUsed = 42;
  visibility = #Public;
  var status = #ACTIVE;
  var expiresAt = 999;
  createdAt = 1;
};

let oldStore : AddBucketApiKeys.OldBucketStore = {
  buckets = Map.empty<Types.BucketId, Types.Bucket>();
  files = Map.empty<Types.FileId, Types.StoredFile>();
  fileData = Map.empty<Types.FileId, Blob>();
  pathIndex = Map.empty<Text, Types.FileId>();
  ownerIndex = Map.empty<Principal, [Types.BucketId]>();
};
oldStore.buckets.add(bucketId, bucket);
oldStore.ownerIndex.add(owner, [bucketId]);

let result = AddBucketApiKeys.migration({ bucketStore = oldStore });

assert result.bucketStore.buckets.size() == 1;
assert result.bucketStore.apiKeys.size() == 0;
assert result.bucketStore.keyHashIndex.size() == 0;
assert result.bucketStore.bucketKeyIndex.size() == 0;

switch (result.bucketStore.buckets.get(bucketId)) {
  case (null) { assert false };
  case (?b) {
    assert b.storageUsed == 42;
    assert b.name == "demo";
  };
};

Debug.print("PASS: bucket maps preserved");
Debug.print("PASS: api key maps start empty");
Debug.print("ALL BUCKET API KEY MIGRATION TESTS PASSED");
