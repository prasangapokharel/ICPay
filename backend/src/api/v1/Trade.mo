import Types "../../types";
import TradeService "../../services/TradeService";
import MiddlewareAuth "../../middleware/Auth";

mixin (trade: TradeService.TradeService, mwConfig: MiddlewareAuth.Config) {
  public shared ({ caller }) func depositForTrade(ledgerId: Text, amount: Nat) : async Types.ApiResult<{ blockIndex: Nat64 }> {
    await TradeService.depositForTrade(trade, MiddlewareAuth.effectiveCaller(mwConfig, caller), ledgerId, amount);
  };

  public shared ({ caller }) func withdrawFromTrade(ledgerId: Text, amount: Nat) : async Types.ApiResult<{ blockIndex: Nat64 }> {
    await TradeService.withdrawFromTrade(trade, MiddlewareAuth.effectiveCaller(mwConfig, caller), ledgerId, amount);
  };
};
