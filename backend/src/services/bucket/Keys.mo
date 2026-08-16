import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../../types";
import Config "../../config/Config";
import RateLimitService "../RateLimitService";
import ApiKeyService "../ApiKeyService";
import Context "Context";

module {
  public func createApiKey(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    name: Text,
    permissions: Types.ApiKeyPermissions,
  ) : Types.ApiResult<Types.ApiKeyCreateResult> {
    if (not RateLimitService.allow(service.apiKeyLimits, caller, Config.RATE_BUCKET_API_KEY, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_BUCKET_API_KEY));
    };
    ApiKeyService.createApiKey(
      service.store,
      service.names,
      service.nextId,
      caller,
      bucketId,
      name,
      permissions,
    )
  };

  public func getApiKey(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    keyId: Text,
  ) : Types.ApiResult<Types.ApiKeyPublic> {
    ApiKeyService.getApiKey(service.store, service.names, caller, bucketId, keyId)
  };

  public func updateApiKey(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    keyId: Text,
    name: ?Text,
    permissions: ?Types.ApiKeyPermissions,
  ) : Types.ApiResult<Types.ApiKeyPublic> {
    if (not RateLimitService.allow(service.apiKeyLimits, caller, Config.RATE_BUCKET_API_KEY, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_BUCKET_API_KEY));
    };
    ApiKeyService.updateApiKey(
      service.store,
      service.names,
      caller,
      bucketId,
      keyId,
      name,
      permissions,
    )
  };

  public func regenerateApiKey(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    keyId: Text,
  ) : Types.ApiResult<Types.ApiKeyCreateResult> {
    if (not RateLimitService.allow(service.apiKeyLimits, caller, Config.RATE_BUCKET_API_KEY, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_BUCKET_API_KEY));
    };
    ApiKeyService.regenerateApiKey(
      service.store,
      service.names,
      caller,
      bucketId,
      keyId,
    )
  };
};
