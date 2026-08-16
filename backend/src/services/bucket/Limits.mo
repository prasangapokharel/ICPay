import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Config "../../config/Config";
import RateLimitService "../RateLimitService";
import Context "Context";

module {
  public func allowManage(service: Context.BucketService, caller: Principal) : ?Text {
    if (not RateLimitService.allow(service.manageLimits, caller, Config.RATE_BUCKET_MANAGE, Time.now())) {
      ?RateLimitService.message(Config.RATE_BUCKET_MANAGE)
    } else {
      null
    }
  };

  public func allowUploadChunk(service: Context.BucketService, caller: Principal) : ?Text {
    if (not RateLimitService.allow(service.uploadLimits, caller, Config.RATE_BUCKET_UPLOAD, Time.now())) {
      ?RateLimitService.message(Config.RATE_BUCKET_UPLOAD)
    } else {
      null
    }
  };

  public func allowMutate(service: Context.BucketService, principal: Principal) : ?Text {
    if (not RateLimitService.allow(service.uploadLimits, principal, Config.RATE_BUCKET_MUTATE, Time.now())) {
      ?RateLimitService.message(Config.RATE_BUCKET_MUTATE)
    } else {
      null
    }
  };
};
