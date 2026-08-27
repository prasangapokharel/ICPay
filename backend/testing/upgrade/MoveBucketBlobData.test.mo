import Debug "mo:core/Debug";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Types "../../src/types";
import BlobStore "../../src/blob/BlobStore";
import MoveBucketBlobData "../../src/migrations/MoveBucketBlobData";

let owner = Principal.fromText("aaaaa-aa");
let bucketId = "bucket-blob-migrate";
let fileId = "file-blob-1";

let bucket : Types.Bucket = {
  id = bucketId;
  owner = owner;
  var name = "assets";
  capacity = 10_000_000;
  var storageUsed = 128;
  var visibility = #Public;
  var status = #ACTIVE;
  var expiresAt = 999;
  createdAt = 1;
};

let file : Types.StoredFile = {
  id = fileId;
  bucketId = bucketId;
  path = "/logo.webp";
  name = "logo.webp";
  size = 128;
  contentType = "image/webp";
  checksum = "abc";
  createdAt = 1;
  updatedAt = null;
  metadata = null;
  tags = [];
};

let payload = Blob.fromArray([1, 2, 3, 4]);

let oldStore : MoveBucketBlobData.OldBucketStore = {
  buckets = Map.empty<Types.BucketId, Types.Bucket>();
  files = Map.empty<Types.FileId, Types.StoredFile>();
  fileData = Map.empty<Types.FileId, Blob>();
  pathIndex = Map.empty<Text, Types.FileId>();
  ownerIndex = Map.empty<Principal, [Types.BucketId]>();
  apiKeys = Map.empty<Text, Types.ApiKey>();
  keyHashIndex = Map.empty<Text, Text>();
  bucketKeyIndex = Map.empty<Types.BucketId, [Text]>();
};
oldStore.buckets.add(bucketId, bucket);
oldStore.files.add(fileId, file);
oldStore.fileData.add(fileId, payload);
oldStore.pathIndex.add(bucketId # ":/logo.webp", fileId);
oldStore.ownerIndex.add(owner, [bucketId]);

let result = MoveBucketBlobData.migration({ bucketStore = oldStore });

assert result.bucketStore.buckets.size() == 1;
assert result.bucketStore.files.size() == 1;
assert result.legacyBlobStore.blobs.get(fileId) != null;

switch (result.legacyBlobStore.blobs.get(fileId)) {
  case (null) { assert false };
  case (?data) { assert data == payload };
};

Debug.print("PASS: file bytes moved to legacy blob store");
Debug.print("PASS: bucket metadata preserved");
Debug.print("ALL MOVE BUCKET BLOB DATA MIGRATION TESTS PASSED");
