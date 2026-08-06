import Array "mo:core/Array";
import Time "mo:core/Time";
import Types "../types";
import Config "../config/Config";
import Management "../ledger/Management";

module {
  // Chunk hashes only -- the bytes live in the management canister's chunk store,
  // keyed by this canister's id. Re-uploading per launch would add a call per
  // chunk to every launch for a wasm that never changes.
  public type TokenWasmStore = {
    var chunkHashes: [Blob];
    var moduleHash: ?Blob;
    var uploadedAt: Int;
  };

  public func empty(): TokenWasmStore {
    { var chunkHashes = []; var moduleHash = null; var uploadedAt = 0 };
  };

  func mgmt(): Management.ManagementService { actor (Config.MANAGEMENT_CANISTER_ID) };

  public func uploadChunk(store: TokenWasmStore, self: Principal, chunk: Blob): async Blob {
    let h = await mgmt().upload_chunk({ canister_id = self; chunk });
    store.chunkHashes := Array.concat(store.chunkHashes, [h.hash]);
    // Any upload invalidates the seal: the module hash on record no longer
    // describes the chunks that would be installed.
    store.moduleHash := null;
    h.hash;
  };

  // Called once after the last chunk, with the hash of the audited wasm as
  // published. Until a module hash is sealed, launching is refused -- "we deploy
  // the audited wasm" is an unverified claim without it.
  public func seal(store: TokenWasmStore, expectedHash: Blob): Types.ApiResult<()> {
    if (store.chunkHashes.size() == 0) { return #err("No chunks uploaded") };
    store.moduleHash := ?expectedHash;
    store.uploadedAt := Time.now();
    #ok(());
  };

  // Drops our record and the management canister's copy together, so a re-upload
  // never appends to a half-replaced chunk list.
  public func reset(store: TokenWasmStore, self: Principal): async () {
    await mgmt().clear_chunk_store({ canister_id = self });
    store.chunkHashes := [];
    store.moduleHash := null;
    store.uploadedAt := 0;
  };

  // Reconciles our recorded hashes against what the management canister actually
  // holds. For a controller endpoint after an upgrade, never the launch path.
  public func storedChunks(self: Principal): async [Blob] {
    let chunks = await mgmt().stored_chunks({ canister_id = self });
    Array.map<Management.ChunkHash, Blob>(chunks, func c { c.hash });
  };

  public func isReady(store: TokenWasmStore): Bool {
    store.moduleHash != null and store.chunkHashes.size() > 0;
  };

  public func chunkHashList(store: TokenWasmStore): [Management.ChunkHash] {
    Array.map<Blob, Management.ChunkHash>(store.chunkHashes, func h { { hash = h } });
  };
};
