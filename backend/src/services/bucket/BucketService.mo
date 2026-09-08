import Context "Context";
import Stats "Stats";
import Lifecycle "Lifecycle";
import Upload "Upload";
import Serve "Serve";
import Files "Files";
import Keys "Keys";

module {
  public type UploadSessionStore = Context.UploadSessionStore;
  public type BucketService = Context.BucketService;

  public let createUploadSessionStore = Context.createUploadSessionStore;
  public let create = Context.create;

  public let getCycleStatus = Stats.getCycleStatus;
  public let getCloudStats = Stats.getCloudStats;

  public let resolveBucketId = Lifecycle.resolveBucketId;
  public let getPrice = Lifecycle.getPrice;
  public let createBucket = Lifecycle.createBucket;
  public let getBucket = Lifecycle.getBucket;
  public let getBucketStats = Lifecycle.getBucketStats;
  public let getRenewQuote = Lifecycle.getRenewQuote;
  public let listBuckets = Lifecycle.listBuckets;
  public let renewBucket = Lifecycle.renewBucket;
  public let updateBucket = Lifecycle.updateBucket;
  public let deleteBucket = Lifecycle.deleteBucket;

  public let uploadFile = Upload.uploadFile;
  public let beginFileUpload = Upload.beginFileUpload;
  public let uploadFileChunkLegacy = Upload.uploadFileChunkLegacy;
  public let uploadFileChunkIndexed = Upload.uploadFileChunkIndexed;
  public let uploadFileChunk = Upload.uploadFileChunk;
  public let completeFileUpload = Upload.completeFileUpload;
  public let getUpload = Upload.getUpload;
  public let cancelUpload = Upload.cancelUpload;

  public let downloadFile = Serve.downloadFile;
  public let servePublicFile = Serve.servePublicFile;
  public let servePublicFileChunk = Serve.servePublicFileChunk;
  public let servePublicFileChunkFromStored = Serve.servePublicFileChunkFromStored;
  public let getPublicFileUrl = Serve.getPublicFileUrl;
  public let deleteFile = Serve.deleteFile;
  public let listFiles = Serve.listFiles;
  public let isStoredEncrypted = Serve.isStoredEncrypted;

  public let getFile = Files.getFile;
  public let fileExists = Files.fileExists;
  public let updateFile = Files.updateFile;
  public let moveFile = Files.moveFile;
  public let copyFile = Files.copyFile;
  public let listFolder = Files.listFolder;
  public let searchFiles = Files.searchFiles;
  public let createFolder = Files.createFolder;
  public let deleteFolder = Files.deleteFolder;
  public let setFileTags = Files.setFileTags;
  public let addFileTags = Files.addFileTags;
  public let removeFileTags = Files.removeFileTags;
  public let getFileMetadata = Files.getFileMetadata;
  public let setFileMetadata = Files.setFileMetadata;
  public let bulkDeleteFiles = Files.bulkDeleteFiles;
  public let bulkMoveFiles = Files.bulkMoveFiles;
  public let bulkCopyFiles = Files.bulkCopyFiles;

  public let createApiKey = Keys.createApiKey;
  public let getApiKey = Keys.getApiKey;
  public let updateApiKey = Keys.updateApiKey;
  public let regenerateApiKey = Keys.regenerateApiKey;
};
