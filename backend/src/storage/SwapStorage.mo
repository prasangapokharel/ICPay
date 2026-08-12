import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Types "../types";

module {
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
