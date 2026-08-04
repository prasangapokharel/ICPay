import Types "../../types";
import LedgerTypes "../../ledger/Types";
import WithdrawService "../../services/WithdrawService";
import MiddlewareAuth "../../middleware/Auth";

mixin (wdSvc: WithdrawService.WithdrawService, mwConfig: MiddlewareAuth.Config) {
  public shared ({ caller }) func withdraw(ledgerId: Text, amount: Nat, to: LedgerTypes.Account) : async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }> {
    await WithdrawService.withdraw(wdSvc, MiddlewareAuth.effectiveCaller(mwConfig, caller), ledgerId, amount, to);
  };
};
