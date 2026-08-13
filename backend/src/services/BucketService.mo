import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Types "../types";
import Config "../config/Config";
import AccountHelper "../ledger/Account";
import BillingService "BillingService";
import TransferService "TransferService";
import RateLimitService "RateLimitService";
import UserRepo "../repositories/UserRepository";
import BucketRepo "../repositories/BucketRepository";
import BucketStorage "../storage/BucketStorage";
import UserStorage "../storage/UserStorage";
import RateLimitStorage "../storage/RateLimitStorage";
import FileValidator "../utils/FileValidator";
import Sha256 "../utils/Sha256";
import Memo "../utils/Memo";
import BucketCrypto "../utils/BucketCrypto";
import BucketUrls "../utils/BucketUrls";
import BlobUtil "../utils/BlobUtil";
import ApiKeyService "ApiKeyService";
import Map "mo:core/Map";

module {
  func uploadChunkCount(totalSize: Nat) : Nat {
    if (totalSize == 0) { 1 } else {
      (totalSize + Config.BUCKET_UPLOAD_CHUNK_BYTES - 1) / Config.BUCKET_UPLOAD_CHUNK_BYTES
    }
  };

  func assembleChunks(parts: Map.Map<Nat, Blob>, chunkCount: Nat) : Blob {
    let ordered = Array.tabulate<Blob>(
      chunkCount,
      func(i) {
        switch (Map.get(parts, Nat.compare, i)) {
          case (?b) b;
          case (null) { assert(false); Blob.fromArray([]) };
        }
      },
    );
    BlobUtil.concat(ordered)
  };

  public type UploadSessionStore = {
    var map: Map.Map<Text, Types.FileUploadSession>;
  };

  public func createUploadSessionStore() : UploadSessionStore {
    { var map = Map.empty<Text, Types.FileUploadSession>() };
  };

  public func create(
    users: UserStorage.UserMap,
    store: BucketStorage.BucketStore,
    names: BucketStorage.NameIndex,
    transfers: TransferService.TransferService,
    nextId: () -> Text,
    createLimits: RateLimitStorage.RateLimitMap,
    uploadLimits: RateLimitStorage.RateLimitMap,
    renewLimits: RateLimitStorage.RateLimitMap,
    apiKeyLimits: RateLimitStorage.RateLimitMap,
    uploadSessions: UploadSessionStore,
  ) : BucketService {
    {
      users;
      store;
      names;
      transfers;
      nextId;
      createLimits;
      uploadLimits;
      renewLimits;
      apiKeyLimits;
      uploadSessions;
    }
  };

  public type BucketService = {
    users: UserStorage.UserMap;
    store: BucketStorage.BucketStore;
    names: BucketStorage.NameIndex;
    transfers: TransferService.TransferService;
    nextId: () -> Text;
    createLimits: RateLimitStorage.RateLimitMap;
    uploadLimits: RateLimitStorage.RateLimitMap;
    renewLimits: RateLimitStorage.RateLimitMap;
    apiKeyLimits: RateLimitStorage.RateLimitMap;
    uploadSessions: UploadSessionStore;
  };

  public func getCycleStatus(service: BucketService) : BillingService.CycleStatus {
    BillingService.getCycleStatus(BucketRepo.getTotalStorageUsed(service.store))
  };

  public func getCloudStats(service: BucketService) : Types.BucketCloudStats {
    let storageUsed = BucketRepo.getTotalStorageUsed(service.store);
    let capacity = BucketRepo.getTotalCapacity(service.store);
    let utilization = if (capacity == 0) {
      0
    } else {
      storageUsed * 100 / capacity
    };

    var bucketCount : Nat = 0;
    var activeBuckets : Nat = 0;
    var expiredBuckets : Nat = 0;
    var revenueE8s : Nat = 0;
    for (bucket in BucketRepo.getAllBuckets(service.store).vals()) {
      bucketCount += 1;
      switch (bucket.status) {
        case (#ACTIVE) { activeBuckets += 1 };
        case (#EXPIRED) { expiredBuckets += 1 };
      };
      revenueE8s += BillingService.calculatePrice(bucket.capacity);
    };

    let cycleStatus = BillingService.getCycleStatus(storageUsed);
    let statusText = switch (cycleStatus.status) {
      case (#CRITICAL) "CRITICAL";
      case (#LOW) "LOW";
      case (#HEALTHY) "HEALTHY";
      case (#COMFORTABLE) "COMFORTABLE";
    };
    let monthlyBurn = cycleStatus.dailyBurn * 30;
    let targetBalance = cycleStatus.dailyBurn * 60;
    let recommendedTopUp = switch (Nat.compare(cycleStatus.balance, targetBalance)) {
      case (#greater or #equal) 0;
      case (#less) Nat.sub(targetBalance, cycleStatus.balance);
    };

    {
      bucketCount;
      activeBuckets;
      expiredBuckets;
      fileCount = BucketRepo.countFiles(service.store);
      storageUsedBytes = storageUsed;
      capacityBytes = capacity;
      utilizationPercent = utilization;
      estimatedCapacityRevenueE8s = revenueE8s;
      cyclesBalance = cycleStatus.balance;
      cyclesDailyBurn = cycleStatus.dailyBurn;
      cyclesMonthlyBurn = monthlyBurn;
      cyclesStatus = statusText;
      canAcceptNewBuckets = cycleStatus.canAcceptNewBuckets;
      estimatedDaysRemaining = cycleStatus.estimatedDaysRemaining;
      recommendedTopUpCycles = recommendedTopUp;
    }
  };

  /** Map a CDN URL segment (bucket name or internal id) to the stored bucket id. */
  public func resolveBucketId(service: BucketService, segment: Text) : ?Types.BucketId {
    BucketRepo.resolveBucketId(service.store, service.names, segment)
  };

  private func requireBucket(
    service: BucketService,
    segment: Text,
  ) : { #err: Text; #ok: Types.Bucket } {
    switch (BucketRepo.resolveBucketId(service.store, service.names, segment)) {
      case (null) { #err("Bucket not found") };
      case (?id) {
        switch (BucketRepo.get(service.store, id)) {
          case (null) { #err("Bucket not found") };
          case (?b) { #ok(b) };
        };
      };
    };
  };

  public func getPrice(capacityGB: Nat) : Types.ApiResult<Nat> {
    switch (BillingService.capacityBytesFromGB(capacityGB)) {
      case (null) { #err("Invalid capacity — choose 1, 5, 10, 25, 50, 100, 250, or 500 GB") };
      case (?bytes) { #ok(BillingService.calculatePrice(bytes)) };
    }
  };

  public func createBucket(
    service: BucketService,
    caller: Principal,
    name: Text,
    capacityGB: Nat,
    visibility: Types.BucketVisibility,
  ) : async Types.ApiResult<Types.BucketId> {
    if (not RateLimitService.allow(service.createLimits, caller, Config.RATE_BUCKET_CREATE, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_BUCKET_CREATE));
    };

    switch (BillingService.checkBeforeOperation()) {
      case (#err(e)) { return #err(e) };
      case (#ok()) {};
    };

    switch (validateBucketName(name)) {
      case (?err) { return #err(err) };
      case (null) {};
    };

    if (BucketRepo.bucketNameTaken(service.names, name)) {
      return #err("Bucket name already taken");
    };

    let capacityBytes = switch (BillingService.capacityBytesFromGB(capacityGB)) {
      case (null) { return #err("Invalid capacity — choose 1, 5, 10, 25, 50, 100, 250, or 500 GB") };
      case (?bytes) bytes;
    };

    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (null) { return #err("User not found") };
      case (?_) {};
    };

    let price = BillingService.calculatePrice(capacityBytes);
    let destination = AccountHelper.defaultAccount(Principal.fromText(Config.TREASURY));
    let memo = ?Memo.bucketCreate(name, capacityGB);

    switch (
      await TransferService.transferByAccountInternal(
        service.transfers,
        caller,
        Config.ICP_LEDGER_CANISTER_ID,
        destination,
        price,
        memo,
      )
    ) {
      case (#err(e)) { return #err(e) };
      case (#ok(_)) {};
    };

    let now = Time.now();
    let bucketId = service.nextId();
    let bucket : Types.Bucket = {
      id = bucketId;
      owner = caller;
      var name = name;
      capacity = capacityBytes;
      var storageUsed = 0;
      visibility = visibility;
      var status = #ACTIVE;
      var expiresAt = now + Config.BUCKET_PERIOD_NS;
      createdAt = now;
    };
    BucketRepo.save(service.store, service.names, bucket);
    #ok(bucketId)
  };

  public func getBucket(
    service: BucketService,
    caller: Principal,
    id: Types.BucketId,
  ) : Types.ApiResult<Types.BucketPublic> {
    switch (requireBucket(service, id)) {
      case (#err(e)) { #err(e) };
      case (#ok(bucket)) {
        if (not canRead(bucket, caller)) {
          return #err("Bucket not found");
        };
        refreshBucketStatus(service.store, service.names, bucket);
        #ok(BucketRepo.toPublic(bucket))
      };
    }
  };

  public func getBucketStats(
    service: BucketService,
    caller: Principal,
    id: Types.BucketId,
  ) : Types.ApiResult<Types.BucketStats> {
    switch (requireBucket(service, id)) {
      case (#err(e)) { #err(e) };
      case (#ok(bucket)) {
        if (not canRead(bucket, caller)) {
          return #err("Bucket not found");
        };
        refreshBucketStatus(service.store, service.names, bucket);
        #ok(buildStats(service.store, bucket))
      };
    }
  };

  public func getRenewQuote(
    service: BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
  ) : Types.ApiResult<Types.BucketRenewQuote> {
    switch (requireBucket(service, bucketId)) {
      case (#err(e)) { #err(e) };
      case (#ok(bucket)) {
        if (bucket.owner != caller) {
          return #err("Permission denied");
        };
        refreshBucketStatus(service.store, service.names, bucket);
        let now = Time.now();
        let price = BillingService.calculatePrice(bucket.capacity);
        #ok({
          bucketId = bucket.id;
          priceE8s = price;
          currentExpiresAt = bucket.expiresAt;
          newExpiresAt = nextExpiresAt(now, bucket.expiresAt);
          status = bucket.status;
        })
      };
    }
  };

  public func listBuckets(service: BucketService, caller: Principal) : [Types.BucketPublic] {
    let buckets = BucketRepo.getByOwner(service.store, caller);
    Array.map<Types.Bucket, Types.BucketPublic>(buckets, func(b) {
      refreshBucketStatus(service.store, service.names, b);
      BucketRepo.toPublic(b)
    })
  };

  public func uploadFile(
    service: BucketService,
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
    let auth = switch (resolveWriteAuth(service, caller, bucketId, apiKey, #write)) {
      case (#err(e)) { return #err(e) };
      case (#ok(a)) a;
    };
    if (not RateLimitService.allow(service.uploadLimits, auth.ratePrincipal, Config.RATE_BUCKET_UPLOAD, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_BUCKET_UPLOAD));
    };
    await uploadFileValidated(service, caller, bucketId, path, data, contentType, apiKey)
  };

  public func beginFileUpload(
    service: BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    contentType: Text,
    totalSize: Nat,
    apiKey: ?Text,
  ) : async Types.ApiResult<Text> {
    purgeStaleUploadSessions(service);

    let auth = switch (resolveWriteAuth(service, caller, bucketId, apiKey, #write)) {
      case (#err(e)) { return #err(e) };
      case (#ok(a)) a;
    };

    if (not RateLimitService.allow(service.uploadLimits, auth.ratePrincipal, Config.RATE_BUCKET_UPLOAD, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_BUCKET_UPLOAD));
    };

    switch (validatePath(path)) {
      case (?err) { return #err(err) };
      case (null) {};
    };

    if (not FileValidator.validatePathExtension(path)) {
      return #err("Invalid file format — file type not allowed or video blocked");
    };
    if (not FileValidator.validateFileSize(totalSize)) {
      return #err("File too large — max 10 MB");
    };

    let bucket = switch (requireBucket(service, bucketId)) {
      case (#err(e)) { return #err(e) };
      case (#ok(b)) b;
    };
    if (bucket.owner != auth.owner) {
      return #err("Permission denied");
    };
    if (not canWrite(bucket)) {
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

  public func uploadFileChunkLegacy(
    service: BucketService,
    caller: Principal,
    uploadId: Text,
    data: Blob,
  ) : async Types.ApiResult<Nat> {
    purgeStaleUploadSessions(service);

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
    service: BucketService,
    caller: Principal,
    uploadId: Text,
    chunkIndex: Nat,
    data: Blob,
  ) : async Types.ApiResult<Nat> {
    purgeStaleUploadSessions(service);

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
    service: BucketService,
    caller: Principal,
    uploadId: Text,
    chunkIndex: Nat,
    data: Blob,
  ) : async Types.ApiResult<Nat> {
    await uploadFileChunkIndexed(service, caller, uploadId, chunkIndex, data)
  };

  public func completeFileUpload(
    service: BucketService,
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
        let data = assembleChunks(session.chunkParts, session.chunkCount);
        await uploadFileValidated(
          service, caller, session.bucketId, session.path, data, session.contentType, apiKey,
        )
      };
    }
  };

  private func purgeStaleUploadSessions(service: BucketService) {
    let cutoff = Time.now() - Config.BUCKET_UPLOAD_SESSION_TTL_NS;
    let next = Map.empty<Text, Types.FileUploadSession>();
    for ((id, session) in service.uploadSessions.map.entries()) {
      if (session.createdAt >= cutoff) {
        Map.add(next, Text.compare, id, session);
      };
    };
    service.uploadSessions.map := next;
  };

  private func uploadFileValidated(
    service: BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    data: Blob,
    contentType: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<Types.FileId> {
    let auth = switch (resolveWriteAuth(service, caller, bucketId, apiKey, #write)) {
      case (#err(e)) { return #err(e) };
      case (#ok(a)) a;
    };

    switch (validatePath(path)) {
      case (?err) { return #err(err) };
      case (null) {};
    };

    let normalized = switch (FileValidator.normalizeUpload(path, contentType, data)) {
      case (null) {
        return #err("Invalid file format — file type not allowed or video blocked");
      };
      case (?ct) ct;
    };
    if (not FileValidator.validateFileSize(data.size())) {
      return #err("File too large — max 10 MB");
    };

    let bucket = switch (requireBucket(service, bucketId)) {
      case (#err(e)) { return #err(e) };
      case (#ok(b)) b;
    };

    if (bucket.owner != auth.owner) {
      return #err("Permission denied");
    };
    if (not canWrite(bucket)) {
      return #err("Bucket expired — renew to enable uploads");
    };

    let fileSize = data.size();
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
    let sealed = BucketCrypto.seal(data, key);
    let file : Types.StoredFile = {
      id = fileId;
      bucketId = bucket.id;
      path = path;
      size = fileSize;
      contentType = normalized;
      checksum = sealed.fingerprint;
      createdAt = Time.now();
    };

    BucketRepo.saveFile(service.store, file, sealed.ciphertext);
    BucketRepo.updateUsage(service.store, service.names, bucket.id, newUsed);
    #ok(fileId)
  };

  public func downloadFile(
    service: BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
  ) : Types.ApiResult<Blob> {
    switch (loadPublicFile(service, bucketId, path, ?caller)) {
      case (#err(e)) { #err(e) };
      case (#ok({ contentType = _; data })) { #ok(data) };
    }
  };

  // Anonymous browser GET — #Public buckets only.
  public func servePublicFile(
    service: BucketService,
    bucketId: Types.BucketId,
    path: Text,
  ) : Types.ApiResult<{ contentType: Text; data: Blob }> {
    loadPublicFile(service, bucketId, path, null)
  };

  public func servePublicFileChunk(
    service: BucketService,
    bucketId: Types.BucketId,
    path: Text,
    offset: Nat,
    limit: Nat,
  ) : Types.ApiResult<{ contentType: Text; chunk: Blob; totalSize: Nat }> {
    switch (loadPublicFileChunk(service, bucketId, path, offset, limit, null)) {
      case (#err(e)) { #err(e) };
      case (#ok(result)) { #ok(result) };
    }
  };

  private func loadPublicFileChunk(
    service: BucketService,
    bucketId: Types.BucketId,
    path: Text,
    offset: Nat,
    limit: Nat,
    caller: ?Principal,
  ) : Types.ApiResult<{ contentType: Text; chunk: Blob; totalSize: Nat }> {
    switch (validatePath(path)) {
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
        if (not canRead(bucket, who)) {
          return #err("Access denied");
        };
      };
    };

    let file = switch (BucketRepo.getFileByPath(service.store, bucketId, path)) {
      case (null) { return #err("File not found") };
      case (?f) f;
    };

    switch (BucketRepo.getFileData(service.store, file.id)) {
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

  private func loadPublicFile(
    service: BucketService,
    bucketId: Types.BucketId,
    path: Text,
    caller: ?Principal,
  ) : Types.ApiResult<{ contentType: Text; data: Blob }> {
    switch (validatePath(path)) {
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
        if (not canRead(bucket, who)) {
          return #err("Access denied");
        };
      };
    };

    let file = switch (BucketRepo.getFileByPath(service.store, bucketId, path)) {
      case (null) { return #err("File not found") };
      case (?f) f;
    };

    switch (BucketRepo.getFileData(service.store, file.id)) {
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

  private func decryptStoredFile(stored: Blob, key: [Nat8], checksum: Text) : ?Blob {
    if (BucketCrypto.isFastFingerprint(checksum)) {
      BucketCrypto.open(stored, key, checksum)
    } else {
      // Files uploaded before the fast fingerprint change used full SHA256.
      let data = BucketCrypto.decrypt(stored, key);
      let calculated = Sha256.toHex(Blob.toArray(Sha256.sha256Blob(data)));
      if (calculated != checksum) null else ?data
    }
  };

  private func blobSlice(data: Blob, start: Nat, end: Nat) : Blob {
    let bytes = Blob.toArray(data);
    let len = Nat.sub(end, start);
    Blob.fromArray(Array.tabulate<Nat8>(len, func(i) { bytes[start + i] }))
  };

  public func getPublicFileUrl(
    service: BucketService,
    bucketId: Types.BucketId,
    path: Text,
  ) : Types.ApiResult<Text> {
    switch (validatePath(path)) {
      case (?err) { return #err(err) };
      case (null) {};
    };

    let bucket = switch (requireBucket(service, bucketId)) {
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
    service: BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    path: Text,
    apiKey: ?Text,
  ) : async Types.ApiResult<()> {
    let auth = switch (resolveWriteAuth(service, caller, bucketId, apiKey, #delete)) {
      case (#err(e)) { return #err(e) };
      case (#ok(a)) a;
    };

    if (not RateLimitService.allow(service.uploadLimits, auth.ratePrincipal, Config.RATE_BUCKET_UPLOAD, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_BUCKET_UPLOAD));
    };

    let bucket = switch (requireBucket(service, bucketId)) {
      case (#err(e)) { return #err(e) };
      case (#ok(b)) b;
    };

    if (bucket.owner != auth.owner) {
      return #err("Permission denied");
    };
    if (not canWrite(bucket)) {
      return #err("Bucket expired — renew to enable deletes");
    };

    let file = switch (BucketRepo.getFileByPath(service.store, bucket.id, path)) {
      case (null) { return #err("File not found") };
      case (?f) f;
    };

    switch (BucketRepo.removeFile(service.store, file.id)) {
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
    service: BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    page: Nat,
    pageSize: Nat,
  ) : Types.ApiResult<Types.FileListPage> {
    let bucket = switch (requireBucket(service, bucketId)) {
      case (#err(e)) { return #err(e) };
      case (#ok(b)) b;
    };

    if (not canRead(bucket, caller)) {
      return #err("Access denied");
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
    #ok(paginateFiles(mapped, page, pageSize))
  };

  private func paginateFiles(
    files: [Types.FilePublic],
    page: Nat,
    pageSize: Nat,
  ) : Types.FileListPage {
    let total = files.size();
    let limit = if (pageSize == 0) {
      Config.BUCKET_FILE_PAGE_SIZE
    } else if (pageSize > Config.MAX_PAGE_SIZE) {
      Config.MAX_PAGE_SIZE
    } else {
      pageSize
    };
    let offset = page * limit;
    if (offset >= total) {
      { items = []; total; page; pageSize = limit }
    } else {
      let end = if (offset + limit > total) { total } else { offset + limit };
      let slice = Array.tabulate<Types.FilePublic>(end - offset, func(i) { files[offset + i] });
      { items = slice; total; page; pageSize = limit }
    }
  };

  public func renewBucket(
    service: BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
  ) : async Types.ApiResult<Types.BucketRenewResult> {
    if (not RateLimitService.allow(service.renewLimits, caller, Config.RATE_BUCKET_RENEW, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_BUCKET_RENEW));
    };

    let bucket = switch (requireBucket(service, bucketId)) {
      case (#err(e)) { return #err(e) };
      case (#ok(b)) b;
    };

    if (bucket.owner != caller) {
      return #err("Permission denied");
    };

    let price = BillingService.calculatePrice(bucket.capacity);
    let destination = AccountHelper.defaultAccount(Principal.fromText(Config.TREASURY));
    let memo = ?Memo.bucketRenew(bucket.name);

    switch (
      await TransferService.transferByAccountInternal(
        service.transfers,
        caller,
        Config.ICP_LEDGER_CANISTER_ID,
        destination,
        price,
        memo,
      )
    ) {
      case (#err(e)) { return #err(e) };
      case (#ok(_)) {};
    };

    let now = Time.now();
    let newExpires = nextExpiresAt(now, bucket.expiresAt);
    bucket.expiresAt := newExpires;
    bucket.status := #ACTIVE;
    BucketRepo.save(service.store, service.names, bucket);
    #ok({
      bucketId = bucket.id;
      priceE8s = price;
      expiresAt = newExpires;
      status = #ACTIVE;
    })
  };

  private func buildStats(store: BucketStorage.BucketStore, bucket: Types.Bucket) : Types.BucketStats {
    let now = Time.now();
    let fileCount = BucketRepo.countFilesByBucket(store, bucket.id);
    let daysLeft = daysRemaining(bucket.expiresAt, now);
    let publicBase = switch (bucket.visibility) {
      case (#Public) BucketUrls.publicBase(Config.BACKEND_CANISTER_ID, bucket.name);
      case (#Private) null;
    };
    {
      id = bucket.id;
      name = bucket.name;
      capacity = bucket.capacity;
      storageUsed = bucket.storageUsed;
      usagePercent = usagePercent(bucket.storageUsed, bucket.capacity);
      fileCount = fileCount;
      visibility = bucket.visibility;
      status = bucket.status;
      expiresAt = bucket.expiresAt;
      daysRemaining = daysLeft;
      isExpiringSoon = daysLeft <= Config.BUCKET_EXPIRING_SOON_DAYS;
      renewPriceE8s = BillingService.calculatePrice(bucket.capacity);
      periodDays = Config.BUCKET_PERIOD_DAYS;
      publicBaseUrl = publicBase;
    }
  };

  private func nextExpiresAt(now: Int, currentExpiresAt: Int) : Int {
    let base = if (currentExpiresAt > now) { currentExpiresAt } else { now };
    base + Config.BUCKET_PERIOD_NS
  };

  private func daysRemaining(expiresAt: Int, now: Int) : Nat {
    if (expiresAt <= now) {
      0
    } else {
      let ns = expiresAt - now;
      Int.abs(ns / 86_400_000_000_000)
    }
  };

  private func usagePercent(used: Nat, capacity: Nat) : Nat {
    if (capacity == 0) { 0 } else { used * 100 / capacity }
  };

  private func canRead(bucket: Types.Bucket, caller: Principal) : Bool {
    switch (bucket.visibility) {
      case (#Public) true;
      case (#Private) bucket.owner == caller;
    }
  };

  private func canWrite(bucket: Types.Bucket) : Bool {
    markExpiredIfNeeded(bucket);
    bucket.status == #ACTIVE and Time.now() < bucket.expiresAt
  };

  private func markExpiredIfNeeded(bucket: Types.Bucket) {
    if (Time.now() >= bucket.expiresAt and bucket.status == #ACTIVE) {
      bucket.status := #EXPIRED;
    };
  };

  private func refreshBucketStatus(
    store: BucketStorage.BucketStore,
    names: BucketStorage.NameIndex,
    bucket: Types.Bucket,
  ) {
    let before = bucket.status;
    markExpiredIfNeeded(bucket);
    if (before != bucket.status) {
      BucketRepo.save(store, names, bucket);
    };
  };

  private func validateBucketName(name: Text) : ?Text {
    if (name.size() < 3) return ?("Bucket name must be at least 3 characters");
    if (name.size() > 32) return ?("Bucket name must be at most 32 characters");
    for (c in name.chars()) {
      let ok = (c >= 'a' and c <= 'z')
        or (c >= '0' and c <= '9')
        or c == '-';
      if (not ok) return ?("Bucket name may only contain lowercase letters, digits, and hyphens");
    };
    null
  };

  public func isStoredEncrypted(store: BucketStorage.BucketStore, fileId: Types.FileId, plaintext: Blob) : Bool {
    switch (BucketRepo.getFileData(store, fileId)) {
      case (null) true;
      case (?stored) stored != plaintext;
    }
  };

  public func createApiKey(
    service: BucketService,
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
      service.nextId,
      caller,
      bucketId,
      name,
      permissions,
    )
  };

  private type WriteAction = { #write; #delete };

  private type WriteAuth = {
    owner: Principal;
    ratePrincipal: Principal;
  };

  private func resolveWriteAuth(
    service: BucketService,
    caller: Principal,
    bucketSegment: Types.BucketId,
    apiKey: ?Text,
    action: WriteAction,
  ) : { #err: Text; #ok: WriteAuth } {
    let resolvedId = switch (BucketRepo.resolveBucketId(service.store, service.names, bucketSegment)) {
      case (null) { return #err("Bucket not found") };
      case (?id) id;
    };
    switch (apiKey) {
      case (null) {
        #ok({ owner = caller; ratePrincipal = caller })
      };
      case (?secret) {
        switch (ApiKeyService.validate(service.store, secret)) {
          case (#err(e)) { #err(e) };
          case (#ok(key)) {
            if (key.bucketId != resolvedId) {
              return #err("API key not valid for this bucket");
            };
            switch (action) {
              case (#write) {
                if (not key.permissions.write) {
                  return #err("API key lacks write permission");
                };
              };
              case (#delete) {
                if (not key.permissions.delete) {
                  return #err("API key lacks delete permission");
                };
              };
            };
            #ok({ owner = key.owner; ratePrincipal = key.owner })
          };
        }
      };
    }
  };

  private func validatePath(path: Text) : ?Text {
    if (path.size() == 0) return ?("Path is required");
    if (not Text.startsWith(path, #text "/")) return ?("Path must start with /");
    if (Text.contains(path, #text "..")) return ?("Path may not contain ..");
    null
  };
};
