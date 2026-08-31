import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Text "mo:core/Text";
import BlobStore "../blob/BlobStore";
import BucketStorage "../storage/BucketStorage";
import Types "../types";

module {
  type Bucket = Types.Bucket;
  type BucketId = Types.BucketId;
  type StoredFile = Types.StoredFile;
  type FileId = Types.FileId;
  type BucketPublic = Types.BucketPublic;
  type FilePublic = Types.FilePublic;
  type NameIndex = BucketStorage.NameIndex;

  public func save(store: BucketStorage.BucketStore, names: NameIndex, bucket: Bucket) {
    BucketStorage.putBucket(store, names, bucket);
  };

  public func get(store: BucketStorage.BucketStore, id: BucketId) : ?Bucket {
    BucketStorage.getBucket(store, id)
  };

  public func resolveBucketId(
    store: BucketStorage.BucketStore,
    names: NameIndex,
    segment: Text,
  ) : ?BucketId {
    BucketStorage.resolveBucketId(store, names, segment)
  };

  public func bucketNameTaken(names: NameIndex, name: Text) : Bool {
    BucketStorage.bucketNameTaken(names, name)
  };

  public func getByOwner(store: BucketStorage.BucketStore, owner: Principal) : [Bucket] {
    BucketStorage.getBucketsByOwner(store, owner)
  };

  public func remove(store: BucketStorage.BucketStore, names: NameIndex, id: BucketId) {
    BucketStorage.deleteBucket(store, names, id)
  };

  public func updateUsage(
    store: BucketStorage.BucketStore,
    names: NameIndex,
    id: BucketId,
    newUsage: Nat,
  ) {
    switch (BucketStorage.getBucket(store, id)) {
      case (null) {};
      case (?bucket) {
        bucket.storageUsed := newUsage;
        BucketStorage.putBucket(store, names, bucket);
      };
    };
  };

  public func updateStatus(
    store: BucketStorage.BucketStore,
    names: NameIndex,
    id: BucketId,
    status: Types.BucketStatus,
  ) {
    switch (BucketStorage.getBucket(store, id)) {
      case (null) {};
      case (?bucket) {
        bucket.status := status;
        BucketStorage.putBucket(store, names, bucket);
      };
    };
  };

  public func saveFile(
    store: BucketStorage.BucketStore,
    blobs: BlobStore.Service,
    file: StoredFile,
    data: Blob,
  ) : async () {
    await blobs.put(file.id, data);
    BucketStorage.putFile(store, file);
  };

  public func getFile(store: BucketStorage.BucketStore, id: FileId) : ?StoredFile {
    BucketStorage.getFile(store, id)
  };

  public func getFileByPath(store: BucketStorage.BucketStore, bucketId: BucketId, path: Text) : ?StoredFile {
    BucketStorage.getFileByPath(store, bucketId, path)
  };

  public func getFileData(blobs: BlobStore.Service, id: FileId) : async ?Blob {
    await blobs.get(id)
  };

  public func getFilesByBucket(store: BucketStorage.BucketStore, bucketId: BucketId) : [StoredFile] {
    BucketStorage.getFilesByBucket(store, bucketId)
  };

  public func countFilesByBucket(store: BucketStorage.BucketStore, bucketId: BucketId) : Nat {
    BucketStorage.countFilesByBucket(store, bucketId)
  };

  public func removeFile(
    store: BucketStorage.BucketStore,
    blobs: BlobStore.Service,
    id: FileId,
  ) : async ?Nat {
    await blobs.delete(id);
    BucketStorage.deleteFile(store, id)
  };

  public func getTotalStorageUsed(store: BucketStorage.BucketStore) : Nat {
    BucketStorage.getTotalStorage(store)
  };

  public func countActiveBuckets(store: BucketStorage.BucketStore) : Nat {
    BucketStorage.countActiveBuckets(store)
  };

  public func countAllBuckets(store: BucketStorage.BucketStore) : Nat {
    BucketStorage.countAllBuckets(store)
  };

  public func countExpiredBuckets(store: BucketStorage.BucketStore) : Nat {
    BucketStorage.countExpiredBuckets(store)
  };

  public func getTotalCapacity(store: BucketStorage.BucketStore) : Nat {
    BucketStorage.getTotalCapacity(store)
  };

  public func countFiles(store: BucketStorage.BucketStore) : Nat {
    BucketStorage.countFiles(store)
  };

  public func getAllBuckets(store: BucketStorage.BucketStore) : [Bucket] {
    Iter.toArray(Map.values(store.buckets))
  };

  public func toPublic(bucket: Bucket) : BucketPublic {
    {
      id = bucket.id;
      name = bucket.name;
      capacity = bucket.capacity;
      storageUsed = bucket.storageUsed;
      visibility = bucket.visibility;
      status = bucket.status;
      expiresAt = bucket.expiresAt;
      createdAt = bucket.createdAt;
    }
  };

  public func fileToPublic(file: StoredFile, publicUrl: ?Text) : FilePublic {
    {
      id = file.id;
      path = file.path;
      name = file.name;
      size = file.size;
      contentType = file.contentType;
      createdAt = file.createdAt;
      updatedAt = file.updatedAt;
      metadata = file.metadata;
      tags = file.tags;
      publicUrl = publicUrl;
    }
  };

  public func updateFile(store: BucketStorage.BucketStore, file: StoredFile) {
    BucketStorage.updateFileRecord(store, file)
  };

  public func relocateFile(store: BucketStorage.BucketStore, fileId: FileId, newPath: Text) : Bool {
    BucketStorage.relocateFilePath(store, fileId, newPath)
  };

  public func createFolder(store: BucketStorage.BucketStore, bucketId: BucketId, path: Text, createdAt: Int) {
    BucketStorage.putFolder(store, bucketId, path, createdAt);
  };

  public func deleteFolder(store: BucketStorage.BucketStore, bucketId: BucketId, path: Text) : Bool {
    BucketStorage.removeFolder(store, bucketId, path)
  };

  public func listFolderPaths(store: BucketStorage.BucketStore, bucketId: BucketId) : [Text] {
    BucketStorage.listFolderPaths(store, bucketId)
  };

  public func purgeBucket(
    store: BucketStorage.BucketStore,
    blobs: BlobStore.Service,
    names: NameIndex,
    id: BucketId,
  ) : async () {
    let files = BucketStorage.getFilesByBucket(store, id);
    for (file in files.vals()) {
      await blobs.delete(file.id);
    };
    BucketStorage.purgeBucketData(store, id);
    BucketStorage.deleteBucket(store, names, id);
  };
};
