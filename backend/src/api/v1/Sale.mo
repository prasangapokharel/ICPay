import Principal "mo:core/Principal";
import Types "../../types";
import SaleService "../../services/SaleService";
import MiddlewareAuth "../../middleware/Auth";

mixin (sale: SaleService.SaleService, mwConfig: MiddlewareAuth.Config) {
  public shared query func getIcpayRate() : async Nat {
    SaleService.rate();
  };

  public shared func getIcpaySale() : async SaleService.Quote {
    await SaleService.quote(sale);
  };

  public shared ({ caller }) func buyIcpay(icpAmount: Nat, recipient: ?Principal)
    : async Types.ApiResult<SaleService.Purchase> {
    await SaleService.buy(
      sale,
      MiddlewareAuth.effectiveCaller(mwConfig, caller),
      icpAmount,
      recipient,
    );
  };

  // Controller-only. Moves ICPAY sent to this canister's default ICRC account
  // (no subaccount) to the treasury. Cannot reach tokens on other owners such
  // as the ICPAY ledger canister itself -- those accounts are not spendable here.
  public shared ({ caller }) func sweepStrayIcpay() : async Types.ApiResult<Nat64> {
    if (not Principal.isController(MiddlewareAuth.effectiveCaller(mwConfig, caller))) {
      return #err("Not authorized");
    };
    await SaleService.sweepStrayIcpay(sale);
  };
};
