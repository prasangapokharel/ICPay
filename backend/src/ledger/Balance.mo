import Types "Types";
import LedgerClient "LedgerClient";

module {
  public func getBalance(ledger: LedgerClient.ICRC1Service, account: Types.Account): async Nat {
    await ledger.icrc1_balance_of(account);
  };
};
