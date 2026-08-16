import Debug "mo:core/Debug";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";
import AddBucketFileMeta "../../src/migrations/AddBucketFileMeta";

let owner = Principal.fromText("aaaaa-aa");
let now = Time.now();

let oldFile : AddBucketFileMeta.OldStoredFile = {
  id = "file-1";
  bucketId = "bucket-1";
  path = "/assets/logo.webp";
  size = 1200;
  contentType = "image/webp";
  checksum = "abc";
  createdAt = 1000;
};

let oldBucket : AddBucketFileMeta.OldBucket = {
  id = "bucket-1";
  owner = owner;
  var name = "cdn-assets";
  capacity = 10_000_000;
  var storageUsed = 1200;
  visibility = #Public;
  var status = #ACTIVE;
  var expiresAt = now + 1_000_000;
  createdAt = now;
};

let oldStore : AddBucketFileMeta.OldBucketStore = {
  buckets = Map.empty();
  files = Map.empty();
  fileData = Map.empty();
  pathIndex = Map.empty();
  ownerIndex = Map.empty();
  apiKeys = Map.empty();
  keyHashIndex = Map.empty();
  bucketKeyIndex = Map.empty();
};

Map.add(oldStore.files, Text.compare, "file-1", oldFile);
Map.add(oldStore.buckets, Text.compare, "bucket-1", oldBucket);

let result = AddBucketFileMeta.migration({ bucketStore = oldStore });

switch (Map.get(result.bucketStore.files, Text.compare, "file-1")) {
  case (null) { assert false; Debug.print("FAIL: migrated file missing") };
  case (?file) {
    assert file.name == "logo.webp";
    assert file.updatedAt == null;
    assert file.metadata == null;
    assert file.tags.size() == 0;
    assert file.path == "/assets/logo.webp";
    Debug.print("PASS: StoredFile migration adds meta defaults");
  };
};

switch (Map.get(result.bucketStore.buckets, Text.compare, "bucket-1")) {
  case (null) { assert false; Debug.print("FAIL: migrated bucket missing") };
  case (?bucket) {
    assert bucket.name == "cdn-assets";
    assert bucket.visibility == #Public;
    bucket.visibility := #Private;
    assert bucket.visibility == #Private;
    Debug.print("PASS: Bucket migration enables var visibility");
  };
};

Debug.print("ALL BUCKET FILE META MIGRATION TESTS PASSED");
