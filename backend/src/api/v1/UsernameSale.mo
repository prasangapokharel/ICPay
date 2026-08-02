import Types "../../types";
import UsernameSaleService "../../services/UsernameSaleService";
import MiddlewareAuth "../../middleware/Auth";

mixin (sales: UsernameSaleService.UsernameSaleService, mwConfig: MiddlewareAuth.Config) {
  public shared query func getUsernamePrice(name: Text) : async Nat {
    UsernameSaleService.priceOf(name);
  };

  public shared query func getUsernameTreasury() : async Principal {
    UsernameSaleService.treasury();
  };

  public shared ({ caller }) func purchaseUsername(name: Text) : async Types.ApiResult<UsernameSaleService.Purchase> {
    await UsernameSaleService.purchase(sales, MiddlewareAuth.effectiveCaller(mwConfig, caller), name);
  };
};
