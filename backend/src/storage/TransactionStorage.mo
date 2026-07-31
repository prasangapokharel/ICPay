import List "mo:core/List";
import Types "../types";

module {
  public type TxList = List.List<Types.Transaction>;

  public func createTxList(): TxList { List.empty<Types.Transaction>() };
};
