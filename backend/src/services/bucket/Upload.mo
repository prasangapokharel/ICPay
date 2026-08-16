import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Types "../../types";
import Config "../../config/Config";
import RateLimitService "../RateLimitService";
import BucketRepo "../../repositories/BucketRepository";
import FileValidator "../../utils/FileValidator";
import BucketCrypto "../../utils/BucketCrypto";
import FilePath "../../utils/FilePath";
import Context "Context";
import Auth "Auth";
import Limits "Limits";

module {
  func uploadChunkCount(totalSize: Nat) : Nat {
    if (totalSize == 0) { 1 } else {
      (totalSize + Config.BUCKET_UPLOAD_MIN_CHUNK_BYTES - 1) / Config.BUCKET_UPLOAD_MIN_CHUNK_BYTES
    }
  };

  func assembleChunks(parts: Map.Map<Nat, Blob>, chunkCount: Nat) : [Blob] {
    Array.tabulate<Blob>(
      chunkCount,
      func(i) {
        switch (Map.get(parts, Nat.compare, i)) {
          case (?b) b;
          case (null) { assert(false); Blob.fromArray([]) };
        }
      },
    )
  };

  public func purgeStaleUploadSessions(service: Context.BucketService) {
    let cutoff = Time.now() - Config.BUCKET_UPLOAD_SESSION_TTL_NS;
    let next = Map.empty<Text, Types.FileUploadSession>();
    for ((id, session) in service.uploadSessions.map.entries()) {
      if (session.createdAt >= cutoff) {
        Map.add(next, Text.compare, id, session);
      };
    };
    service.uploadSessions.map := next;
  };

  func applyUploadChunk(
    session: Types.FileUploadSession,
    chunkIndex: Nat,
    data: Blob,
  ) : Types.ApiResult<Nat> {
    if (chunkIndex >= session.chunkCount) {
      return #err("Chunk index out of range");
    };
    if (data.size() == 0) {
      return #err("Empty chunk");
    };
    if (data.size() > Config.BUCKET_UPLOAD_CHUNK_BYTES) {
      return #err("Chunk too large");
    };
    switch (Map.get(session.chunkParts, Nat.compare, chunkIndex)) {
      case (?_) { return #err("Duplicate chunk") };
      case (null) {};
    };
    let next = session.received + data.size();
    if (next > session.totalSize) {
      return #err("Chunk exceeds declared file size");
    };
    Map.add(session.chunkParts, Nat.compare, chunkIndex, data);
    session.received := next;
    session.filled += 1;
    #ok(next)
  };

  func uploadChunksValidated(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    chunks: [Blob],
    fileSize: Nat,
    contentType: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FileId> {
    ignore contentType;
    let auth = switch (Auth.resolveWriteAuth(service, caller, bucketId, apiKey, #write)) {
      case (#err(e)) { return #err(e) };
      case (#ok(a)) a;
    };

    switch (Auth.validatePath(path)) {
      case (?err) { return #err(err) };
      case (null) {};
    };

    let normalized = switch (FileValidator.normalizeUploadFromParts(path, fileSize, chunks)) {
      case (null) {
        return #err("Invalid file format — file type not allowed or video blocked");
      };
      case (?ct) ct;
    };
    if (not FileValidator.validateFileSize(fileSize)) {
      return #err("File too large — max 10 MB");
    };

    let bucket = switch (Auth.requireBucket(service, bucketId)) {
      case (#err(e)) { return #err(e) };
      case (#ok(b)) b;
    };

    if (bucket.owner != auth.owner) {
      return #err("Permission denied");
    };
    if (not Auth.canWrite(bucket)) {
      return #err("Bucket expired — renew to enable uploads");
    };

    let existing = BucketRepo.getFileByPath(service.store, bucket.id, path);
    let oldSize = switch (existing) {
      case (null) 0;
      case (?f) f.size;
    };
    let baseUsed = if (bucket.storageUsed >= oldSize) {
      Nat.sub(bucket.storageUsed, oldSize)
    } else {
      0
    };
    let newUsed = baseUsed + fileSize;
    if (newUsed > bucket.capacity) {
      return #err("Storage limit reached");
    };

    switch (existing) {
      case (null) {};
      case (?f) {
        ignore BucketRepo.removeFile(service.store, f.id);
      };
    };

    let fileId = service.nextId();
    let key = BucketCrypto.deriveKey(bucket.owner, bucket.id);
    let sealed = BucketCrypto.sealFromChunks(chunks, key);
    let file : Types.StoredFile = {
      id = fileId;
      bucketId = bucket.id;
      path = path;
      name = FilePath.fileName(path);
      size = fileSize;
      contentType = normalized;
      checksum = sealed.fingerprint;
      createdAt = Time.now();
      updatedAt = null;
      metadata = null;
      tags = [];
    };

    BucketRepo.saveFile(service.store, file, sealed.ciphertext);
    BucketRepo.updateUsage(service.store, service.names, bucket.id, newUsed);
    #ok(fileId)
  };

  func uploadFileValidated(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    data: Blob,
    contentType: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FileId> {
    await uploadChunksValidated(
      service, caller, bucketId, path, [data], data.size(), contentType, apiKey,
    )
  };

  public func uploadFile(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    data: Blob,
    contentType: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FileId> {
    if (data.size() > Config.BUCKET_UPLOAD_SINGLE_MAX) {
      return #err("File too large for single upload — use chunked upload");
    };
    let auth = switch (Auth.resolveWriteAuth(service, caller, bucketId, apiKey, #write)) {
      case (#err(e)) { return #err(e) };
      case (#ok(a)) a;
    };
    if (not RateLimitService.allow(service.uploadLimits, auth.ratePrincipal, Config.RATE_BUCKET_UPLOAD, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_BUCKET_UPLOAD));
    };
    await uploadFileValidated(service, caller, bucketId, path, data, contentType, apiKey)
  };

  public func beginFileUpload(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    contentType: Text,
    totalSize: Nat,
    apiKey: ?Text,
  ) : async Types.ApiResult<Text> {
    purgeStaleUploadSessions(service);

    let auth = switch (Auth.resolveWriteAuth(service, caller, bucketId, apiKey, #write)) {
      case (#err(e)) { return #err(e) };
      case (#ok(a)) a;
    };

    if (not RateLimitService.allow(service.uploadLimits, auth.ratePrincipal, Config.RATE_BUCKET_UPLOAD, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_BUCKET_UPLOAD));
    };

    switch (Auth.validatePath(path)) {
      case (?err) { return #err(err) };
      case (null) {};
    };

    if (not FileValidator.validatePathExtension(path)) {
      return #err("Invalid file format — file type not allowed or video blocked");
    };
    if (not FileValidator.validateFileSize(totalSize)) {
      return #err("File too large — max 10 MB");
    };

    let bucket = switch (Auth.requireBucket(service, bucketId)) {
      case (#err(e)) { return #err(e) };
      case (#ok(b)) b;
    };
    if (bucket.owner != auth.owner) {
      return #err("Permission denied");
    };
    if (not Auth.canWrite(bucket)) {
      return #err("Bucket expired — renew to enable uploads");
    };

    let existing = BucketRepo.getFileByPath(service.store, bucket.id, path);
    let oldSize = switch (existing) { case (null) 0; case (?f) f.size };
    let baseUsed = if (bucket.storageUsed >= oldSize) {
      Nat.sub(bucket.storageUsed, oldSize)
    } else { 0 };
    if (baseUsed + totalSize > bucket.capacity) {
      return #err("Storage limit reached");
    };

    let uploadId = service.nextId();
    let chunkCount = uploadChunkCount(totalSize);
    let session : Types.FileUploadSession = {
      owner = auth.owner;
      bucketId = bucket.id;
      path = path;
      contentType = contentType;
      totalSize = totalSize;
      chunkCount = chunkCount;
      var received = 0;
      var filled = 0;
      var chunkParts = Map.empty<Nat, Blob>();
      createdAt = Time.now();
    };
    Map.add(service.uploadSessions.map, Text.compare, uploadId, session);
    #ok(uploadId)
  };

  public func uploadFileChunkLegacy(
    service: Context.BucketService,
    caller: Principal,
    uploadId: Text,
    data: Blob,
  ) : async Types.ApiResult<Nat> {
    purgeStaleUploadSessions(service);

    switch (Limits.allowUploadChunk(service, caller)) {
      case (?msg) { return #err(msg) };
      case (null) {};
    };

    switch (Map.get(service.uploadSessions.map, Text.compare, uploadId)) {
      case (null) { return #err("Upload session not found or expired") };
      case (?session) {
        if (session.owner != caller) {
          return #err("Permission denied");
        };
        if (session.filled >= session.chunkCount) {
          return #err("Upload already complete");
        };
        applyUploadChunk(session, session.filled, data)
      };
    }
  };

  public func uploadFileChunkIndexed(
    service: Context.BucketService,
    caller: Principal,
    uploadId: Text,
    chunkIndex: Nat,
    data: Blob,
  ) : async Types.ApiResult<Nat> {
    purgeStaleUploadSessions(service);

    switch (Limits.allowUploadChunk(service, caller)) {
      case (?msg) { return #err(msg) };
      case (null) {};
    };

    switch (Map.get(service.uploadSessions.map, Text.compare, uploadId)) {
      case (null) { return #err("Upload session not found or expired") };
      case (?session) {
        if (session.owner != caller) {
          return #err("Permission denied");
        };
        applyUploadChunk(session, chunkIndex, data)
      };
    }
  };

  /** @deprecated use uploadFileChunkLegacy or uploadFileChunkIndexed */
  public func uploadFileChunk(
    service: Context.BucketService,
    caller: Principal,
    uploadId: Text,
    chunkIndex: Nat,
    data: Blob,
  ) : async Types.ApiResult<Nat> {
    await uploadFileChunkIndexed(service, caller, uploadId, chunkIndex, data)
  };

  public func completeFileUpload(
    service: Context.BucketService,
    caller: Principal,
    uploadId: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FileId> {
    purgeStaleUploadSessions(service);

    switch (Map.get(service.uploadSessions.map, Text.compare, uploadId)) {
      case (null) { return #err("Upload session not found or expired") };
      case (?session) {
        if (session.owner != caller) {
          return #err("Permission denied");
        };
        if (session.received != session.totalSize or session.filled != session.chunkCount) {
          return #err("Upload incomplete");
        };
        Map.remove(service.uploadSessions.map, Text.compare, uploadId);
        let chunks = assembleChunks(session.chunkParts, session.chunkCount);
        await uploadChunksValidated(
          service,
          caller,
          session.bucketId,
          session.path,
          chunks,
          session.totalSize,
          session.contentType,
          apiKey,
        )
      };
    }
  };

  public func getUpload(
    service: Context.BucketService,
    caller: Principal,
    uploadId: Text,
  ) : Types.ApiResult<Types.UploadStatusPublic> {
    purgeStaleUploadSessions(service);
    switch (Map.get(service.uploadSessions.map, Text.compare, uploadId)) {
      case (null) { #err("Upload session not found or expired") };
      case (?session) {
        if (session.owner != caller) {
          return #err("Access denied");
        };
        let status = if (session.filled >= session.chunkCount and session.received >= session.totalSize) {
          "ready"
        } else {
          "active"
        };
        #ok({
          uploadId = uploadId;
          bucketId = session.bucketId;
          path = session.path;
          totalSize = session.totalSize;
          uploadedSize = session.received;
          chunkSize = Config.BUCKET_UPLOAD_MIN_CHUNK_BYTES;
          status = status;
          createdAt = session.createdAt;
        })
      };
    }
  };

  public func cancelUpload(
    service: Context.BucketService,
    caller: Principal,
    uploadId: Text,
  ) : Types.ApiResult<()> {
    purgeStaleUploadSessions(service);
    switch (Map.get(service.uploadSessions.map, Text.compare, uploadId)) {
      case (null) { #err("Upload session not found or expired") };
      case (?session) {
        if (session.owner != caller) {
          return #err("Access denied");
        };
        Map.remove(service.uploadSessions.map, Text.compare, uploadId);
        #ok()
      };
    }
  };
};
