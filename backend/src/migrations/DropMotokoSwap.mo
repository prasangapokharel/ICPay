import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";

// APPLIED on mainnet 2026-08 — do NOT re-wire into main.mo.
// Dropped Motoko swap stable maps (pendingSwaps, failedSwapEscrows, swapLimits).
// Swap execution lives on icpay_trade (Rust). Kept for testing/upgrade/DropMotokoSwap.test.mo.
module {
  type TxId = Text;

  type PendingStage = {
    #awaitingPoolWithdraw;
    #awaitingUserTransfer;
  };

  type OldPendingSwap = {
    id: TxId;
    caller: Principal;
    poolId: Text;
    tokenOut: Text;
    amountOut: Nat;
    tokenOutFee: Nat;
    var stage: PendingStage;
    var retries: Nat;
    createdAt: Int;
    var lastAttempt: Int;
  };

  type OldPendingMap = Map.Map<TxId, OldPendingSwap>;

  type OldFailedEscrow = {
    caller: Principal;
    tokenIn: Text;
    tokenOut: Text;
    amountIn: Nat;
    var refundDue: Nat;
    var poolDeposit: Nat;
    tokenInFee: Nat;
    poolId: Text;
    createdAt: Int;
  };

  type OldEscrowMap = Map.Map<Text, OldFailedEscrow>;

  type OldRateLimitWindow = { var windowStart: Int; var count: Nat };
  type OldRateLimitMap = Map.Map<Principal, OldRateLimitWindow>;

  public func migration(_old: {
    pendingSwaps: OldPendingMap;
    failedSwapEscrows: OldEscrowMap;
    swapLimits: OldRateLimitMap;
  }) : {} {
    {};
  };
};
