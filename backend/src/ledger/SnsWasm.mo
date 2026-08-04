module {
  // The NNS SNS-W canister. Only list_deployed_snses is declared -- the real
  // interface is large and the rest of it is deployment machinery this canister
  // has no business calling.
  public type DeployedSns = {
    root_canister_id: ?Principal;
    governance_canister_id: ?Principal;
    ledger_canister_id: ?Principal;
    swap_canister_id: ?Principal;
    index_canister_id: ?Principal;
  };

  public type ListDeployedSnsesResponse = {
    instances: [DeployedSns];
  };

  public type SnsWasmService = actor {
    list_deployed_snses: shared query {} -> async ListDeployedSnsesResponse;
  };
};
