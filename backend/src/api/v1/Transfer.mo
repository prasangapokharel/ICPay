import Types "../../types";
import LedgerTypes "../../ledger/Types";
import TransferService "../../services/TransferService";
import MiddlewareAuth "../../middleware/Auth";

mixin (transfer: TransferService.TransferService, mwConfig: MiddlewareAuth.Config) {
  public shared ({ caller }) func transferByUsername(username: Text, amount: Nat, memo: ?Text) : async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    await TransferService.transferByUsername(transfer, MiddlewareAuth.effectiveCaller(mwConfig, caller), username, amount, memo);
  };

  public shared ({ caller }) func transferByPrincipal(to: Principal, amount: Nat, memo: ?Text) : async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    await TransferService.transferByPrincipal(transfer, MiddlewareAuth.effectiveCaller(mwConfig, caller), to, amount, memo);
  };

  public shared ({ caller }) func transferByAccount(to: LedgerTypes.Account, amount: Nat, memo: ?Text) : async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    await TransferService.transferByAccount(transfer, MiddlewareAuth.effectiveCaller(mwConfig, caller), to, amount, memo);
  };

  public shared ({ caller }) func transferByAccountId(accountId: Text, amount: Nat, memo: ?Text) : async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    await TransferService.transferByAccountId(transfer, MiddlewareAuth.effectiveCaller(mwConfig, caller), accountId, amount, memo);
  };
};
