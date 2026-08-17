import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Types "../types";

module {
  // A swap that moved tokenIn off the user's subaccount but did not finish.
  // Recovery is only allowed while this row exists for the same caller + pair.
  public type FailedEscrow = {
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

  public type EscrowMap = Map.Map<Text, FailedEscrow>;

  public func escrowKey(caller: Principal, tokenIn: Text, amountIn: Nat): Text {
    Principal.toText(caller) # "/" # tokenIn # "/" # Nat.toText(amountIn);
  };

  public func createEscrowMap(): EscrowMap {
    Map.empty<Text, FailedEscrow>();
  };

  public func putEscrow(escrows: EscrowMap, escrow: FailedEscrow): Text {
    let key = escrowKey(escrow.caller, escrow.tokenIn, escrow.amountIn);
    escrows.add(key, escrow);
    key;
  };

  public func getEscrow(escrows: EscrowMap, caller: Principal, tokenIn: Text, amountIn: Nat): ?FailedEscrow {
    escrows.get(escrowKey(caller, tokenIn, amountIn));
  };

  public func removeEscrow(escrows: EscrowMap, caller: Principal, tokenIn: Text, amountIn: Nat) {
    escrows.remove(escrowKey(caller, tokenIn, amountIn));
  };

  public func hasOpenEscrow(escrows: EscrowMap, caller: Principal, tokenIn: Text, amountIn: Nat): Bool {
    switch (escrows.get(escrowKey(caller, tokenIn, amountIn))) {
      case (?e) { e.refundDue > 0 or e.poolDeposit > 0 };
      case (null) { false };
    };
  };
  public type PendingStage = {
    #awaitingPoolWithdraw;
    #awaitingUserTransfer;
  };

  public type PendingSwap = {
    id:          Types.TxId;
    caller:      Principal;
    poolId:      Text;
    tokenOut:    Text;
    amountOut:   Nat;
    tokenOutFee: Nat;
    var stage:   PendingStage;
    var retries: Nat;
    createdAt:   Int;
    var lastAttempt: Int;
  };

  public type PendingMap = Map.Map<Types.TxId, PendingSwap>;

  public func getAllEscrows(escrows: EscrowMap): [FailedEscrow] {
    let out = List.empty<FailedEscrow>();
    for ((_, e) in escrows.entries()) { out.add(e) };
    List.toArray(out);
  };

  public func createPendingMap(): PendingMap {
    Map.empty<Types.TxId, PendingSwap>()
  };

  public func add(pending: PendingMap, swap: PendingSwap) {
    pending.add(swap.id, swap);
  };

  public func remove(pending: PendingMap, id: Types.TxId) {
    pending.remove(id);
  };

  public func get(pending: PendingMap, id: Types.TxId): ?PendingSwap {
    pending.get(id)
  };

  public func getAll(pending: PendingMap): [PendingSwap] {
    let out = List.empty<PendingSwap>();
    for ((_, swap) in pending.entries()) { out.add(swap) };
    List.toArray(out)
  };
};
