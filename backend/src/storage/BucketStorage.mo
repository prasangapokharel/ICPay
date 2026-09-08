import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Types "../types";
import FolderPath "../utils/FolderPath";

/// Bucket stable store — file metadata only; bytes live on the blob store canister.
module {
  type Bucket = Types.Bucket;
  type BucketId = Types.BucketId;
  type StoredFile = Types.StoredFile;
  type FileId = Types.FileId;

  public type BucketStore = {
    buckets: Map.Map<BucketId, Bucket>;
    files: Map.Map<FileId, StoredFile>;
    pathIndex: Map.Map<Text, FileId>;
    folders: Map.Map<Text, Int>;
    ownerIndex: Map.Map<Principal, [BucketId]>;
    apiKeys: Map.Map<Text, Types.ApiKey>;
    keyHashIndex: Map.Map<Text, Text>;
    bucketKeyIndex: Map.Map<BucketId, [Text]>;
  };

  public type NameIndex = Map.Map<Text, BucketId>;

  public func empty() : BucketStore {
    {
      buckets = Map.empty<BucketId, Bucket>();
      files = Map.empty<FileId, StoredFile>();
      pathIndex = Map.empty<Text, FileId>();
      folders = Map.empty<Text, Int>();
      ownerIndex = Map.empty<Principal, [BucketId]>();
      apiKeys = Map.empty<Text, Types.ApiKey>();
      keyHashIndex = Map.empty<Text, Text>();
      bucketKeyIndex = Map.empty<BucketId, [Text]>();
    };
  };

  public func pathKey(bucketId: BucketId, path: Text) : Text {
    bucketId # ":" # path
  };

  public func putBucket(store: BucketStore, names: NameIndex, bucket: Bucket) {
    store.buckets.add(bucket.id, bucket);
    names.add(bucket.name, bucket.id);
    switch (store.ownerIndex.get(bucket.owner)) {
      case (null) {
        store.ownerIndex.add(bucket.owner, [bucket.id]);
      };
      case (?ids) {
        if (not arrayContains(ids, bucket.id)) {
          store.ownerIndex.add(bucket.owner, Array.concat(ids, [bucket.id]));
        };
      };
    };
  };

  public func getBucket(store: BucketStore, id: BucketId) : ?Bucket {
    store.buckets.get(id)
  };

  /** Resolve a CDN path segment — internal bucket id or public bucket name. */
  public func resolveBucketId(store: BucketStore, names: NameIndex, segment: Text) : ?BucketId {
    switch (store.buckets.get(segment)) {
      case (?_) ?segment;
      case null names.get(segment);
    }
  };

  public func bucketNameTaken(names: NameIndex, name: Text) : Bool {
    switch (names.get(name)) {
      case (null) false;
      case (?_) true;
    }
  };

  public func reindexNames(store: BucketStore, names: NameIndex) {
    let stale = Iter.toArray(Iter.map<(Text, BucketId), Text>(names.entries(), func((name, _)) { name }));
    for (name in stale.vals()) {
      names.remove(name);
    };
    for (bucket in Map.values(store.buckets)) {
      names.add(bucket.name, bucket.id);
    };
  };

  public func countFilesByBucket(store: BucketStore, bucketId: BucketId) : Nat {
    var count : Nat = 0;
    for (file in Map.values(store.files)) {
      if (file.bucketId == bucketId) {
        count += 1;
      };
    };
    count
  };

  public func getBucketsByOwner(store: BucketStore, owner: Principal) : [Bucket] {
    switch (store.ownerIndex.get(owner)) {
      case (null) { [] };
      case (?ids) {
        Iter.toArray(
          Iter.filterMap<BucketId, Bucket>(ids.vals(), func(id) { store.buckets.get(id) }),
        )
      };
    }
  };

  public func deleteBucket(store: BucketStore, names: NameIndex, id: BucketId) {
    switch (store.buckets.get(id)) {
      case (null) {};
      case (?bucket) {
        store.buckets.remove(id);
        names.remove(bucket.name);
        switch (store.ownerIndex.get(bucket.owner)) {
          case (null) {};
          case (?ids) {
            let filtered = Array.filter<BucketId>(ids, func(bid) { bid != id });
            if (filtered.size() > 0) {
              store.ownerIndex.add(bucket.owner, filtered);
            } else {
              store.ownerIndex.remove(bucket.owner);
            };
          };
        };
      };
    };
  };

  public func putFile(store: BucketStore, file: StoredFile) {
    store.files.add(file.id, file);
    store.pathIndex.add(pathKey(file.bucketId, file.path), file.id);
    pruneMaterializedFolders(store, file.bucketId, file.path);
  };

  public func getFile(store: BucketStore, id: FileId) : ?StoredFile {
    store.files.get(id)
  };

  public func getFileByPath(store: BucketStore, bucketId: BucketId, path: Text) : ?StoredFile {
    switch (store.pathIndex.get(pathKey(bucketId, path))) {
      case (null) null;
      case (?fileId) store.files.get(fileId);
    }
  };

  public func getFilesByBucket(store: BucketStore, bucketId: BucketId) : [StoredFile] {
    Iter.toArray(
      Iter.filter<StoredFile>(Map.values(store.files), func(f) { f.bucketId == bucketId }),
    )
  };

  // Returns the deleted file size when a row existed.
  public func deleteFile(store: BucketStore, id: FileId) : ?Nat {
    switch (store.files.get(id)) {
      case (null) null;
      case (?file) {
        store.files.remove(id);
        store.pathIndex.remove(pathKey(file.bucketId, file.path));
        ?file.size
      };
    }
  };

  public func updateFileRecord(store: BucketStore, file: StoredFile) {
    store.files.add(file.id, file);
  };

  public func relocateFilePath(store: BucketStore, fileId: FileId, newPath: Text) : Bool {
    switch (store.files.get(fileId)) {
      case (null) false;
      case (?file) {
        store.pathIndex.remove(pathKey(file.bucketId, file.path));
        let moved : StoredFile = {
          id = file.id;
          bucketId = file.bucketId;
          path = newPath;
          name = file.name;
          size = file.size;
          contentType = file.contentType;
          checksum = file.checksum;
          createdAt = file.createdAt;
          updatedAt = file.updatedAt;
          metadata = file.metadata;
          tags = file.tags;
        };
        store.files.add(fileId, moved);
        store.pathIndex.add(pathKey(file.bucketId, newPath), fileId);
        true
      };
    }
  };

  public func purgeBucketData(store: BucketStore, bucketId: BucketId) {
    let fileIds = Iter.toArray(
      Iter.map<StoredFile, FileId>(
        Iter.filter(Map.values(store.files), func(f) { f.bucketId == bucketId }),
        func(f) { f.id },
      ),
    );
    for (id in fileIds.vals()) {
      ignore deleteFile(store, id);
    };
    let folderPrefix = bucketId # ":";
    var staleFolders : [Text] = [];
    for ((key, _) in store.folders.entries()) {
      if (Text.startsWith(key, #text folderPrefix)) {
        staleFolders := Array.concat(staleFolders, [key]);
      };
    };
    for (key in staleFolders.vals()) {
      store.folders.remove(key);
    };
    switch (store.bucketKeyIndex.get(bucketId)) {
      case (null) {};
      case (?keyIds) {
        for (keyId in keyIds.vals()) {
          switch (store.apiKeys.get(keyId)) {
            case (null) {};
            case (?key) {
              store.keyHashIndex.remove(key.keyHash);
              store.apiKeys.remove(keyId);
            };
          };
        };
        store.bucketKeyIndex.remove(bucketId);
      };
    };
  };

  public func putFolder(store: BucketStore, bucketId: BucketId, path: Text, createdAt: Int) {
    store.folders.add(pathKey(bucketId, path), createdAt);
  };

  public func removeFolder(store: BucketStore, bucketId: BucketId, path: Text) : Bool {
    let key = pathKey(bucketId, path);
    switch (store.folders.get(key)) {
      case (null) false;
      case (?_) {
        store.folders.remove(key);
        true
      };
    }
  };

  public func hasFolder(store: BucketStore, bucketId: BucketId, path: Text) : Bool {
    switch (store.folders.get(pathKey(bucketId, path))) {
      case (null) false;
      case (?_) true;
    }
  };

  public func listFolderPaths(store: BucketStore, bucketId: BucketId) : [Text] {
    let marker = bucketId # ":";
    var out : [Text] = [];
    for ((key, _) in store.folders.entries()) {
      if (Text.startsWith(key, #text marker)) {
        let iter = Text.split(key, #text marker);
        ignore iter.next();
        switch (iter.next()) {
          case (?path) { out := Array.concat(out, [path]) };
          case (null) {};
        };
      };
    };
    out
  };

  public func pruneMaterializedFolders(store: BucketStore, bucketId: BucketId, filePath: Text) {
    let marker = bucketId # ":";
    var stale : [Text] = [];
    for ((key, _) in store.folders.entries()) {
      if (Text.startsWith(key, #text marker)) {
        let iter = Text.split(key, #text marker);
        ignore iter.next();
        switch (iter.next()) {
          case (?folderPath) {
            if (FolderPath.folderCoversFile(folderPath, filePath)) {
              stale := Array.concat(stale, [key]);
            };
          };
          case (null) {};
        };
      };
    };
    for (key in stale.vals()) {
      store.folders.remove(key);
    };
  };

  public func getTotalStorage(store: BucketStore) : Nat {
    var total : Nat = 0;
    for (bucket in Map.values(store.buckets)) {
      total += bucket.storageUsed;
    };
    total
  };

  public func countActiveBuckets(store: BucketStore) : Nat {
    var count : Nat = 0;
    for (bucket in Map.values(store.buckets)) {
      if (bucket.status == #ACTIVE) {
        count += 1;
      };
    };
    count
  };

  public func countAllBuckets(store: BucketStore) : Nat {
    var count : Nat = 0;
    for (_ in Map.values(store.buckets)) {
      count += 1;
    };
    count
  };

  public func countExpiredBuckets(store: BucketStore) : Nat {
    var count : Nat = 0;
    for (bucket in Map.values(store.buckets)) {
      if (bucket.status == #EXPIRED) {
        count += 1;
      };
    };
    count
  };

  public func getTotalCapacity(store: BucketStore) : Nat {
    var total : Nat = 0;
    for (bucket in Map.values(store.buckets)) {
      total += bucket.capacity;
    };
    total
  };

  public func countFiles(store: BucketStore) : Nat {
    var count : Nat = 0;
    for (_ in Map.values(store.files)) {
      count += 1;
    };
    count
  };

  public func putApiKey(store: BucketStore, key: Types.ApiKey) {
    store.apiKeys.add(key.id, key);
    store.keyHashIndex.add(key.keyHash, key.id);
    switch (store.bucketKeyIndex.get(key.bucketId)) {
      case (null) {
        store.bucketKeyIndex.add(key.bucketId, [key.id]);
      };
      case (?ids) {
        if (not arrayContainsText(ids, key.id)) {
          store.bucketKeyIndex.add(key.bucketId, Array.concat(ids, [key.id]));
        };
      };
    };
  };

  public func getApiKey(store: BucketStore, id: Text) : ?Types.ApiKey {
    store.apiKeys.get(id)
  };

  public func getApiKeyByHash(store: BucketStore, hash: Text) : ?Types.ApiKey {
    switch (store.keyHashIndex.get(hash)) {
      case (null) null;
      case (?id) store.apiKeys.get(id);
    }
  };

  public func getApiKeysByBucket(store: BucketStore, bucketId: BucketId) : [Types.ApiKey] {
    switch (store.bucketKeyIndex.get(bucketId)) {
      case (null) { [] };
      case (?ids) {
        Iter.toArray(
          Iter.filterMap<Text, Types.ApiKey>(ids.vals(), func(id) { store.apiKeys.get(id) }),
        )
      };
    }
  };

  public func revokeApiKey(store: BucketStore, id: Text, at: Int) : Bool {
    switch (store.apiKeys.get(id)) {
      case (null) false;
      case (?key) {
        key.revokedAt := ?at;
        true
      };
    }
  };

  public func updateApiKeyRecord(store: BucketStore, key: Types.ApiKey) {
    store.apiKeys.add(key.id, key);
  };

  public func rotateApiKeySecret(store: BucketStore, id: Text, newHash: Text, newHint: Text) : Bool {
    switch (store.apiKeys.get(id)) {
      case (null) false;
      case (?old) {
        store.keyHashIndex.remove(old.keyHash);
        let updated : Types.ApiKey = {
          id = old.id;
          owner = old.owner;
          bucketId = old.bucketId;
          name = old.name;
          keyHash = newHash;
          keyHint = newHint;
          permissions = old.permissions;
          createdAt = old.createdAt;
          var revokedAt = old.revokedAt;
        };
        store.apiKeys.add(id, updated);
        store.keyHashIndex.add(newHash, id);
        true
      };
    }
  };

  private func arrayContainsText(arr: [Text], id: Text) : Bool {
    for (item in arr.vals()) {
      if (item == id) return true;
    };
    false
  };

  private func arrayContains(arr: [BucketId], id: BucketId) : Bool {
    for (item in arr.vals()) {
      if (item == id) return true;
    };
    false
  };
};
