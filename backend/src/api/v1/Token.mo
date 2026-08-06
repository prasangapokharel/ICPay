import Principal "mo:core/Principal";
import Types "../../types";
import Config "../../config/Config";
import TokenService "../../services/TokenService";
import TokenValidator "../../validators/TokenValidator";
import MiddlewareAuth "../../middleware/Auth";

mixin (tokens: TokenService.TokenService, mwConfig: MiddlewareAuth.Config) {
  // The only update call a creator makes. Everything below it is a query, so the
  // form can validate as the user types at no cost.
  public shared ({ caller }) func launchToken(params: TokenValidator.LaunchParams) : async Types.ApiResult<Types.TokenPublic> {
    await TokenService.launch(tokens, MiddlewareAuth.effectiveCaller(mwConfig, caller), params);
  };

  public shared query func getToken(canisterId: Text) : async ?Types.TokenPublic {
    TokenService.getToken(tokens, canisterId);
  };

  public shared query func getTokenById(id: Types.TokenId) : async ?Types.TokenPublic {
    TokenService.getById(tokens, id);
  };

  public shared query ({ caller }) func getMyTokens(limit: Nat, offset: Nat) : async [Types.TokenPublic] {
    TokenService.listByUser(tokens, MiddlewareAuth.effectiveCaller(mwConfig, caller), limit, offset);
  };

  public shared query func listTokens(limit: Nat, offset: Nat) : async [Types.TokenPublic] {
    TokenService.listActive(tokens, limit, offset);
  };

  public shared query func isSymbolAvailable(symbol: Text) : async Bool {
    TokenService.isSymbolAvailable(tokens, symbol);
  };

  public shared query func getLaunchFee() : async { total: Nat; cycles: Nat } {
    { total = Config.LAUNCH_FEE; cycles = Config.LAUNCH_CYCLE_ALLOCATION };
  };

  // Controller-only from here down. Uploading the wasm decides what code every
  // future token runs, and sweeping moves real ICP -- both are authorization
  // decisions, not conveniences.
  public shared ({ caller }) func uploadTokenWasmChunk(chunk: Blob) : async Types.ApiResult<Blob> {
    if (not Principal.isController(MiddlewareAuth.effectiveCaller(mwConfig, caller))) {
      return #err("Not authorized");
    };
    #ok(await TokenService.uploadWasmChunk(tokens, chunk));
  };

  public shared ({ caller }) func sealTokenWasm(moduleHash: Blob) : async Types.ApiResult<()> {
    if (not Principal.isController(MiddlewareAuth.effectiveCaller(mwConfig, caller))) {
      return #err("Not authorized");
    };
    TokenService.sealWasm(tokens, moduleHash);
  };

  public shared ({ caller }) func resetTokenWasm() : async Types.ApiResult<()> {
    if (not Principal.isController(MiddlewareAuth.effectiveCaller(mwConfig, caller))) {
      return #err("Not authorized");
    };
    await TokenService.resetWasm(tokens);
    #ok(());
  };

  public shared query func isTokenLaunchReady() : async Bool {
    TokenService.isLaunchReady(tokens);
  };

  public shared ({ caller }) func sweepTokenRevenue() : async Types.ApiResult<Nat64> {
    if (not Principal.isController(MiddlewareAuth.effectiveCaller(mwConfig, caller))) {
      return #err("Not authorized");
    };
    await TokenService.sweepRevenue(tokens);
  };

  public shared ({ caller }) func topUpToken(canisterId: Text, amount: Nat) : async Types.ApiResult<Nat> {
    if (not Principal.isController(MiddlewareAuth.effectiveCaller(mwConfig, caller))) {
      return #err("Not authorized");
    };
    await TokenService.topUpToken(tokens, canisterId, amount);
  };

  public shared ({ caller }) func reserveTokenSymbol(symbol: Text) : async Types.ApiResult<()> {
    if (not Principal.isController(MiddlewareAuth.effectiveCaller(mwConfig, caller))) {
      return #err("Not authorized");
    };
    TokenService.seedReservedSymbols(tokens, [symbol]);
    #ok(());
  };
};
