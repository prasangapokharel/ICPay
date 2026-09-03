import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Config "../config/Config";
import Error "mo:core/Error";
import LedgerTypes "../ledger/Types";
import LedgerClient "../ledger/LedgerClient";
import SnsWasm "../ledger/SnsWasm";
import AccountHelper "../ledger/Account";
import Balance "../ledger/Balance";
import LedgerStorage "../storage/LedgerStorage";

module {
  public func create(custodian: Principal, registry: LedgerStorage.LedgerRegistry) : LedgerService {
    { custodian; registry };
  };

  public type LedgerService = {
    // The wallet canister's own principal — owner of every custodial deposit account.
    custodian: Principal;
    registry: LedgerStorage.LedgerRegistry;
  };

  // Resolving per call rather than holding one actor is what makes every
  // function here token-agnostic. `actor(id)` builds a reference, not a lookup,
  // so there is nothing to cache and nothing to invalidate.
  func ledger(ledgerId: Text): LedgerClient.ICRC1Service {
    actor(ledgerId);
  };

  public func isAllowed(service: LedgerService, ledgerId: Text): Bool {
    LedgerStorage.isAllowed(service.registry, ledgerId);
  };

  // Tokens this canister launched are not SNS-deployed, so refreshLedgers will
  // never find them and without this they stay unspendable forever. Returns
  // whether it was new, so a caller can report how many it actually added.
  public func registerLedger(service: LedgerService, ledgerId: Text): Bool {
    LedgerStorage.register(service.registry, ledgerId);
  };

  // Deposit accounts are derived from the principal alone, so one account serves
  // every ledger -- a subaccount is an address *within* a ledger. Deriving
  // per-token would move every existing user's ICP deposit address and strand
  // funds already sitting at the old one.
  public func depositAccount(service: LedgerService, user: Principal): LedgerTypes.Account {
    AccountHelper.custodialAccount(service.custodian, user);
  };

  public func getBalance(ledgerId: Text, account: LedgerTypes.Account): async Nat {
    await Balance.getBalance(ledger(ledgerId), account);
  };

  public func getUserBalance(service: LedgerService, ledgerId: Text, user: Principal): async Nat {
    await Balance.getBalance(ledger(ledgerId), depositAccount(service, user));
  };

  public func transfer(ledgerId: Text, args: LedgerTypes.TransferArgs): async LedgerTypes.TransferResult {
    await ledger(ledgerId).icrc1_transfer(args);
  };

  public func getFee(ledgerId: Text): async Nat {
    await ledger(ledgerId).icrc1_fee();
  };

  /** Tx-history estimate — avoids an extra ledger round-trip on the hot transfer path. */
  public func estimatedDisplayFee(_ledgerId: Text): Nat {
    Config.ICP_ICRC1_TRANSFER_FEE_E8S
  };

  // Account identifiers are an ICP-ledger concept and no other ICRC-1 ledger
  // implements this method, so this one path stays pinned rather than taking a
  // ledgerId it could not honour.
  public func transferToAccountIdentifier(args: LedgerTypes.OldTransferArgs): async LedgerTypes.OldTransferResult {
    await ledger(Config.ICP_LEDGER_CANISTER_ID).transfer(args);
  };

  public func getDecimals(ledgerId: Text): async Nat8 {
    await ledger(ledgerId).icrc1_decimals();
  };

  public func getSymbol(ledgerId: Text): async Text {
    await ledger(ledgerId).icrc1_symbol();
  };

  // User-added ICRC ledgers are not SNS-listed or ICPay-launched. Before the
  // custodian calls one, probe the standard methods so a random canister id
  // cannot be pointed at a forged interface.
  public func isValidIcrcLedger(ledgerId: Text): async Bool {
    // Canister principals end in "-cai". Reject garbage before actor(id) traps.
    if (ledgerId.size() < 5 or ledgerId.size() > 128) { return false };
    if (not Text.endsWith(ledgerId, #text "-cai")) { return false };
    try {
      let svc = ledger(ledgerId);
      let standards = await svc.icrc1_supported_standards();
      var hasIcrc1 = false;
      for (s in standards.vals()) {
        if (s.name == "ICRC-1") { hasIcrc1 := true };
      };
      if (not hasIcrc1) { return false };
      let symbol = await svc.icrc1_symbol();
      let decimals = await svc.icrc1_decimals();
      symbol.size() > 0 and symbol.size() <= 32 and decimals <= 18
    } catch (_) {
      false
    };
  };

  // Refreshes the spendable-ledger allowlist from SNS-W. Additive on purpose: a
  // partial or failed response leaves the previous set intact, because dropping
  // a ledger here makes a token users hold suddenly unspendable. SNS ledgers are
  // not retired, so the set only ever grows.
  public func refreshLedgers(service: LedgerService): async Nat {
    let snsW: SnsWasm.SnsWasmService = actor(Config.SNS_WASM_CANISTER_ID);
    let deployed = await snsW.list_deployed_snses({});
    var added = 0;
    for (sns in deployed.instances.vals()) {
      switch (sns.ledger_canister_id) {
        case (?id) {
          if (LedgerStorage.register(service.registry, Principal.toText(id))) {
            added += 1;
          };
        };
        case (null) {};
      };
    };
    added;
  };
};
