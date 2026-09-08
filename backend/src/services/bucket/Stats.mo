import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Types "../../types";
import Config "../../config/Config";
import BillingService "../BillingService";
import BucketRepo "../../repositories/BucketRepository";
import BucketStorage "../../storage/BucketStorage";
import BucketUrls "../../utils/BucketUrls";
import Context "Context";
import Pagination "../../../pkg/pagination/pg";
import Duration "../../../pkg/time/duration";

module {
  public func getCycleStatus(service: Context.BucketService) : BillingService.CycleStatus {
    BillingService.getCycleStatus(BucketRepo.getTotalStorageUsed(service.store))
  };

  public func getCloudStats(service: Context.BucketService) : Types.BucketCloudStats {
    let storageUsed = BucketRepo.getTotalStorageUsed(service.store);
    let capacity = BucketRepo.getTotalCapacity(service.store);
    let utilization = Duration.percent(storageUsed, capacity);

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

  public func buildStats(store: BucketStorage.BucketStore, bucket: Types.Bucket) : Types.BucketStats {
    let now = Time.now();
    let fileCount = BucketRepo.countFilesByBucket(store, bucket.id);
    let daysLeft = Duration.daysRemaining(bucket.expiresAt, now);
    let publicBase = switch (bucket.visibility) {
      case (#Public) BucketUrls.publicBase(Config.BACKEND_CANISTER_ID, bucket.name);
      case (#Private) null;
    };
    {
      id = bucket.id;
      name = bucket.name;
      capacity = bucket.capacity;
      storageUsed = bucket.storageUsed;
      usagePercent = Duration.percent(bucket.storageUsed, bucket.capacity);
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

  public func nextExpiresAt(now: Int, currentExpiresAt: Int) : Int {
    Duration.extendFrom(now, currentExpiresAt, Config.BUCKET_PERIOD_NS)
  };

  public func paginateFiles(
    files: [Types.FilePublic],
    page: Nat,
    pageSize: Nat,
  ) : Types.FileListPage {
    let slice = Pagination.slice(files, page, pageSize, Config.BUCKET_FILE_PAGE_SIZE, Config.MAX_PAGE_SIZE);
    {
      items = slice.items;
      folders = [];
      total = slice.total;
      page = slice.page;
      pageSize = slice.pageSize;
    }
  };
};
