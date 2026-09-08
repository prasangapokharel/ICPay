import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Types "../../types";
import Config "../../config/Config";
import BucketFileService "../BucketFileService";
import Context "Context";
import Auth "Auth";
import Limits "Limits";
import Serve "Serve";

module {
  func fileCtx(service: Context.BucketService) : BucketFileService.FileContext {
    { store = service.store; names = service.names; blobs = service.blobs; nextId = service.nextId }
  };

  func mutateTags(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    apiKey: ?Text,
    apply: (Types.Bucket, Text) -> Types.ApiResult<Types.FilePublic>,
  ) : Types.ApiResult<Types.FilePublic> {
    switch (Auth.resolveWriteAuth(service, caller, bucketId, apiKey, #write)) {
      case (#err(e)) { return #err(e) };
      case (#ok(auth)) {
        switch (Limits.allowMutate(service, auth.ratePrincipal)) {
          case (?msg) { return #err(msg) };
          case (null) {};
        };
        switch (Auth.requireBucket(service, bucketId)) {
          case (#err(e)) { #err(e) };
          case (#ok(bucket)) {
            if (bucket.owner != auth.owner) { #err("Permission denied") }
            else if (not Auth.canWrite(bucket)) { #err("Bucket expired") }
            else { apply(bucket, path) }
          };
        }
      };
    }
  };

  public func getFile(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    apiKey: ?Text,
  ) : Types.ApiResult<Types.FilePublic> {
    switch (Auth.resolveReadAuth(service, caller, bucketId, apiKey)) {
      case (#err(e)) { #err(e) };
      case (#ok({ bucket })) { BucketFileService.getFile(fileCtx(service), bucket, path) };
    }
  };

  public func fileExists(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    apiKey: ?Text,
  ) : Types.ApiResult<Bool> {
    switch (Auth.resolveReadAuth(service, caller, bucketId, apiKey)) {
      case (#err(e)) { #err(e) };
      case (#ok({ bucket })) { #ok(BucketFileService.fileExists(fileCtx(service), bucket, path)) };
    }
  };

  public func updateFile(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    name: ?Text,
    contentType: ?Text,
    metadata: ?Text,
    apiKey: ?Text,
  ) : Types.ApiResult<Types.FilePublic> {
    switch (Auth.resolveWriteAuth(service, caller, bucketId, apiKey, #write)) {
      case (#err(e)) { return #err(e) };
      case (#ok(auth)) {
        switch (Limits.allowMutate(service, auth.ratePrincipal)) {
          case (?msg) { return #err(msg) };
          case (null) {};
        };
        switch (Auth.requireBucket(service, bucketId)) {
          case (#err(e)) { #err(e) };
          case (#ok(bucket)) {
            if (bucket.owner != auth.owner) { #err("Permission denied") }
            else if (not Auth.canWrite(bucket)) { #err("Bucket expired") }
            else { BucketFileService.updateFile(fileCtx(service), bucket, path, name, contentType, metadata) }
          };
        }
      };
    }
  };

  public func moveFile(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    sourcePath: Text,
    destinationPath: Text,
    apiKey: ?Text,
  ) : Types.ApiResult<Types.FilePublic> {
    switch (Auth.resolveWriteAuth(service, caller, bucketId, apiKey, #write)) {
      case (#err(e)) { return #err(e) };
      case (#ok(auth)) {
        switch (Limits.allowMutate(service, auth.ratePrincipal)) {
          case (?msg) { return #err(msg) };
          case (null) {};
        };
        switch (Auth.requireBucket(service, bucketId)) {
          case (#err(e)) { #err(e) };
          case (#ok(bucket)) {
            if (bucket.owner != auth.owner) { #err("Permission denied") }
            else if (not Auth.canWrite(bucket)) { #err("Bucket expired") }
            else { BucketFileService.moveFile(fileCtx(service), bucket, sourcePath, destinationPath) }
          };
        }
      };
    }
  };

  public func copyFile(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    sourcePath: Text,
    destinationPath: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FilePublic> {
    switch (Auth.resolveWriteAuth(service, caller, bucketId, apiKey, #write)) {
      case (#err(e)) { return #err(e) };
      case (#ok(auth)) {
        switch (Limits.allowMutate(service, auth.ratePrincipal)) {
          case (?msg) { return #err(msg) };
          case (null) {};
        };
        switch (Auth.requireBucket(service, bucketId)) {
          case (#err(e)) { #err(e) };
          case (#ok(bucket)) {
            if (bucket.owner != auth.owner) { #err("Permission denied") }
            else if (not Auth.canWrite(bucket)) { #err("Bucket expired") }
            else { await BucketFileService.copyFile(fileCtx(service), bucket, sourcePath, destinationPath) }
          };
        }
      };
    }
  };

  public func listFolder(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    prefix: Text,
    page: Nat,
    pageSize: Nat,
    apiKey: ?Text,
  ) : Types.ApiResult<Types.FileListPage> {
    switch (Auth.resolveReadAuth(service, caller, bucketId, apiKey)) {
      case (#err(e)) { #err(e) };
      case (#ok({ bucket })) { BucketFileService.listFolder(fileCtx(service), bucket, prefix, page, pageSize) };
    }
  };

  public func searchFiles(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    searchQuery: Text,
    page: Nat,
    pageSize: Nat,
    apiKey: ?Text,
  ) : Types.ApiResult<Types.FileListPage> {
    switch (Auth.resolveReadAuth(service, caller, bucketId, apiKey)) {
      case (#err(e)) { #err(e) };
      case (#ok({ bucket })) { BucketFileService.searchFiles(fileCtx(service), bucket, searchQuery, page, pageSize) };
    }
  };

  public func createFolder(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    apiKey: ?Text,
  ) : Types.ApiResult<Text> {
    switch (Auth.resolveWriteAuth(service, caller, bucketId, apiKey, #write)) {
      case (#err(e)) { return #err(e) };
      case (#ok(auth)) {
        switch (Limits.allowMutate(service, auth.ratePrincipal)) {
          case (?msg) { return #err(msg) };
          case (null) {};
        };
        switch (Auth.requireBucket(service, bucketId)) {
          case (#err(e)) { #err(e) };
          case (#ok(bucket)) {
            if (bucket.owner != auth.owner) { #err("Permission denied") }
            else if (not Auth.canWrite(bucket)) { #err("Bucket expired") }
            else { BucketFileService.createFolder(fileCtx(service), bucket, path) }
          };
        }
      };
    }
  };

  public func deleteFolder(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    apiKey: ?Text,
  ) : Types.ApiResult<Null> {
    switch (Auth.resolveWriteAuth(service, caller, bucketId, apiKey, #write)) {
      case (#err(e)) { return #err(e) };
      case (#ok(auth)) {
        switch (Limits.allowMutate(service, auth.ratePrincipal)) {
          case (?msg) { return #err(msg) };
          case (null) {};
        };
        switch (Auth.requireBucket(service, bucketId)) {
          case (#err(e)) { #err(e) };
          case (#ok(bucket)) {
            if (bucket.owner != auth.owner) { #err("Permission denied") }
            else if (not Auth.canWrite(bucket)) { #err("Bucket expired") }
            else { BucketFileService.deleteFolder(fileCtx(service), bucket, path) }
          };
        }
      };
    }
  };

  public func setFileTags(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    tags: [Text],
    apiKey: ?Text,
  ) : Types.ApiResult<Types.FilePublic> {
    mutateTags(service, caller, bucketId, path, apiKey, func(b, p) {
      BucketFileService.setFileTags(fileCtx(service), b, p, tags)
    })
  };

  public func addFileTags(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    tags: [Text],
    apiKey: ?Text,
  ) : Types.ApiResult<Types.FilePublic> {
    mutateTags(service, caller, bucketId, path, apiKey, func(b, p) {
      BucketFileService.addFileTags(fileCtx(service), b, p, tags)
    })
  };

  public func removeFileTags(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    tags: [Text],
    apiKey: ?Text,
  ) : Types.ApiResult<Types.FilePublic> {
    mutateTags(service, caller, bucketId, path, apiKey, func(b, p) {
      BucketFileService.removeFileTags(fileCtx(service), b, p, tags)
    })
  };

  public func getFileMetadata(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    apiKey: ?Text,
  ) : Types.ApiResult<Text> {
    switch (Auth.resolveReadAuth(service, caller, bucketId, apiKey)) {
      case (#err(e)) { #err(e) };
      case (#ok({ bucket })) { BucketFileService.getFileMetadata(fileCtx(service), bucket, path) };
    }
  };

  public func setFileMetadata(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    metadata: Text,
    apiKey: ?Text,
  ) : Types.ApiResult<Types.FilePublic> {
    switch (Auth.resolveWriteAuth(service, caller, bucketId, apiKey, #write)) {
      case (#err(e)) { return #err(e) };
      case (#ok(auth)) {
        switch (Limits.allowMutate(service, auth.ratePrincipal)) {
          case (?msg) { return #err(msg) };
          case (null) {};
        };
        switch (Auth.requireBucket(service, bucketId)) {
          case (#err(e)) { #err(e) };
          case (#ok(bucket)) {
            if (bucket.owner != auth.owner) { #err("Permission denied") }
            else if (not Auth.canWrite(bucket)) { #err("Bucket expired") }
            else { BucketFileService.setFileMetadata(fileCtx(service), bucket, path, metadata) }
          };
        }
      };
    }
  };

  public func bulkDeleteFiles(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    paths: [Text],
    apiKey: ?Text,
  ) : async Types.ApiResult<Nat> {
    if (paths.size() == 0) { return #err("No paths provided") };
    if (paths.size() > Config.BUCKET_BULK_MAX) {
      return #err("Too many paths — max " # Nat.toText(Config.BUCKET_BULK_MAX));
    };
    switch (Auth.resolveWriteAuth(service, caller, bucketId, apiKey, #delete)) {
      case (#err(e)) { return #err(e) };
      case (#ok(auth)) {
        switch (Limits.allowMutate(service, auth.ratePrincipal)) {
          case (?msg) { return #err(msg) };
          case (null) {};
        };
        switch (Auth.requireBucket(service, bucketId)) {
          case (#err(e)) { return #err(e) };
          case (#ok(bucket)) {
            if (bucket.owner != auth.owner) { return #err("Permission denied") };
            if (not Auth.canWrite(bucket)) { return #err("Bucket expired") };
            var count : Nat = 0;
            for (path in paths.vals()) {
              switch (await Serve.deleteFile(service, caller, bucketId, path, apiKey)) {
                case (#err(e)) { return #err(e) };
                case (#ok()) { count += 1 };
              };
            };
            #ok(count)
          };
        }
      };
    }
  };

  public func bulkMoveFiles(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    operations: [Types.FilePathOp],
    apiKey: ?Text,
  ) : Types.ApiResult<Nat> {
    switch (Auth.resolveWriteAuth(service, caller, bucketId, apiKey, #write)) {
      case (#err(e)) { return #err(e) };
      case (#ok(auth)) {
        switch (Limits.allowMutate(service, auth.ratePrincipal)) {
          case (?msg) { return #err(msg) };
          case (null) {};
        };
        switch (Auth.requireBucket(service, bucketId)) {
          case (#err(e)) { #err(e) };
          case (#ok(bucket)) {
            if (bucket.owner != auth.owner) { #err("Permission denied") }
            else if (not Auth.canWrite(bucket)) { #err("Bucket expired") }
            else { BucketFileService.bulkMove(fileCtx(service), bucket, operations) }
          };
        }
      };
    }
  };

  public func bulkCopyFiles(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    operations: [Types.FilePathOp],
    apiKey: ?Text,
  ) : async Types.ApiResult<Nat> {
    switch (Auth.resolveWriteAuth(service, caller, bucketId, apiKey, #write)) {
      case (#err(e)) { return #err(e) };
      case (#ok(auth)) {
        switch (Limits.allowMutate(service, auth.ratePrincipal)) {
          case (?msg) { return #err(msg) };
          case (null) {};
        };
        switch (Auth.requireBucket(service, bucketId)) {
          case (#err(e)) { #err(e) };
          case (#ok(bucket)) {
            if (bucket.owner != auth.owner) { #err("Permission denied") }
            else if (not Auth.canWrite(bucket)) { #err("Bucket expired") }
            else { await BucketFileService.bulkCopy(fileCtx(service), bucket, operations) }
          };
        }
      };
    }
  };
};
