import Types "../../types";
import LedgerTypes "../../ledger/Types";
import TransferService "../../services/TransferService";
import MiddlewareAuth "../../middleware/Auth";

mixin (transfer: TransferService.TransferService, mwConfig: MiddlewareAuth.Config) {
  public shared ({ caller }) func transferByUsername(ledgerId: Text, username: Text, amount: Nat, memo: ?Text) : async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    await TransferService.transferByUsername(transfer, MiddlewareAuth.effectiveCaller(mwConfig, caller), ledgerId, username, amount, memo);
  };

  public shared ({ caller }) func transferByPrincipal(ledgerId: Text, to: Principal, amount: Nat, memo: ?Text) : async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    await TransferService.transferByPrincipal(transfer, MiddlewareAuth.effectiveCaller(mwConfig, caller), ledgerId, to, amount, memo);
  };

  public shared ({ caller }) func transferByAccount(ledgerId: Text, to: LedgerTypes.Account, amount: Nat, memo: ?Text) : async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    await TransferService.transferByAccount(transfer, MiddlewareAuth.effectiveCaller(mwConfig, caller), ledgerId, to, amount, memo);
  };

  // No ledgerId: account identifiers are an ICP-ledger concept, so the service
  // pins this path rather than accepting a token it could not honour.
  public shared ({ caller }) func transferByAccountId(accountId: Text, amount: Nat, memo: ?Text) : async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    await TransferService.transferByAccountId(transfer, MiddlewareAuth.effectiveCaller(mwConfig, caller), accountId, amount, memo);
  };
};
