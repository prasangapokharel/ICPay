import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Types "../../types";
import Config "../../config/Config";
import RateLimitService "../RateLimitService";
import Time "mo:core/Time";
import BucketRepo "../../repositories/BucketRepository";
import BucketStorage "../../storage/BucketStorage";
import Sha256 "../../utils/Sha256";
import BucketCrypto "../../utils/BucketCrypto";
import BucketUrls "../../utils/BucketUrls";
import Context "Context";
import Auth "Auth";
import BlobStore "../../blob/BlobStore";
import Stats "Stats";

module {
  func decryptStoredFile(stored: Blob, key: [Nat8], checksum: Text) : ?Blob {
    if (BucketCrypto.isFastFingerprint(checksum)) {
      BucketCrypto.open(stored, key, checksum)
    } else {
      let data = BucketCrypto.decrypt(stored, key);
      let calculated = Sha256.toHex(Blob.toArray(Sha256.sha256Blob(data)));
      if (calculated != checksum) null else ?data
    }
  };

  func blobSlice(data: Blob, start: Nat, end: Nat) : Blob {
    let bytes = Blob.toArray(data);
    let len = Nat.sub(end, start);
    Blob.fromArray(Array.tabulate<Nat8>(len, func(i) { bytes[start + i] }))
  };

  func loadFileBlob(
    service: Context.BucketService,
    bucket: Types.Bucket,
    path: Text,
  ) : async Types.ApiResult<Blob> {
    switch (Auth.validatePath(path)) {
      case (?err) { return #err(err) };
      case (null) {};
    };

    let file = switch (BucketRepo.getFileByPath(service.store, bucket.id, path)) {
      case (null) { return #err("File not found") };
      case (?f) f;
    };

    switch (await BucketRepo.getFileData(service.blobs, file.id)) {
      case (null) { #err("File data not found") };
      case (?stored) {
        let key = BucketCrypto.deriveKey(bucket.owner, bucket.id);
        switch (decryptStoredFile(stored, key, file.checksum)) {
          case (null) { #err("File corrupted — checksum mismatch") };
          case (?data) { #ok(data) };
        }
      };
    }
  };

  func loadPublicFile(
    service: Context.BucketService,
    bucketId: Types.BucketId,
    path: Text,
    caller: ?Principal,
  ) : async Types.ApiResult<{ contentType: Text; data: Blob }> {
    switch (Auth.validatePath(path)) {
      case (?err) { return #err(err) };
      case (null) {};
    };

    let bucket = switch (BucketRepo.get(service.store, bucketId)) {
      case (null) { return #err("Bucket not found") };
      case (?b) b;
    };

    switch (caller) {
      case (null) {
        switch (bucket.visibility) {
          case (#Private) { return #err("Bucket is private") };
          case (#Public) {};
        };
      };
      case (?who) {
        if (not Auth.canRead(bucket, who)) {
          return #err("Access denied");
        };
      };
    };

    let file = switch (BucketRepo.getFileByPath(service.store, bucketId, path)) {
      case (null) { return #err("File not found") };
      case (?f) f;
    };

    switch (await BucketRepo.getFileData(service.blobs, file.id)) {
      case (null) { #err("File data not found") };
      case (?stored) {
        let key = BucketCrypto.deriveKey(bucket.owner, bucketId);
        switch (decryptStoredFile(stored, key, file.checksum)) {
          case (null) { #err("File corrupted — checksum mismatch") };
          case (?data) { #ok({ contentType = file.contentType; data }) };
        }
      };
    }
  };

  func loadPublicFileChunk(
    service: Context.BucketService,
    bucketId: Types.BucketId,
    path: Text,
    offset: Nat,
    limit: Nat,
    caller: ?Principal,
  ) : async Types.ApiResult<{ contentType: Text; chunk: Blob; totalSize: Nat }> {
    switch (Auth.validatePath(path)) {
      case (?err) { return #err(err) };
      case (null) {};
    };

    let bucket = switch (BucketRepo.get(service.store, bucketId)) {
      case (null) { return #err("Bucket not found") };
      case (?b) b;
    };

    switch (caller) {
      case (null) {
        switch (bucket.visibility) {
          case (#Private) { return #err("Bucket is private") };
          case (#Public) {};
        };
      };
      case (?who) {
        if (not Auth.canRead(bucket, who)) {
          return #err("Access denied");
        };
      };
    };

    let file = switch (BucketRepo.getFileByPath(service.store, bucketId, path)) {
      case (null) { return #err("File not found") };
      case (?f) f;
    };

    switch (await BucketRepo.getFileData(service.blobs, file.id)) {
      case (null) { #err("File data not found") };
      case (?stored) {
        let key = BucketCrypto.deriveKey(bucket.owner, bucketId);
        let total = file.size;
        if (offset >= total) {
          return #ok({ contentType = file.contentType; chunk = Blob.fromArray([]); totalSize = total })
        };
        let chunk = if (BucketCrypto.isFastFingerprint(file.checksum)) {
          BucketCrypto.decryptSlice(stored, key, offset, limit)
        } else {
          switch (decryptStoredFile(stored, key, file.checksum)) {
            case (null) { return #err("File corrupted — checksum mismatch") };
            case (?data) { blobSlice(data, offset, if (offset + limit > total) { total } else { offset + limit }) };
          }
        };
        #ok({ contentType = file.contentType; chunk; totalSize = total })
      };
    }
  };

  public func downloadFile(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Blob> {
    switch (Auth.resolveReadAuth(service, caller, bucketId, apiKey)) {
      case (#err(e)) { #err(e) };
      case (#ok({ bucket })) {
        await loadFileBlob(service, bucket, path)
      };
    }
  };

  public func servePublicFile(
    service: Context.BucketService,
    bucketId: Types.BucketId,
    path: Text,
  ) : async Types.ApiResult<{ contentType: Text; data: Blob }> {
    await loadPublicFile(service, bucketId, path, null)
  };

  func chunkFromStored(
    file: Types.StoredFile,
    bucketOwner: Principal,
    bucketId: Types.BucketId,
    stored: Blob,
    offset: Nat,
    limit: Nat,
  ) : Types.ApiResult<{ contentType: Text; chunk: Blob; totalSize: Nat }> {
    let key = BucketCrypto.deriveKey(bucketOwner, bucketId);
    let total = file.size;
    if (offset >= total) {
      return #ok({ contentType = file.contentType; chunk = Blob.fromArray([]); totalSize = total })
    };
    let chunk = if (BucketCrypto.isFastFingerprint(file.checksum)) {
      BucketCrypto.decryptSlice(stored, key, offset, limit)
    } else {
      switch (decryptStoredFile(stored, key, file.checksum)) {
        case (null) { return #err("File corrupted — checksum mismatch") };
        case (?data) { blobSlice(data, offset, if (offset + limit > total) { total } else { offset + limit }) };
      }
    };
    #ok({ contentType = file.contentType; chunk; totalSize = total })
  };

  public func servePublicFileChunkFromStored(
    service: Context.BucketService,
    bucketId: Types.BucketId,
    path: Text,
    offset: Nat,
    limit: Nat,
    stored: Blob,
  ) : Types.ApiResult<{ contentType: Text; chunk: Blob; totalSize: Nat }> {
    switch (Auth.validatePath(path)) {
      case (?err) { return #err(err) };
      case (null) {};
    };

    let bucket = switch (BucketRepo.get(service.store, bucketId)) {
      case (null) { return #err("Bucket not found") };
      case (?b) b;
    };

    switch (bucket.visibility) {
      case (#Private) { return #err("Bucket is private") };
      case (#Public) {};
    };

    let file = switch (BucketRepo.getFileByPath(service.store, bucketId, path)) {
      case (null) { return #err("File not found") };
      case (?f) f;
    };

    chunkFromStored(file, bucket.owner, bucketId, stored, offset, limit)
  };

  public func servePublicFileChunk(
    service: Context.BucketService,
    bucketId: Types.BucketId,
    path: Text,
    offset: Nat,
    limit: Nat,
  ) : async Types.ApiResult<{ contentType: Text; chunk: Blob; totalSize: Nat }> {
    await loadPublicFileChunk(service, bucketId, path, offset, limit, null)
  };

  public func getPublicFileUrl(
    service: Context.BucketService,
    bucketId: Types.BucketId,
    path: Text,
  ) : Types.ApiResult<Text> {
    switch (Auth.validatePath(path)) {
      case (?err) { return #err(err) };
      case (null) {};
    };

    let bucket = switch (Auth.requireBucket(service, bucketId)) {
      case (#err(e)) { return #err(e) };
      case (#ok(b)) b;
    };

    switch (bucket.visibility) {
      case (#Private) { return #err("Bucket is private") };
      case (#Public) {};
    };

    switch (BucketRepo.getFileByPath(service.store, bucket.id, path)) {
      case (null) { #err("File not found") };
      case (?_) {
        #ok(BucketUrls.fileUrl(Config.BACKEND_CANISTER_ID, bucket.name, path))
      };
    }
  };

  public func deleteFile(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<()> {
    let auth = switch (Auth.resolveWriteAuth(service, caller, bucketId, apiKey, #delete)) {
      case (#err(e)) { return #err(e) };
      case (#ok(a)) a;
    };

    if (not RateLimitService.allow(service.uploadLimits, auth.ratePrincipal, Config.RATE_BUCKET_UPLOAD, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_BUCKET_UPLOAD));
    };

    let bucket = switch (Auth.requireBucket(service, bucketId)) {
      case (#err(e)) { return #err(e) };
      case (#ok(b)) b;
    };

    if (bucket.owner != auth.owner) {
      return #err("Permission denied");
    };
    if (not Auth.canWrite(bucket)) {
      return #err("Bucket expired — renew to enable deletes");
    };

    let file = switch (BucketRepo.getFileByPath(service.store, bucket.id, path)) {
      case (null) { return #err("File not found") };
      case (?f) f;
    };

    switch (await BucketRepo.removeFile(service.store, service.blobs, file.id)) {
      case (null) { return #err("File not found") };
      case (?size) {
        let newUsed = if (bucket.storageUsed >= size) {
          Nat.sub(bucket.storageUsed, size)
        } else {
          0
        };
        BucketRepo.updateUsage(service.store, service.names, bucket.id, newUsed);
        #ok()
      };
    }
  };

  public func listFiles(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    page: Nat,
    pageSize: Nat,
    apiKey: ?Text,
  ) : Types.ApiResult<Types.FileListPage> {
    let bucket = switch (Auth.resolveReadAuth(service, caller, bucketId, apiKey)) {
      case (#err(e)) { return #err(e) };
      case (#ok({ bucket = b })) b;
    };

    let files = BucketRepo.getFilesByBucket(service.store, bucket.id);
    let isPublic = switch (bucket.visibility) {
      case (#Public) true;
      case (#Private) false;
    };
    let mapped = Array.map<Types.StoredFile, Types.FilePublic>(files, func(f) {
      let url = if (isPublic) {
        BucketUrls.publicFileUrl(Config.BACKEND_CANISTER_ID, bucket.name, f.path)
      } else {
        null
      };
      BucketRepo.fileToPublic(f, url)
    });
    #ok(Stats.paginateFiles(mapped, page, pageSize))
  };

  public func isStoredEncrypted(
    service: Context.BucketService,
    fileId: Types.FileId,
    plaintext: Blob,
  ) : async Bool {
    switch (await BucketRepo.getFileData(service.blobs, fileId)) {
      case (null) true;
      case (?stored) stored != plaintext;
    }
  };

};
