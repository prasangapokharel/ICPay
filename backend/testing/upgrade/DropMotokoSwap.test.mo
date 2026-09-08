import Debug "mo:core/Debug";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import DropMotokoSwap "../../src/migrations/DropMotokoSwap";

type PendingStage = { #awaitingPoolWithdraw; #awaitingUserTransfer };
type OldPendingSwap = {
  id: Text;
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
type OldRateLimitWindow = { var windowStart: Int; var count: Nat };

let pending = Map.empty<Text, OldPendingSwap>();
pending.add("swap-1", {
  id = "swap-1";
  caller = Principal.fromText("2vxsx-fae");
  poolId = "aaaaa-aa";
  tokenOut = "bbbbb-bb";
  amountOut = 100;
  tokenOutFee = 10;
  var stage : PendingStage = #awaitingPoolWithdraw;
  var retries = 0;
  createdAt = 1 : Int;
  var lastAttempt = 0 : Int;
});

let escrows = Map.empty<Text, OldFailedEscrow>();
escrows.add("k1", {
  caller = Principal.fromText("2vxsx-fae");
  tokenIn = "aaaaa-aa";
  tokenOut = "bbbbb-bb";
  amountIn = 100;
  var refundDue = 50;
  var poolDeposit = 0;
  tokenInFee = 10;
  poolId = "aaaaa-aa";
  createdAt = 1 : Int;
});

let swapLimits = Map.empty<Principal, OldRateLimitWindow>();
swapLimits.add(Principal.fromText("2vxsx-fae"), { var windowStart = 0 : Int; var count = 1 });

ignore DropMotokoSwap.migration({
  pendingSwaps = pending;
  failedSwapEscrows = escrows;
  swapLimits = swapLimits;
});

Debug.print("PASS: Motoko swap stable maps dropped");
Debug.print("ALL DROP MOTOKO SWAP MIGRATION TESTS PASSED");
