import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../../types";
import BucketRepo "../../repositories/BucketRepository";
import BucketStorage "../../storage/BucketStorage";
import ApiKeyService "../ApiKeyService";
import Context "Context";
import Validate "../../../pkg/validate/text";

module {
  public type ReadAuth = { bucket: Types.Bucket };

  public type WriteAction = { #write; #delete };

  public type WriteAuth = {
    owner: Principal;
    ratePrincipal: Principal;
  };

  public func requireBucket(
    service: Context.BucketService,
    segment: Text,
  ) : { #err: Text; #ok: Types.Bucket } {
    switch (BucketRepo.resolveBucketId(service.store, service.names, segment)) {
      case (null) { #err("Bucket not found") };
      case (?id) {
        switch (BucketRepo.get(service.store, id)) {
          case (null) { #err("Bucket not found") };
          case (?b) { #ok(b) };
        };
      };
    };
  };

  public func canRead(bucket: Types.Bucket, caller: Principal) : Bool {
    switch (bucket.visibility) {
      case (#Public) true;
      case (#Private) bucket.owner == caller;
    }
  };

  public func canWrite(bucket: Types.Bucket) : Bool {
    markExpiredIfNeeded(bucket);
    bucket.status == #ACTIVE and Time.now() < bucket.expiresAt
  };

  public func markExpiredIfNeeded(bucket: Types.Bucket) {
    if (Time.now() >= bucket.expiresAt and bucket.status == #ACTIVE) {
      bucket.status := #EXPIRED;
    };
  };

  public func refreshBucketStatus(
    store: BucketStorage.BucketStore,
    names: BucketStorage.NameIndex,
    bucket: Types.Bucket,
  ) {
    let before = bucket.status;
    markExpiredIfNeeded(bucket);
    if (before != bucket.status) {
      BucketRepo.save(store, names, bucket);
    };
  };

  public func validateBucketName(name: Text) : ?Text {
    if (name.size() < 3) return ?("Bucket name must be at least 3 characters");
    if (name.size() > 32) return ?("Bucket name must be at most 32 characters");
    for (c in name.chars()) {
      let ok = (c >= 'a' and c <= 'z')
        or (c >= '0' and c <= '9')
        or c == '-';
      if (not ok) return ?("Bucket name may only contain lowercase letters, digits, and hyphens");
    };
    null
  };

  public func validatePath(path: Text) : ?Text {
    Validate.absPath(path)
  };

  public func resolveReadAuth(
    service: Context.BucketService,
    caller: Principal,
    bucketSegment: Types.BucketId,
    apiKey: ?Text,
  ) : { #err: Text; #ok: ReadAuth } {
    let bucket = switch (requireBucket(service, bucketSegment)) {
      case (#err(e)) { return #err(e) };
      case (#ok(b)) b;
    };
    switch (apiKey) {
      case (null) {
        if (not canRead(bucket, caller)) {
          return #err("Access denied");
        };
        #ok({ bucket })
      };
      case (?secret) {
        switch (ApiKeyService.validate(service.store, secret)) {
          case (#err(e)) { #err(e) };
          case (#ok(key)) {
            if (key.bucketId != bucket.id) {
              return #err("API key not valid for this bucket");
            };
            if (not key.permissions.read) {
              return #err("API key lacks read permission");
            };
            #ok({ bucket })
          };
        }
      };
    }
  };

  public func resolveWriteAuth(
    service: Context.BucketService,
    caller: Principal,
    bucketSegment: Types.BucketId,
    apiKey: ?Text,
    action: WriteAction,
  ) : { #err: Text; #ok: WriteAuth } {
    let resolvedId = switch (BucketRepo.resolveBucketId(service.store, service.names, bucketSegment)) {
      case (null) { return #err("Bucket not found") };
      case (?id) id;
    };
    switch (apiKey) {
      case (null) {
        #ok({ owner = caller; ratePrincipal = caller })
      };
      case (?secret) {
        switch (ApiKeyService.validate(service.store, secret)) {
          case (#err(e)) { #err(e) };
          case (#ok(key)) {
            if (key.bucketId != resolvedId) {
              return #err("API key not valid for this bucket");
            };
            switch (action) {
              case (#write) {
                if (not key.permissions.write) {
                  return #err("API key lacks write permission");
                };
              };
              case (#delete) {
                if (not key.permissions.delete) {
                  return #err("API key lacks delete permission");
                };
              };
            };
            #ok({ owner = key.owner; ratePrincipal = key.owner })
          };
        }
      };
    }
  };
};
