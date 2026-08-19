import Types "../../types";
import SwapService "../../services/SwapService";
import MiddlewareAuth "../../middleware/Auth";

mixin (swap: SwapService.SwapService, mwConfig: MiddlewareAuth.Config) {
  public shared func getSwapQuote(tokenIn: Text, tokenOut: Text, amountIn: Nat) : async Types.ApiResult<Types.SwapQuoteResult> {
    await SwapService.quote(swap, tokenIn, tokenOut, amountIn);
  };

  public shared ({ caller }) func executeSwap(tokenIn: Text, tokenOut: Text, amountIn: Nat, amountOutMin: Nat) : async Types.ApiResult<Types.SwapResult> {
    await SwapService.swap(swap, MiddlewareAuth.effectiveCaller(mwConfig, caller), tokenIn, tokenOut, amountIn, amountOutMin);
  };

  public shared ({ caller }) func recoverFailedSwapInput(tokenIn: Text, tokenOut: Text, amountIn: Nat) : async Types.ApiResult<Nat> {
    await SwapService.recoverFailedSwapInput(swap, MiddlewareAuth.effectiveCaller(mwConfig, caller), tokenIn, tokenOut, amountIn);
  };

  public shared ({ caller }) func adminReleaseStuckSwapLeg(user: Principal, tokenIn: Text, amountIn: Nat) : async Types.ApiResult<Nat> {
    await SwapService.adminReleaseStuckSwapLeg(swap, caller, user, tokenIn, amountIn);
  };

  // Returns pending swaps count for admin visibility. Free query.
  public shared query func getPendingSwapCount() : async Nat {
    SwapService.getPendingCount(swap);
  };

  // Manual recovery: retry a single pending swap. Update call (costs cycles).
  public shared ({ caller }) func recoverPendingSwap(txId: Text) : async Types.ApiResult<Text> {
    await SwapService.retryOne(swap, txId);
  };
};
