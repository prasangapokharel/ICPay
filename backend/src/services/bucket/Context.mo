import Map "mo:core/Map";
import BlobStore "../../blob/BlobStore";
import RemoteBlobStore "../../blob/RemoteBlobStore";
import Types "../../types";
import TransferService "../TransferService";
import UserStorage "../../storage/UserStorage";
import BucketStorage "../../storage/BucketStorage";
import RateLimitStorage "../../storage/RateLimitStorage";

module {
  public type UploadSessionStore = {
    var map: Map.Map<Text, Types.FileUploadSession>;
  };

  public func createUploadSessionStore() : UploadSessionStore {
    { var map = Map.empty<Text, Types.FileUploadSession>() };
  };

  public type BucketService = {
    users: UserStorage.UserMap;
    store: BucketStorage.BucketStore;
    names: BucketStorage.NameIndex;
    blobs: BlobStore.Service;
    remoteBlobActor: ?RemoteBlobStore.Actor;
    transfers: TransferService.TransferService;
    nextId: () -> Text;
    createLimits: RateLimitStorage.RateLimitMap;
    uploadLimits: RateLimitStorage.RateLimitMap;
    renewLimits: RateLimitStorage.RateLimitMap;
    manageLimits: RateLimitStorage.RateLimitMap;
    apiKeyLimits: RateLimitStorage.RateLimitMap;
    uploadSessions: UploadSessionStore;
  };

  public func create(
    users: UserStorage.UserMap,
    store: BucketStorage.BucketStore,
    names: BucketStorage.NameIndex,
    blobs: BlobStore.Service,
    remoteBlobActor: ?RemoteBlobStore.Actor,
    transfers: TransferService.TransferService,
    nextId: () -> Text,
    createLimits: RateLimitStorage.RateLimitMap,
    uploadLimits: RateLimitStorage.RateLimitMap,
    renewLimits: RateLimitStorage.RateLimitMap,
    manageLimits: RateLimitStorage.RateLimitMap,
    apiKeyLimits: RateLimitStorage.RateLimitMap,
    uploadSessions: UploadSessionStore,
  ) : BucketService {
    {
      users;
      store;
      names;
      blobs;
      remoteBlobActor;
      transfers;
      nextId;
      createLimits;
      uploadLimits;
      renewLimits;
      manageLimits;
      apiKeyLimits;
      uploadSessions;
    }
  };
};
