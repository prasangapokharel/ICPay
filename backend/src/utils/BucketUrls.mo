import Text "mo:core/Text";
import Config "../config/Config";

module {
  // Per-canister raw HTTP host — the only format that reliably serves http_request:
  //   https://{canisterId}.raw.icp0.io/cloud/{bucketName}{path}
  public func rawHost(canisterId: Text) : Text {
    "https://" # canisterId # ".raw.icp0.io"
  };

  public func backendEndpoint(canisterId: Text) : Text {
    rawHost(canisterId) # "/"
  };

  // bucketSlug is the public bucket name (e.g. my-assets), not the internal id.
  public func bucketBase(_canisterId: Text, bucketSlug: Text) : Text {
    switch (Config.CLOUD_CDN_BASE) {
      case (?base) base # "/" # bucketSlug;
      case (null) rawHost(_canisterId) # "/cloud/" # bucketSlug;
    }
  };

  public func fileUrl(canisterId: Text, bucketSlug: Text, path: Text) : Text {
    bucketBase(canisterId, bucketSlug) # path
  };

  public func publicBase(canisterId: Text, bucketSlug: Text) : ?Text {
    ?bucketBase(canisterId, bucketSlug)
  };

  public func publicFileUrl(canisterId: Text, bucketSlug: Text, path: Text) : ?Text {
    ?fileUrl(canisterId, bucketSlug, path)
  };
};
