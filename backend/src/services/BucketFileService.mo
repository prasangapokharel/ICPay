import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Types "../types";
import Config "../config/Config";
import BucketRepo "../repositories/BucketRepository";
import BucketCrypto "../utils/BucketCrypto";
import BucketUrls "../utils/BucketUrls";
import FilePath "../utils/FilePath";
import FileTags "../utils/FileTags";
import FileValidator "../utils/FileValidator";
import BlobStore "../blob/BlobStore";
import BucketStorage "../storage/BucketStorage";
import Pagination "../../pkg/pagination/pg";
import Validate "../../pkg/validate/text";
import FolderPath "../utils/FolderPath";

module {
  public type FileContext = {
    store: BucketStorage.BucketStore;
    names: BucketStorage.NameIndex;
    blobs: BlobStore.Service;
    nextId: () -> Text;
  };
  func publicUrlFor(bucket: Types.Bucket, path: Text) : ?Text {
    switch (bucket.visibility) {
      case (#Public) BucketUrls.publicFileUrl(Config.BACKEND_CANISTER_ID, bucket.name, path);
      case (#Private) null;
    }
  };

  func filterPublic(
    bucket: Types.Bucket,
    files: [Types.StoredFile],
    keep: Types.StoredFile -> Bool,
  ) : [Types.FilePublic] {
    var out : [Types.FilePublic] = [];
    for (f in files.vals()) {
      if (keep(f)) {
        out := Array.concat(out, [toPublic(bucket, f)]);
      };
    };
    out
  };

  func toPublic(bucket: Types.Bucket, file: Types.StoredFile) : Types.FilePublic {
    BucketRepo.fileToPublic(file, publicUrlFor(bucket, file.path))
  };

  func paginate(
    files: [Types.FilePublic],
    folders: [Text],
    page: Nat,
    pageSize: Nat,
  ) : Types.FileListPage {
    let slice = Pagination.slice(files, page, pageSize, Config.BUCKET_FILE_PAGE_SIZE, Config.MAX_PAGE_SIZE);
    {
      items = slice.items;
      folders;
      total = slice.total;
      page = slice.page;
      pageSize = slice.pageSize;
    }
  };

  public func getFile(
    ctx: FileContext,
    bucket: Types.Bucket,
    path: Text,
  ) : Types.ApiResult<Types.FilePublic> {
    switch (BucketRepo.getFileByPath(ctx.store, bucket.id, path)) {
      case (null) { #err("File not found") };
      case (?file) { #ok(toPublic(bucket, file)) };
    }
  };

  public func fileExists(
    ctx: FileContext,
    bucket: Types.Bucket,
    path: Text,
  ) : Bool {
    switch (BucketRepo.getFileByPath(ctx.store, bucket.id, path)) {
      case (null) false;
      case (?_) true;
    }
  };

  public func updateFile(
    ctx: FileContext,
    bucket: Types.Bucket,
    path: Text,
    name: ?Text,
    contentType: ?Text,
    metadata: ?Text,
  ) : Types.ApiResult<Types.FilePublic> {
    switch (name, contentType, metadata) {
      case (null, null, null) { return #err("Nothing to update") };
      case (_, _, _) {};
    };

    let file = switch (BucketRepo.getFileByPath(ctx.store, bucket.id, path)) {
      case (null) { return #err("File not found") };
      case (?f) f;
    };

    let newName = switch (name) {
      case (null) file.name;
      case (?n) {
        if (n.size() == 0) { return #err("Name cannot be empty") };
        n
      };
    };

    let newContentType = switch (contentType) {
      case (null) file.contentType;
      case (?ct) {
        if (ct.size() == 0) { return #err("Content type cannot be empty") };
        ct
      };
    };

    let updated : Types.StoredFile = {
      id = file.id;
      bucketId = file.bucketId;
      path = file.path;
      name = newName;
      size = file.size;
      contentType = newContentType;
      checksum = file.checksum;
      createdAt = file.createdAt;
      updatedAt = ?Time.now();
      metadata = switch (metadata) { case (null) file.metadata; case (?m) ?m };
      tags = file.tags;
    };
    BucketRepo.updateFile(ctx.store, updated);
    #ok(toPublic(bucket, updated))
  };

  func validateDestPath(path: Text) : ?Text {
    switch (Validate.absPath(path)) {
      case (?e) { ?e };
      case (null) {
        let ext = FileValidator.pathExtension(path);
        if (not FileValidator.isAllowedExtension(ext)) {
          ?("Destination path not allowed")
        } else {
          null
        }
      };
    }
  };

  public func moveFile(
    ctx: FileContext,
    bucket: Types.Bucket,
    sourcePath: Text,
    destinationPath: Text,
  ) : Types.ApiResult<Types.FilePublic> {
    if (sourcePath == destinationPath) {
      return #err("Source and destination are the same");
    };
    switch (validateDestPath(destinationPath)) {
      case (?err) { return #err(err) };
      case (null) {};
    };

    let file = switch (BucketRepo.getFileByPath(ctx.store, bucket.id, sourcePath)) {
      case (null) { return #err("File not found") };
      case (?f) f;
    };

    if (BucketRepo.getFileByPath(ctx.store, bucket.id, destinationPath) != null) {
      return #err("Destination path already exists");
    };

    if (not BucketRepo.relocateFile(ctx.store, file.id, destinationPath)) {
      return #err("Move failed");
    };

    let moved = switch (BucketRepo.getFile(ctx.store, file.id)) {
      case (null) { return #err("Move failed") };
      case (?f) {
        let touched : Types.StoredFile = {
          id = f.id;
          bucketId = f.bucketId;
          path = f.path;
          name = FilePath.fileName(destinationPath);
          size = f.size;
          contentType = f.contentType;
          checksum = f.checksum;
          createdAt = f.createdAt;
          updatedAt = ?Time.now();
          metadata = f.metadata;
          tags = f.tags;
        };
        BucketRepo.updateFile(ctx.store, touched);
        touched
      };
    };
    #ok(toPublic(bucket, moved))
  };

  public func copyFile(
    ctx: FileContext,
    bucket: Types.Bucket,
    sourcePath: Text,
    destinationPath: Text,
  ) : async Types.ApiResult<Types.FilePublic> {
    if (sourcePath == destinationPath) {
      return #err("Source and destination are the same");
    };

    let file = switch (BucketRepo.getFileByPath(ctx.store, bucket.id, sourcePath)) {
      case (null) { return #err("File not found") };
      case (?f) f;
    };

    if (BucketRepo.getFileByPath(ctx.store, bucket.id, destinationPath) != null) {
      return #err("Destination path already exists");
    };

    let stored = switch (await BucketRepo.getFileData(ctx.blobs, file.id)) {
      case (null) { return #err("File data not found") };
      case (?data) data;
    };

    let copyId = ctx.nextId();
    let copy : Types.StoredFile = {
      id = copyId;
      bucketId = bucket.id;
      path = destinationPath;
      name = FilePath.fileName(destinationPath);
      size = file.size;
      contentType = file.contentType;
      checksum = file.checksum;
      createdAt = Time.now();
      updatedAt = null;
      metadata = file.metadata;
      tags = file.tags;
    };

    let newUsed = bucket.storageUsed + file.size;
    if (newUsed > bucket.capacity) {
      return #err("Storage limit reached");
    };

    await BucketRepo.saveFile(ctx.store, ctx.blobs, copy, stored);
    BucketRepo.updateUsage(ctx.store, ctx.names, bucket.id, newUsed);
    #ok(toPublic(bucket, copy))
  };

  public func listFolder(
    ctx: FileContext,
    bucket: Types.Bucket,
    prefix: Text,
    page: Nat,
    pageSize: Nat,
  ) : Types.ApiResult<Types.FileListPage> {
    let files = BucketRepo.getFilesByBucket(ctx.store, bucket.id);
    let filtered = filterPublic(bucket, files, func(f) { FilePath.hasPrefix(f.path, prefix) });
    let filePaths = Array.map<Types.StoredFile, Text>(files, func(f) { f.path });
    let storedFolders = BucketRepo.listFolderPaths(ctx.store, bucket.id);
    let folderNames = FolderPath.childFolderNames(filePaths, storedFolders, prefix);
    #ok(paginate(filtered, folderNames, page, pageSize))
  };

  public func searchFiles(
    ctx: FileContext,
    bucket: Types.Bucket,
    searchQuery: Text,
    page: Nat,
    pageSize: Nat,
  ) : Types.ApiResult<Types.FileListPage> {
    if (searchQuery.size() == 0) {
      return #err("Query is required");
    };
    let files = BucketRepo.getFilesByBucket(ctx.store, bucket.id);
    let filtered = filterPublic(
      bucket,
      files,
      func(f) {
        FilePath.containsIgnoreCase(f.name, searchQuery)
        or FilePath.containsIgnoreCase(f.path, searchQuery)
        or FilePath.containsIgnoreCase(f.contentType, searchQuery)
      },
    );
    #ok(paginate(filtered, [], page, pageSize))
  };

  public func createFolder(
    ctx: FileContext,
    bucket: Types.Bucket,
    path: Text,
  ) : Types.ApiResult<Text> {
    switch (FolderPath.validateFolderPath(path)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    let folderPath = FolderPath.normalizeFolderPath(path);
    if (BucketRepo.getFileByPath(ctx.store, bucket.id, folderPath) != null) {
      return #err("A file already exists at this path");
    };
    if (BucketStorage.hasFolder(ctx.store, bucket.id, folderPath)) {
      return #err("Folder already exists");
    };
    BucketRepo.createFolder(ctx.store, bucket.id, folderPath, Time.now());
    #ok(folderPath)
  };

  public func deleteFolder(
    ctx: FileContext,
    bucket: Types.Bucket,
    path: Text,
  ) : Types.ApiResult<Null> {
    switch (FolderPath.validateFolderPath(path)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    let folderPath = FolderPath.normalizeFolderPath(path);
    if (not BucketStorage.hasFolder(ctx.store, bucket.id, folderPath)) {
      return #err("Folder not found");
    };
    ignore BucketRepo.deleteFolder(ctx.store, bucket.id, folderPath);
    #ok(null)
  };

  public func setFileTags(
    ctx: FileContext,
    bucket: Types.Bucket,
    path: Text,
    tags: [Text],
  ) : Types.ApiResult<Types.FilePublic> {
    updateTags(ctx, bucket, path, func(_current) { FileTags.setTags([], tags) })
  };

  public func addFileTags(
    ctx: FileContext,
    bucket: Types.Bucket,
    path: Text,
    tags: [Text],
  ) : Types.ApiResult<Types.FilePublic> {
    updateTags(ctx, bucket, path, func(current) { FileTags.addTags(current, tags) })
  };

  public func removeFileTags(
    ctx: FileContext,
    bucket: Types.Bucket,
    path: Text,
    tags: [Text],
  ) : Types.ApiResult<Types.FilePublic> {
    updateTags(ctx, bucket, path, func(current) { FileTags.removeTags(current, tags) })
  };

  func updateTags(
    ctx: FileContext,
    bucket: Types.Bucket,
    path: Text,
    apply: ([Text]) -> [Text],
  ) : Types.ApiResult<Types.FilePublic> {
    let file = switch (BucketRepo.getFileByPath(ctx.store, bucket.id, path)) {
      case (null) { return #err("File not found") };
      case (?f) f;
    };
    let updated : Types.StoredFile = {
      id = file.id;
      bucketId = file.bucketId;
      path = file.path;
      name = file.name;
      size = file.size;
      contentType = file.contentType;
      checksum = file.checksum;
      createdAt = file.createdAt;
      updatedAt = ?Time.now();
      metadata = file.metadata;
      tags = apply(file.tags);
    };
    BucketRepo.updateFile(ctx.store, updated);
    #ok(toPublic(bucket, updated))
  };

  public func getFileMetadata(
    ctx: FileContext,
    bucket: Types.Bucket,
    path: Text,
  ) : Types.ApiResult<Text> {
    switch (BucketRepo.getFileByPath(ctx.store, bucket.id, path)) {
      case (null) { #err("File not found") };
      case (?file) {
        switch (file.metadata) {
          case (null) { #ok("") };
          case (?m) { #ok(m) };
        }
      };
    }
  };

  public func setFileMetadata(
    ctx: FileContext,
    bucket: Types.Bucket,
    path: Text,
    metadata: Text,
  ) : Types.ApiResult<Types.FilePublic> {
    updateFile(ctx, bucket, path, null, null, ?metadata)
  };

  public func bulkMove(
    ctx: FileContext,
    bucket: Types.Bucket,
    ops: [Types.FilePathOp],
  ) : Types.ApiResult<Nat> {
    if (ops.size() == 0) { return #err("No operations provided") };
    if (ops.size() > Config.BUCKET_BULK_MAX) {
      return #err("Too many operations — max " # Nat.toText(Config.BUCKET_BULK_MAX));
    };
    var count : Nat = 0;
    for (op in ops.vals()) {
      switch (moveFile(ctx, bucket, op.source, op.destination)) {
        case (#err(e)) { return #err(e) };
        case (#ok(_)) { count += 1 };
      };
    };
    #ok(count)
  };

  public func bulkCopy(
    ctx: FileContext,
    bucket: Types.Bucket,
    ops: [Types.FilePathOp],
  ) : async Types.ApiResult<Nat> {
    if (ops.size() == 0) { return #err("No operations provided") };
    if (ops.size() > Config.BUCKET_BULK_MAX) {
      return #err("Too many operations — max " # Nat.toText(Config.BUCKET_BULK_MAX));
    };
    var count : Nat = 0;
    for (op in ops.vals()) {
      switch (await copyFile(ctx, bucket, op.source, op.destination)) {
        case (#err(e)) { return #err(e) };
        case (#ok(_)) { count += 1 };
      };
    };
    #ok(count)
  };
};
