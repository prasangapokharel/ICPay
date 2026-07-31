import Config "../config/Config";
import LedgerTypes "../ledger/Types";
import LedgerClient "../ledger/LedgerClient";
import AccountHelper "../ledger/Account";
import Balance "../ledger/Balance";

module {
  public func create(custodian: Principal) : LedgerService {
    let icpLedger = actor(Config.ICP_LEDGER_CANISTER_ID) : LedgerClient.ICRC1Service;
    { icpLedger; custodian };
  };

  public type LedgerService = {
    icpLedger: LedgerClient.ICRC1Service;
    // The wallet canister's own principal — owner of every custodial deposit account.
    custodian: Principal;
  };

  public func depositAccount(service: LedgerService, user: Principal): LedgerTypes.Account {
    AccountHelper.custodialAccount(service.custodian, user);
  };

  public func getBalance(service: LedgerService, account: LedgerTypes.Account): async Nat {
    await Balance.getBalance(service.icpLedger, account);
  };

  public func getUserBalance(service: LedgerService, user: Principal): async Nat {
    await Balance.getBalance(service.icpLedger, depositAccount(service, user));
  };

  public func transfer(service: LedgerService, args: LedgerTypes.TransferArgs): async LedgerTypes.TransferResult {
    await service.icpLedger.icrc1_transfer(args);
  };

  public func getFee(service: LedgerService): async Nat {
    await service.icpLedger.icrc1_fee();
  };

  public func transferToAccountIdentifier(service: LedgerService, args: LedgerTypes.OldTransferArgs): async LedgerTypes.OldTransferResult {
    await service.icpLedger.transfer(args);
  };

  public func getDecimals(service: LedgerService): async Nat8 {
    await service.icpLedger.icrc1_decimals();
  };

  public func getSymbol(service: LedgerService): async Text {
    await service.icpLedger.icrc1_symbol();
  };
};
