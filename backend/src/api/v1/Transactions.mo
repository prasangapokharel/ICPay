import Types "../../types";
import TransactionService "../../services/TransactionService";
import MiddlewareAuth "../../middleware/Auth";

mixin (txs: TransactionService.TransactionService, mwConfig: MiddlewareAuth.Config) {
  public shared query ({ caller }) func getTransactions(page: Nat, pageSize: Nat) : async Types.ApiResult<{ items: [Types.TransactionPublic]; total: Nat; page: Nat; pageSize: Nat }> {
    TransactionService.list(txs, MiddlewareAuth.effectiveCaller(mwConfig, caller), page, pageSize);
  };

  public shared query ({ caller }) func getTransactionDetail(txId: Types.TxId) : async Types.ApiResult<Types.TransactionPublic> {
    TransactionService.getDetail(txs, MiddlewareAuth.effectiveCaller(mwConfig, caller), txId);
  };
};
