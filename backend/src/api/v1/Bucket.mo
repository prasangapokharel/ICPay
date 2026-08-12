import Types "../../types";
import BucketService "../../services/BucketService";
import ApiKeyService "../../services/ApiKeyService";
import MiddlewareAuth "../../middleware/Auth";
import Blob "mo:core/Blob";

mixin (buckets: BucketService.BucketService, mwConfig: MiddlewareAuth.Config) {

  public shared query func getBucketPrice(capacityGB: Nat) : async Types.ApiResult<Nat> {
    BucketService.getPrice(capacityGB)
  };

  public shared ({ caller }) func createBucket(
    name: Text,
    capacityGB: Nat,
    visibility: Types.BucketVisibility,
  ) : async Types.ApiResult<Types.BucketId> {
    await BucketService.createBucket(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      name,
      capacityGB,
      visibility,
    )
  };

  public shared query ({ caller }) func getBucket(id: Types.BucketId) : async Types.ApiResult<Types.BucketPublic> {
    BucketService.getBucket(buckets, MiddlewareAuth.effectiveCaller(mwConfig, caller), id)
  };

  public shared query ({ caller }) func getBucketStats(id: Types.BucketId) : async Types.ApiResult<Types.BucketStats> {
    BucketService.getBucketStats(buckets, MiddlewareAuth.effectiveCaller(mwConfig, caller), id)
  };

  public shared query ({ caller }) func getRenewQuote(bucketId: Types.BucketId) : async Types.ApiResult<Types.BucketRenewQuote> {
    BucketService.getRenewQuote(buckets, MiddlewareAuth.effectiveCaller(mwConfig, caller), bucketId)
  };

  public shared query ({ caller }) func listBuckets() : async Types.ApiResult<[Types.BucketPublic]> {
    let effectiveCaller = MiddlewareAuth.effectiveCaller(mwConfig, caller);
    #ok(BucketService.listBuckets(buckets, effectiveCaller))
  };

  public shared ({ caller }) func uploadFile(
    bucketId: Types.BucketId,
    path: Text,
    data: Blob,
    contentType: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FileId> {
    await BucketService.uploadFile(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      path,
      data,
      contentType,
      apiKey,
    )
  };

  public shared query ({ caller }) func downloadFile(
    bucketId: Types.BucketId,
    path: Text,
  ) : async Types.ApiResult<Blob> {
    BucketService.downloadFile(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      path,
    )
  };

  public shared query func getPublicFileUrl(
    bucketId: Types.BucketId,
    path: Text,
  ) : async Types.ApiResult<Text> {
    BucketService.getPublicFileUrl(buckets, bucketId, path)
  };

  public shared ({ caller }) func deleteFile(
    bucketId: Types.BucketId,
    path: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<()> {
    await BucketService.deleteFile(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      path,
      apiKey,
    )
  };

  public shared query ({ caller }) func listFiles(
    bucketId: Types.BucketId,
    page: Nat,
    pageSize: Nat,
  ) : async Types.ApiResult<Types.FileListPage> {
    BucketService.listFiles(buckets, MiddlewareAuth.effectiveCaller(mwConfig, caller), bucketId, page, pageSize)
  };

  public shared ({ caller }) func renewBucket(bucketId: Types.BucketId) : async Types.ApiResult<Types.BucketRenewResult> {
    await BucketService.renewBucket(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
    )
  };

  public shared query func getBucketCycleStatus() : async Types.ApiResult<{
    balance: Nat;
    status: Text;
    canAcceptNewBuckets: Bool;
    estimatedDaysRemaining: Nat;
    dailyBurn: Nat;
  }> {
    let cycleStatus = BucketService.getCycleStatus(buckets);
    let statusText = switch (cycleStatus.status) {
      case (#CRITICAL) "CRITICAL";
      case (#LOW) "LOW";
      case (#HEALTHY) "HEALTHY";
      case (#COMFORTABLE) "COMFORTABLE";
    };
    #ok({
      balance = cycleStatus.balance;
      status = statusText;
      canAcceptNewBuckets = cycleStatus.canAcceptNewBuckets;
      estimatedDaysRemaining = cycleStatus.estimatedDaysRemaining;
      dailyBurn = cycleStatus.dailyBurn;
    })
  };

  public shared query func getBucketCloudStats() : async Types.ApiResult<Types.BucketCloudStats> {
    #ok(BucketService.getCloudStats(buckets))
  };

  public shared ({ caller }) func createApiKey(
    bucketId: Types.BucketId,
    name: Text,
    permissions: Types.ApiKeyPermissions,
  ) : async Types.ApiResult<Types.ApiKeyCreateResult> {
    BucketService.createApiKey(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      name,
      permissions,
    )
  };

  public shared query ({ caller }) func listApiKeys(
    bucketId: Types.BucketId,
  ) : async Types.ApiResult<[Types.ApiKeyPublic]> {
    ApiKeyService.listApiKeys(
      buckets.store,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
    )
  };

  public shared ({ caller }) func revokeApiKey(
    bucketId: Types.BucketId,
    keyId: Text,
  ) : async Types.ApiResult<()> {
    ApiKeyService.revokeApiKey(
      buckets.store,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      keyId,
    )
  };

};
