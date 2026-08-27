import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Types "../../types";
import Config "../../config/Config";
import AccountHelper "../../ledger/Account";
import BillingService "../BillingService";
import TransferService "../TransferService";
import RateLimitService "../RateLimitService";
import UserRepo "../../repositories/UserRepository";
import BucketRepo "../../repositories/BucketRepository";
import Memo "../../utils/Memo";
import Context "Context";
import Auth "Auth";
import Limits "Limits";
import Stats "Stats";

module {
  public func resolveBucketId(service: Context.BucketService, segment: Text) : ?Types.BucketId {
    BucketRepo.resolveBucketId(service.store, service.names, segment)
  };

  public func getPrice(capacityGB: Nat) : Types.ApiResult<Nat> {
    switch (BillingService.capacityBytesFromGB(capacityGB)) {
      case (null) { #err("Invalid capacity — choose 1, 5, 10, 25, 50, 100, 250, or 500 GB") };
      case (?bytes) { #ok(BillingService.calculatePrice(bytes)) };
    }
  };

  public func createBucket(
    service: Context.BucketService,
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

    switch (Auth.validateBucketName(name)) {
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
      var visibility = visibility;
      var status = #ACTIVE;
      var expiresAt = now + Config.BUCKET_PERIOD_NS;
      createdAt = now;
    };
    BucketRepo.save(service.store, service.names, bucket);
    #ok(bucketId)
  };

  public func getBucket(
    service: Context.BucketService,
    caller: Principal,
    id: Types.BucketId,
  ) : Types.ApiResult<Types.BucketPublic> {
    switch (Auth.requireBucket(service, id)) {
      case (#err(e)) { #err(e) };
      case (#ok(bucket)) {
        if (not Auth.canRead(bucket, caller)) {
          return #err("Bucket not found");
        };
        Auth.refreshBucketStatus(service.store, service.names, bucket);
        #ok(BucketRepo.toPublic(bucket))
      };
    }
  };

  public func getBucketStats(
    service: Context.BucketService,
    caller: Principal,
    id: Types.BucketId,
  ) : Types.ApiResult<Types.BucketStats> {
    switch (Auth.requireBucket(service, id)) {
      case (#err(e)) { #err(e) };
      case (#ok(bucket)) {
        if (not Auth.canRead(bucket, caller)) {
          return #err("Bucket not found");
        };
        Auth.refreshBucketStatus(service.store, service.names, bucket);
        #ok(Stats.buildStats(service.store, bucket))
      };
    }
  };

  public func getRenewQuote(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
  ) : Types.ApiResult<Types.BucketRenewQuote> {
    switch (Auth.requireBucket(service, bucketId)) {
      case (#err(e)) { #err(e) };
      case (#ok(bucket)) {
        if (bucket.owner != caller) {
          return #err("Permission denied");
        };
        Auth.refreshBucketStatus(service.store, service.names, bucket);
        let now = Time.now();
        let price = BillingService.calculatePrice(bucket.capacity);
        #ok({
          bucketId = bucket.id;
          priceE8s = price;
          currentExpiresAt = bucket.expiresAt;
          newExpiresAt = Stats.nextExpiresAt(now, bucket.expiresAt);
          status = bucket.status;
        })
      };
    }
  };

  public func listBuckets(service: Context.BucketService, caller: Principal) : [Types.BucketPublic] {
    let buckets = BucketRepo.getByOwner(service.store, caller);
    Array.map<Types.Bucket, Types.BucketPublic>(buckets, func(b) {
      Auth.refreshBucketStatus(service.store, service.names, b);
      BucketRepo.toPublic(b)
    })
  };

  public func renewBucket(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
  ) : async Types.ApiResult<Types.BucketRenewResult> {
    if (not RateLimitService.allow(service.renewLimits, caller, Config.RATE_BUCKET_RENEW, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_BUCKET_RENEW));
    };

    let bucket = switch (Auth.requireBucket(service, bucketId)) {
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
    let newExpires = Stats.nextExpiresAt(now, bucket.expiresAt);
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

  public func updateBucket(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
    name: ?Text,
    visibility: ?Types.BucketVisibility,
  ) : Types.ApiResult<Types.BucketPublic> {
    switch (Limits.allowManage(service, caller)) {
      case (?msg) { return #err(msg) };
      case (null) {};
    };
    switch (name, visibility) {
      case (null, null) { return #err("Nothing to update") };
      case (_, _) {};
    };
    switch (Auth.requireBucket(service, bucketId)) {
      case (#err(e)) { return #err(e) };
      case (#ok(bucket)) {
        if (bucket.owner != caller) {
          return #err("Permission denied");
        };
        switch (name) {
          case (null) {};
          case (?n) {
            switch (Auth.validateBucketName(n)) {
              case (?err) { return #err(err) };
              case (null) {};
            };
            if (n != bucket.name and BucketRepo.bucketNameTaken(service.names, n)) {
              return #err("Bucket name already taken");
            };
            if (n != bucket.name) {
              service.names.remove(bucket.name);
              bucket.name := n;
            };
          };
        };
        switch (visibility) {
          case (null) {};
          case (?v) { bucket.visibility := v };
        };
        BucketRepo.save(service.store, service.names, bucket);
        #ok(BucketRepo.toPublic(bucket))
      };
    }
  };

  public func deleteBucket(
    service: Context.BucketService,
    caller: Principal,
    bucketId: Types.BucketId,
  ) : async Types.ApiResult<()> {
    switch (Limits.allowManage(service, caller)) {
      case (?msg) { return #err(msg) };
      case (null) {};
    };
    switch (Auth.requireBucket(service, bucketId)) {
      case (#err(e)) { return #err(e) };
      case (#ok(bucket)) {
        if (bucket.owner != caller) {
          return #err("Permission denied");
        };
        let fileCount = BucketRepo.countFilesByBucket(service.store, bucket.id);
        if (fileCount > 0) {
          return #err("Bucket is not empty — delete all files first");
        };
        await BucketRepo.purgeBucket(service.store, service.blobs, service.names, bucket.id);
        #ok()
      };
    }
  };
};
