import BlobStore "../../src/blob/BlobStore";

module {
  public func local() : BlobStore.Service {
    BlobStore.localService(BlobStore.emptyStore())
  };
};
