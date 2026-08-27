export type DocsMethodKind = "query" | "update"

export type DocsMethodRow = {
  name: string
  kind: DocsMethodKind
  auth: string
}

export const BUCKET_API_METHODS: DocsMethodRow[] = [
  { name: "getBucketPrice", kind: "query", auth: "none" },
  { name: "createBucket", kind: "update", auth: "owner" },
  { name: "listBuckets", kind: "query", auth: "owner" },
  { name: "getBucket", kind: "query", auth: "owner" },
  { name: "getBucketStats", kind: "query", auth: "owner" },
  { name: "getRenewQuote", kind: "query", auth: "owner" },
  { name: "renewBucket", kind: "update", auth: "owner" },
  { name: "updateBucket", kind: "update", auth: "owner" },
  { name: "deleteBucket", kind: "update", auth: "owner" },
  { name: "getBucketCycleStatus", kind: "query", auth: "none" },
  { name: "getBucketCloudStats", kind: "query", auth: "none" },
  { name: "uploadFile", kind: "update", auth: "owner / write key" },
  { name: "beginFileUpload", kind: "update", auth: "owner / write key" },
  { name: "uploadFileChunk", kind: "update", auth: "owner / write key" },
  { name: "uploadFileChunkIndexed", kind: "update", auth: "owner / write key" },
  { name: "completeFileUpload", kind: "update", auth: "owner / write key" },
  { name: "getUpload", kind: "query", auth: "owner / write key" },
  { name: "cancelUpload", kind: "update", auth: "owner / write key" },
  { name: "downloadFile", kind: "update", auth: "owner / read key" },
  { name: "getPublicFileUrl", kind: "query", auth: "none" },
  { name: "listFiles", kind: "query", auth: "owner / read key" },
  { name: "getFile", kind: "query", auth: "owner / read key" },
  { name: "fileExists", kind: "query", auth: "owner / read key" },
  { name: "listFolder", kind: "query", auth: "owner / read key" },
  { name: "searchFiles", kind: "query", auth: "owner / read key" },
  { name: "updateFile", kind: "update", auth: "owner / write key" },
  { name: "moveFile", kind: "update", auth: "owner / write key" },
  { name: "copyFile", kind: "update", auth: "owner / write key" },
  { name: "deleteFile", kind: "update", auth: "owner / delete key" },
  { name: "setFileTags", kind: "update", auth: "owner / write key" },
  { name: "addFileTags", kind: "update", auth: "owner / write key" },
  { name: "removeFileTags", kind: "update", auth: "owner / write key" },
  { name: "getFileMetadata", kind: "query", auth: "owner / read key" },
  { name: "setFileMetadata", kind: "update", auth: "owner / write key" },
  { name: "bulkDeleteFiles", kind: "update", auth: "owner / delete key" },
  { name: "bulkMoveFiles", kind: "update", auth: "owner / write key" },
  { name: "bulkCopyFiles", kind: "update", auth: "owner / write key" },
  { name: "createApiKey", kind: "update", auth: "owner" },
  { name: "listApiKeys", kind: "query", auth: "owner" },
  { name: "getApiKey", kind: "query", auth: "owner" },
  { name: "updateApiKey", kind: "update", auth: "owner" },
  { name: "regenerateApiKey", kind: "update", auth: "owner" },
  { name: "revokeApiKey", kind: "update", auth: "owner" },
]
