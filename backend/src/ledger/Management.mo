module {
  public type CanisterId = { canister_id: Principal };

  public type ChunkHash = { hash: Blob };

  public type InstallChunkedCodeArgs = {
    mode: { #install; #reinstall; #upgrade };
    target_canister: Principal;
    // This canister. The wasm chunks live in our own chunk store, uploaded once
    // by a controller, so a launch installs by hash instead of re-sending bytes.
    store_canister: ?Principal;
    chunk_hashes_list: [ChunkHash];
    wasm_module_hash: Blob;
    arg: Blob;
    sender_canister_version: ?Nat64;
  };

  public type UpdateSettingsArgs = {
    canister_id: Principal;
    settings: {
      controllers: ?[Principal];
      compute_allocation: ?Nat;
      memory_allocation: ?Nat;
      freezing_threshold: ?Nat;
    };
  };

  // delete_canister and uninstall_code are deliberately absent. An interface that
  // does not declare them cannot be made to call them by a later bug, and a token
  // this canister launched must not be destroyable by us.
  public type ManagementService = actor {
    upload_chunk: shared { canister_id: Principal; chunk: Blob } -> async ChunkHash;
    stored_chunks: shared CanisterId -> async [ChunkHash];
    clear_chunk_store: shared CanisterId -> async ();
    install_chunked_code: shared InstallChunkedCodeArgs -> async ();
    update_settings: shared UpdateSettingsArgs -> async ();
  };
};
