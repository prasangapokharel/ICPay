import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Types "../types";
import Config "../config/Config";
import ApiKeyRepo "../repositories/ApiKeyRepository";
import BucketRepo "../repositories/BucketRepository";
import BucketStorage "../storage/BucketStorage";
import ApiKeyCrypto "../utils/ApiKeyCrypto";

module {
  private func resolveBucket(
    store: BucketStorage.BucketStore,
    names: BucketStorage.NameIndex,
    segment: Types.BucketId,
  ) : ?Types.Bucket {
    switch (BucketRepo.resolveBucketId(store, names, segment)) {
      case (null) null;
      case (?id) BucketRepo.get(store, id);
    }
  };

  public func createApiKey(
    store: BucketStorage.BucketStore,
    names: BucketStorage.NameIndex,
    nextId: () -> Text,
    caller: Principal,
    bucketSegment: Types.BucketId,
    name: Text,
    permissions: Types.ApiKeyPermissions,
  ) : Types.ApiResult<Types.ApiKeyCreateResult> {
    switch (validateKeyName(name)) {
      case (?err) { return #err(err) };
      case (null) {};
    };

    let bucket = switch (resolveBucket(store, names, bucketSegment)) {
      case (null) { return #err("Bucket not found") };
      case (?b) b;
    };

    if (bucket.owner != caller) {
      return #err("Permission denied");
    };

    let existing = ApiKeyRepo.listByBucket(store, bucket.id);
    let activeCount = Array.size(
      Array.filter<Types.ApiKey>(existing, func(k) {
        switch (k.revokedAt) {
          case (null) true;
          case (?_) false;
        }
      }),
    );
    if (activeCount >= Config.BUCKET_MAX_API_KEYS) {
      return #err("API key limit reached for this bucket");
    };

    let keyId = nextId();
    let secret = ApiKeyCrypto.generateSecret(caller, keyId);
    let now = Time.now();
    let key : Types.ApiKey = {
      id = keyId;
      owner = caller;
      bucketId = bucket.id;
      name = name;
      keyHash = ApiKeyCrypto.hashSecret(secret);
      keyHint = ApiKeyCrypto.keyHint(secret);
      permissions = permissions;
      createdAt = now;
      var revokedAt = null;
    };
    ApiKeyRepo.save(store, key);
    #ok({
      id = keyId;
      secret = secret;
      name = key.name;
      bucketId = bucket.id;
      permissions = permissions;
      createdAt = now;
    })
  };

  public func getApiKey(
    store: BucketStorage.BucketStore,
    names: BucketStorage.NameIndex,
    caller: Principal,
    bucketSegment: Types.BucketId,
    keyId: Text,
  ) : Types.ApiResult<Types.ApiKeyPublic> {
    let bucket = switch (resolveBucket(store, names, bucketSegment)) {
      case (null) { return #err("Bucket not found") };
      case (?b) b;
    };

    if (bucket.owner != caller) {
      return #err("Permission denied");
    };

    let key = switch (ApiKeyRepo.get(store, keyId)) {
      case (null) { return #err("API key not found") };
      case (?k) k;
    };

    if (key.bucketId != bucket.id) {
      return #err("API key not found");
    };

    #ok(ApiKeyRepo.toPublic(key))
  };

  public func updateApiKey(
    store: BucketStorage.BucketStore,
    names: BucketStorage.NameIndex,
    caller: Principal,
    bucketSegment: Types.BucketId,
    keyId: Text,
    name: ?Text,
    permissions: ?Types.ApiKeyPermissions,
  ) : Types.ApiResult<Types.ApiKeyPublic> {
    switch (name, permissions) {
      case (null, null) { return #err("Nothing to update") };
      case (_, _) {};
    };

    let bucket = switch (resolveBucket(store, names, bucketSegment)) {
      case (null) { return #err("Bucket not found") };
      case (?b) b;
    };

    if (bucket.owner != caller) {
      return #err("Permission denied");
    };

    let key = switch (ApiKeyRepo.get(store, keyId)) {
      case (null) { return #err("API key not found") };
      case (?k) k;
    };

    if (key.bucketId != bucket.id) {
      return #err("API key not found");
    };

    switch (key.revokedAt) {
      case (?_) { return #err("API key revoked") };
      case (null) {};
    };

    let newName = switch (name) {
      case (null) key.name;
      case (?n) {
        switch (validateKeyName(n)) {
          case (?err) { return #err(err) };
          case (null) n;
        }
      };
    };

    let newPermissions = switch (permissions) {
      case (null) key.permissions;
      case (?p) p;
    };

    let updated : Types.ApiKey = {
      id = key.id;
      owner = key.owner;
      bucketId = key.bucketId;
      name = newName;
      keyHash = key.keyHash;
      keyHint = key.keyHint;
      permissions = newPermissions;
      createdAt = key.createdAt;
      var revokedAt = key.revokedAt;
    };
    ApiKeyRepo.update(store, updated);
    #ok(ApiKeyRepo.toPublic(updated))
  };

  public func regenerateApiKey(
    store: BucketStorage.BucketStore,
    names: BucketStorage.NameIndex,
    caller: Principal,
    bucketSegment: Types.BucketId,
    keyId: Text,
  ) : Types.ApiResult<Types.ApiKeyCreateResult> {
    let bucket = switch (resolveBucket(store, names, bucketSegment)) {
      case (null) { return #err("Bucket not found") };
      case (?b) b;
    };

    if (bucket.owner != caller) {
      return #err("Permission denied");
    };

    let key = switch (ApiKeyRepo.get(store, keyId)) {
      case (null) { return #err("API key not found") };
      case (?k) k;
    };

    if (key.bucketId != bucket.id) {
      return #err("API key not found");
    };

    switch (key.revokedAt) {
      case (?_) { return #err("API key revoked") };
      case (null) {};
    };

    let secret = ApiKeyCrypto.generateSecret(caller, keyId # ":" # Int.toText(Time.now()));
    let newHash = ApiKeyCrypto.hashSecret(secret);
    let newHint = ApiKeyCrypto.keyHint(secret);
    if (not ApiKeyRepo.rotateSecret(store, keyId, newHash, newHint)) {
      return #err("API key not found");
    };

    #ok({
      id = keyId;
      secret = secret;
      name = key.name;
      bucketId = bucket.id;
      permissions = key.permissions;
      createdAt = key.createdAt;
    })
  };

  public func listApiKeys(
    store: BucketStorage.BucketStore,
    names: BucketStorage.NameIndex,
    caller: Principal,
    bucketSegment: Types.BucketId,
  ) : Types.ApiResult<[Types.ApiKeyPublic]> {
    let bucket = switch (resolveBucket(store, names, bucketSegment)) {
      case (null) { return #err("Bucket not found") };
      case (?b) b;
    };

    if (bucket.owner != caller) {
      return #err("Permission denied");
    };

    let keys = ApiKeyRepo.listByBucket(store, bucket.id);
    #ok(Array.map<Types.ApiKey, Types.ApiKeyPublic>(keys, ApiKeyRepo.toPublic))
  };

  public func revokeApiKey(
    store: BucketStorage.BucketStore,
    names: BucketStorage.NameIndex,
    caller: Principal,
    bucketSegment: Types.BucketId,
    keyId: Text,
  ) : Types.ApiResult<()> {
    let bucket = switch (resolveBucket(store, names, bucketSegment)) {
      case (null) { return #err("Bucket not found") };
      case (?b) b;
    };

    if (bucket.owner != caller) {
      return #err("Permission denied");
    };

    let key = switch (ApiKeyRepo.get(store, keyId)) {
      case (null) { return #err("API key not found") };
      case (?k) k;
    };

    if (key.bucketId != bucket.id) {
      return #err("API key not found");
    };

    switch (key.revokedAt) {
      case (?_) { return #ok() };
      case (null) {};
    };

    if (not ApiKeyRepo.revoke(store, keyId, Time.now())) {
      return #err("API key not found");
    };
    #ok()
  };

  public func validate(
    store: BucketStorage.BucketStore,
    secret: Text,
  ) : Types.ApiResult<Types.ApiKey> {
    if (not ApiKeyCrypto.isValidShape(secret)) {
      return #err("Invalid API key");
    };
    let hash = ApiKeyCrypto.hashSecret(secret);
    let key = switch (ApiKeyRepo.getByHash(store, hash)) {
      case (null) { return #err("Invalid API key") };
      case (?k) k;
    };
    switch (key.revokedAt) {
      case (?_) { return #err("API key revoked") };
      case (null) {};
    };
    #ok(key)
  };

  private func validateKeyName(name: Text) : ?Text {
    if (name.size() < 1) return ?"Key name is required";
    if (name.size() > 32) return ?"Key name must be at most 32 characters";
    null
  };
};
