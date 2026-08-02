import List "mo:core/List";
import Map "mo:core/Map";
import Types "../types";

module {
  public type TxList = List.List<Types.Transaction>;

  // Per-user index over the same transaction objects held by TxList, so a user's
  // reads never walk other users' records. It holds references, not copies or
  // counts: status is mutated in place by tx.complete()/tx.fail() at eleven call
  // sites, and a derived counter would silently drift the first time a twelfth
  // is added.
  public type TxByUser = Map.Map<Types.UserId, TxList>;

  public func createTxList(): TxList { List.empty<Types.Transaction>() };
  public func createTxByUser(): TxByUser { Map.empty<Types.UserId, TxList>() };
};
