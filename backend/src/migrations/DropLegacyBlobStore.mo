import BlobStore "../blob/BlobStore";

// APPLIED on mainnet 2026-08 — do NOT re-wire.
// Dropped the drained legacyBlobStore stable map after blob bytes moved to
// icp_blob_store (deploy hash 0x533c999a…).
module {
  public func migration(_old: { legacyBlobStore: BlobStore.Store }) : {} {
    {};
  };
};
