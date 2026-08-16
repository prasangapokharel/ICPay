import Types "../types";
import BucketStorage "../storage/BucketStorage";

module {
  public func save(store: BucketStorage.BucketStore, key: Types.ApiKey) {
    BucketStorage.putApiKey(store, key)
  };

  public func get(store: BucketStorage.BucketStore, id: Text) : ?Types.ApiKey {
    BucketStorage.getApiKey(store, id)
  };

  public func getByHash(store: BucketStorage.BucketStore, hash: Text) : ?Types.ApiKey {
    BucketStorage.getApiKeyByHash(store, hash)
  };

  public func listByBucket(store: BucketStorage.BucketStore, bucketId: Types.BucketId) : [Types.ApiKey] {
    BucketStorage.getApiKeysByBucket(store, bucketId)
  };

  public func revoke(store: BucketStorage.BucketStore, id: Text, at: Int) : Bool {
    BucketStorage.revokeApiKey(store, id, at)
  };

  public func update(store: BucketStorage.BucketStore, key: Types.ApiKey) {
    BucketStorage.updateApiKeyRecord(store, key)
  };

  public func rotateSecret(
    store: BucketStorage.BucketStore,
    id: Text,
    newHash: Text,
    newHint: Text,
  ) : Bool {
    BucketStorage.rotateApiKeySecret(store, id, newHash, newHint)
  };

  public func toPublic(key: Types.ApiKey) : Types.ApiKeyPublic {
    {
      id = key.id;
      bucketId = key.bucketId;
      name = key.name;
      keyHint = key.keyHint;
      permissions = key.permissions;
      createdAt = key.createdAt;
      revoked = switch (key.revokedAt) {
        case (null) false;
        case (?_) true;
      };
    }
  };
};
