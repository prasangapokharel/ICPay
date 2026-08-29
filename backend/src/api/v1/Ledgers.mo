import Principal "mo:core/Principal";
import Types "../../types";
import LedgerService "../../services/LedgerService";
import TokenService "../../services/TokenService";
import MiddlewareAuth "../../middleware/Auth";

mixin (ledger: LedgerService.LedgerService, tokens: TokenService.TokenService, mwConfig: MiddlewareAuth.Config) {
  // Controller-only, matching AdminService: this grows the set of canisters the
  // custodian is willing to call, which is an authorization decision even though
  // the data comes from the NNS.
  public shared ({ caller }) func refreshLedgers() : async Types.ApiResult<Nat> {
    if (not Principal.isController(MiddlewareAuth.effectiveCaller(mwConfig, caller))) {
      return #err("Not authorized");
    };
    #ok(await LedgerService.refreshLedgers(ledger));
  };

  public shared query func isLedgerSupported(ledgerId: Text) : async Bool {
    TokenService.isCustodiedLedger(tokens, ledgerId);
  };
};
