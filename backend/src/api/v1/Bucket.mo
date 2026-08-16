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

  public shared ({ caller }) func beginFileUpload(
    bucketId: Types.BucketId,
    path: Text,
    contentType: Text,
    totalSize: Nat,
    apiKey: ?Text,
  ) : async Types.ApiResult<Text> {
    await BucketService.beginFileUpload(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      path,
      contentType,
      totalSize,
      apiKey,
    )
  };

  public shared ({ caller }) func uploadFileChunk(
    uploadId: Text,
    data: Blob,
  ) : async Types.ApiResult<Nat> {
    await BucketService.uploadFileChunkLegacy(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      uploadId,
      data,
    )
  };

  public shared ({ caller }) func uploadFileChunkIndexed(
    uploadId: Text,
    chunkIndex: Nat,
    data: Blob,
  ) : async Types.ApiResult<Nat> {
    await BucketService.uploadFileChunkIndexed(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      uploadId,
      chunkIndex,
      data,
    )
  };

  public shared ({ caller }) func completeFileUpload(
    uploadId: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FileId> {
    await BucketService.completeFileUpload(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      uploadId,
      apiKey,
    )
  };

  public shared query ({ caller }) func downloadFile(
    bucketId: Types.BucketId,
    path: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Blob> {
    BucketService.downloadFile(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      path,
      apiKey,
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
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FileListPage> {
    BucketService.listFiles(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      page,
      pageSize,
      apiKey,
    )
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
      buckets.names,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
    )
  };

  public shared query ({ caller }) func getApiKey(
    bucketId: Types.BucketId,
    keyId: Text,
  ) : async Types.ApiResult<Types.ApiKeyPublic> {
    BucketService.getApiKey(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      keyId,
    )
  };

  public shared ({ caller }) func updateApiKey(
    bucketId: Types.BucketId,
    keyId: Text,
    name: ?Text,
    permissions: ?Types.ApiKeyPermissions,
  ) : async Types.ApiResult<Types.ApiKeyPublic> {
    BucketService.updateApiKey(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      keyId,
      name,
      permissions,
    )
  };

  public shared ({ caller }) func regenerateApiKey(
    bucketId: Types.BucketId,
    keyId: Text,
  ) : async Types.ApiResult<Types.ApiKeyCreateResult> {
    BucketService.regenerateApiKey(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      keyId,
    )
  };

  public shared ({ caller }) func revokeApiKey(
    bucketId: Types.BucketId,
    keyId: Text,
  ) : async Types.ApiResult<()> {
    ApiKeyService.revokeApiKey(
      buckets.store,
      buckets.names,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      keyId,
    )
  };

  public shared query ({ caller }) func getFile(
    bucketId: Types.BucketId,
    path: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FilePublic> {
    BucketService.getFile(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      path,
      apiKey,
    )
  };

  public shared query ({ caller }) func fileExists(
    bucketId: Types.BucketId,
    path: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Bool> {
    BucketService.fileExists(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      path,
      apiKey,
    )
  };

  public shared ({ caller }) func updateFile(
    bucketId: Types.BucketId,
    path: Text,
    name: ?Text,
    contentType: ?Text,
    metadata: ?Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FilePublic> {
    BucketService.updateFile(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      path,
      name,
      contentType,
      metadata,
      apiKey,
    )
  };

  public shared ({ caller }) func moveFile(
    bucketId: Types.BucketId,
    sourcePath: Text,
    destinationPath: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FilePublic> {
    BucketService.moveFile(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      sourcePath,
      destinationPath,
      apiKey,
    )
  };

  public shared ({ caller }) func copyFile(
    bucketId: Types.BucketId,
    sourcePath: Text,
    destinationPath: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FilePublic> {
    BucketService.copyFile(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      sourcePath,
      destinationPath,
      apiKey,
    )
  };

  public shared query ({ caller }) func listFolder(
    bucketId: Types.BucketId,
    prefix: Text,
    page: Nat,
    pageSize: Nat,
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FileListPage> {
    BucketService.listFolder(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      prefix,
      page,
      pageSize,
      apiKey,
    )
  };

  public shared query ({ caller }) func searchFiles(
    bucketId: Types.BucketId,
    searchQuery: Text,
    page: Nat,
    pageSize: Nat,
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FileListPage> {
    BucketService.searchFiles(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      searchQuery,
      page,
      pageSize,
      apiKey,
    )
  };

  public shared ({ caller }) func setFileTags(
    bucketId: Types.BucketId,
    path: Text,
    tags: [Text],
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FilePublic> {
    BucketService.setFileTags(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      path,
      tags,
      apiKey,
    )
  };

  public shared ({ caller }) func addFileTags(
    bucketId: Types.BucketId,
    path: Text,
    tags: [Text],
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FilePublic> {
    BucketService.addFileTags(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      path,
      tags,
      apiKey,
    )
  };

  public shared ({ caller }) func removeFileTags(
    bucketId: Types.BucketId,
    path: Text,
    tags: [Text],
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FilePublic> {
    BucketService.removeFileTags(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      path,
      tags,
      apiKey,
    )
  };

  public shared query ({ caller }) func getFileMetadata(
    bucketId: Types.BucketId,
    path: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Text> {
    BucketService.getFileMetadata(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      path,
      apiKey,
    )
  };

  public shared ({ caller }) func setFileMetadata(
    bucketId: Types.BucketId,
    path: Text,
    metadata: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FilePublic> {
    BucketService.setFileMetadata(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      path,
      metadata,
      apiKey,
    )
  };

  public shared ({ caller }) func bulkDeleteFiles(
    bucketId: Types.BucketId,
    paths: [Text],
    apiKey: ?Text,
  ) : async Types.ApiResult<Nat> {
    await BucketService.bulkDeleteFiles(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      paths,
      apiKey,
    )
  };

  public shared ({ caller }) func bulkMoveFiles(
    bucketId: Types.BucketId,
    operations: [Types.FilePathOp],
    apiKey: ?Text,
  ) : async Types.ApiResult<Nat> {
    BucketService.bulkMoveFiles(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      operations,
      apiKey,
    )
  };

  public shared ({ caller }) func bulkCopyFiles(
    bucketId: Types.BucketId,
    operations: [Types.FilePathOp],
    apiKey: ?Text,
  ) : async Types.ApiResult<Nat> {
    BucketService.bulkCopyFiles(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      operations,
      apiKey,
    )
  };

  public shared query ({ caller }) func getUpload(uploadId: Text) : async Types.ApiResult<Types.UploadStatusPublic> {
    BucketService.getUpload(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      uploadId,
    )
  };

  public shared ({ caller }) func cancelUpload(uploadId: Text) : async Types.ApiResult<()> {
    BucketService.cancelUpload(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      uploadId,
    )
  };

  public shared ({ caller }) func updateBucket(
    bucketId: Types.BucketId,
    name: ?Text,
    visibility: ?Types.BucketVisibility,
  ) : async Types.ApiResult<Types.BucketPublic> {
    BucketService.updateBucket(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
      name,
      visibility,
    )
  };

  public shared ({ caller }) func deleteBucket(bucketId: Types.BucketId) : async Types.ApiResult<()> {
    BucketService.deleteBucket(
      buckets,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      bucketId,
    )
  };

};
