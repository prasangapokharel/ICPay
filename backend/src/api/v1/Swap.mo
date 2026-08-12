import Types "../../types";
import SwapService "../../services/SwapService";
import MiddlewareAuth "../../middleware/Auth";

mixin (swap: SwapService.SwapService, mwConfig: MiddlewareAuth.Config) {
  public shared ({ caller }) func getSwapQuote(tokenIn: Text, tokenOut: Text, amountIn: Nat) : async Types.ApiResult<Types.SwapQuoteResult> {
    await SwapService.quote(swap, tokenIn, tokenOut, amountIn);
  };

  public shared ({ caller }) func executeSwap(tokenIn: Text, tokenOut: Text, amountIn: Nat, amountOutMin: Nat) : async Types.ApiResult<Types.SwapResult> {
    await SwapService.swap(swap, MiddlewareAuth.effectiveCaller(mwConfig, caller), tokenIn, tokenOut, amountIn, amountOutMin);
  };

  // Returns pending swaps for admin visibility. PendingSwap has var fields
  // so it cannot be a shared return type; we project to a plain record instead.
  public shared query func getPendingSwapCount() : async Nat {
    SwapService.getPending(swap).size();
  };
};
