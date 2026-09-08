import Debug "mo:core/Debug";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Types "../../src/types";
import AddBucketFolders "../../src/migrations/AddBucketFolders";

let owner = Principal.fromText("aaaaa-aa");
let bucketId = "bucket-folders-migrate-1";

let bucket : Types.Bucket = {
  id = bucketId;
  owner = owner;
  var name = "demo";
  capacity = 1_000_000_000;
  var storageUsed = 42;
  var visibility = #Public;
  var status = #ACTIVE;
  var expiresAt = 999;
  createdAt = 1;
};

let oldStore : AddBucketFolders.OldBucketStore = {
  buckets = Map.empty<Types.BucketId, Types.Bucket>();
  files = Map.empty<Types.FileId, Types.StoredFile>();
  pathIndex = Map.empty<Text, Types.FileId>();
  ownerIndex = Map.empty<Principal, [Types.BucketId]>();
  apiKeys = Map.empty<Text, Types.ApiKey>();
  keyHashIndex = Map.empty<Text, Text>();
  bucketKeyIndex = Map.empty<Types.BucketId, [Text]>();
};
oldStore.buckets.add(bucketId, bucket);
oldStore.ownerIndex.add(owner, [bucketId]);

let result = AddBucketFolders.migration({ bucketStore = oldStore });

assert result.bucketStore.buckets.size() == 1;
assert result.bucketStore.folders.size() == 0;
assert result.bucketStore.files.size() == 0;

switch (result.bucketStore.buckets.get(bucketId)) {
  case (null) { assert false };
  case (?b) {
    assert b.storageUsed == 42;
    assert b.name == "demo";
  };
};

Debug.print("PASS: bucket folders migration preserves store");
Debug.print("ALL BUCKET FOLDERS MIGRATION TESTS PASSED");
