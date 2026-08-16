import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Map "mo:core/Map";
import BucketStorage "../../src/storage/BucketStorage";
import BucketRepository "../../src/repositories/BucketRepository";
import Types "../../src/types";

let store = BucketStorage.empty();
let names = Map.empty<Text, Text>();
let owner = Principal.fromText("aaaaa-aa");

let bucket : Types.Bucket = {
  id = "bucket-store-1";
  owner = owner;
  var name = "assets";
  capacity = 5_000_000_000;
  var storageUsed = 0;
  var visibility = #Public;
  var status = #ACTIVE;
  var expiresAt = 9_000_000_000_000_000;
  createdAt = 1_000_000_000_000_000;
};

BucketRepository.save(store, names, bucket);

switch (BucketRepository.get(store, "bucket-store-1")) {
  case (null) { assert false; Debug.print("FAIL: bucket missing") };
  case (?b) {
    assert b.name == "assets";
    Debug.print("PASS: save and get bucket");
  };
};

assert BucketRepository.getByOwner(store, owner).size() == 1;
Debug.print("PASS: owner index");

let png = Blob.fromArray([0x89, 0x50, 0x4E, 0x47]);
let file : Types.StoredFile = {
  id = "file-1";
  bucketId = "bucket-store-1";
  path = "/logo.png";
  size = png.size();
  contentType = "image/png";
  checksum = "abc";
  createdAt = 1_000_000_000_000_000;
};

BucketRepository.saveFile(store, file, png);

switch (BucketRepository.getFileByPath(store, "bucket-store-1", "/logo.png")) {
  case (null) { assert false; Debug.print("FAIL: path index miss") };
  case (?f) {
    assert f.id == "file-1";
    Debug.print("PASS: path index lookup");
  };
};

switch (BucketRepository.getFileData(store, "file-1")) {
  case (null) { assert false; Debug.print("FAIL: blob missing") };
  case (?data) {
    assert data == png;
    Debug.print("PASS: blob stored");
  };
};

BucketRepository.updateUsage(store, names, "bucket-store-1", png.size());
switch (BucketRepository.get(store, "bucket-store-1")) {
  case (null) { assert false };
  case (?b) {
    assert b.storageUsed == png.size();
    Debug.print("PASS: usage updated");
  };
};

switch (BucketRepository.removeFile(store, "file-1")) {
  case (null) { assert false; Debug.print("FAIL: delete failed") };
  case (?size) {
    assert size == png.size();
    Debug.print("PASS: delete returns size");
  };
};

assert BucketRepository.getFilesByBucket(store, "bucket-store-1").size() == 0;
Debug.print("PASS: file removed from bucket listing");

Debug.print("BucketStorage tests done");
