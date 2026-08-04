import Types "../../types";
import DepositService "../../services/DepositService";
import MiddlewareAuth "../../middleware/Auth";

mixin (deposit: DepositService.DepositService, mwConfig: MiddlewareAuth.Config) {
  public shared query ({ caller }) func getDepositAddress() : async Types.ICRC1Account {
    DepositService.getDepositAddress(deposit, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };

  public shared query ({ caller }) func getDepositAccountIdentifier() : async Text {
    DepositService.getDepositAccountIdentifier(deposit, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };

  public shared ({ caller }) func syncDeposits(ledgerId: Text) : async Types.ApiResult<Types.TransactionPublic> {
    await DepositService.syncDeposits(deposit, MiddlewareAuth.effectiveCaller(mwConfig, caller), ledgerId);
  };
};
