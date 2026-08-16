import Bucket "./bucket/BucketService";

module {
  public type UploadSessionStore = Bucket.UploadSessionStore;
  public type BucketService = Bucket.BucketService;

  public let createUploadSessionStore = Bucket.createUploadSessionStore;
  public let create = Bucket.create;

  public let getCycleStatus = Bucket.getCycleStatus;
  public let getCloudStats = Bucket.getCloudStats;

  public let resolveBucketId = Bucket.resolveBucketId;
  public let getPrice = Bucket.getPrice;
  public let createBucket = Bucket.createBucket;
  public let getBucket = Bucket.getBucket;
  public let getBucketStats = Bucket.getBucketStats;
  public let getRenewQuote = Bucket.getRenewQuote;
  public let listBuckets = Bucket.listBuckets;
  public let renewBucket = Bucket.renewBucket;
  public let updateBucket = Bucket.updateBucket;
  public let deleteBucket = Bucket.deleteBucket;

  public let uploadFile = Bucket.uploadFile;
  public let beginFileUpload = Bucket.beginFileUpload;
  public let uploadFileChunkLegacy = Bucket.uploadFileChunkLegacy;
  public let uploadFileChunkIndexed = Bucket.uploadFileChunkIndexed;
  public let uploadFileChunk = Bucket.uploadFileChunk;
  public let completeFileUpload = Bucket.completeFileUpload;
  public let getUpload = Bucket.getUpload;
  public let cancelUpload = Bucket.cancelUpload;

  public let downloadFile = Bucket.downloadFile;
  public let servePublicFile = Bucket.servePublicFile;
  public let servePublicFileChunk = Bucket.servePublicFileChunk;
  public let getPublicFileUrl = Bucket.getPublicFileUrl;
  public let deleteFile = Bucket.deleteFile;
  public let listFiles = Bucket.listFiles;
  public let isStoredEncrypted = Bucket.isStoredEncrypted;

  public let getFile = Bucket.getFile;
  public let fileExists = Bucket.fileExists;
  public let updateFile = Bucket.updateFile;
  public let moveFile = Bucket.moveFile;
  public let copyFile = Bucket.copyFile;
  public let listFolder = Bucket.listFolder;
  public let searchFiles = Bucket.searchFiles;
  public let setFileTags = Bucket.setFileTags;
  public let addFileTags = Bucket.addFileTags;
  public let removeFileTags = Bucket.removeFileTags;
  public let getFileMetadata = Bucket.getFileMetadata;
  public let setFileMetadata = Bucket.setFileMetadata;
  public let bulkDeleteFiles = Bucket.bulkDeleteFiles;
  public let bulkMoveFiles = Bucket.bulkMoveFiles;
  public let bulkCopyFiles = Bucket.bulkCopyFiles;

  public let createApiKey = Bucket.createApiKey;
  public let getApiKey = Bucket.getApiKey;
  public let updateApiKey = Bucket.updateApiKey;
  public let regenerateApiKey = Bucket.regenerateApiKey;
};
