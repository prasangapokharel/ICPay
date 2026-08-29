import Types "../../types";
import DepositService "../../services/DepositService";
import TokenService "../../services/TokenService";
import MiddlewareAuth "../../middleware/Auth";

mixin (deposit: DepositService.DepositService, tokens: TokenService.TokenService, mwConfig: MiddlewareAuth.Config) {
  public shared query ({ caller }) func getDepositAddress() : async Types.ICRC1Account {
    DepositService.getDepositAddress(deposit, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };

  public shared query ({ caller }) func getDepositAccountIdentifier() : async Text {
    DepositService.getDepositAccountIdentifier(deposit, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };

  public shared ({ caller }) func syncDeposits(ledgerId: Text) : async Types.ApiResult<Types.TransactionPublic> {
    let effective = MiddlewareAuth.effectiveCaller(mwConfig, caller);
    let custodied = await TokenService.ensureCustodiedLedgerAsync(tokens, ledgerId);
    if (not custodied) {
      return #err("Unsupported token ledger: " # ledgerId);
    };
    await DepositService.syncDeposits(deposit, effective, ledgerId);
  };
};
