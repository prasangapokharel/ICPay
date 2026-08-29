import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Types "../../types";
import TokenValidator "../../validators/TokenValidator";
import TokenRepo "../../repositories/TokenRepository";
import UserRepo "../../repositories/UserRepository";
import LedgerService "../LedgerService";
import Context "Context";

module {
  public func getToken(service: Context.TokenService, canisterId: Text): ?Types.TokenPublic {
    switch (TokenRepo.findByLedgerId(service.tokens, service.byLedger, canisterId)) {
      case (?t) { ?Types.tokenToPublic(t) };
      case (null) { null };
    };
  };

  public func getById(service: Context.TokenService, id: Types.TokenId): ?Types.TokenPublic {
    switch (TokenRepo.getById(service.tokens, id)) {
      case (?t) { ?Types.tokenToPublic(t) };
      case (null) { null };
    };
  };

  public func listByUser(service: Context.TokenService, caller: Principal, limit: Nat, offset: Nat): [Types.TokenPublic] {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (null) { [] };
      case (?u) {
        let rows = TokenRepo.getByUser(service.tokens, service.byUser, u.id, limit, offset);
        Array.map<Types.Token, Types.TokenPublic>(rows, Types.tokenToPublic);
      };
    };
  };

  public func listActive(service: Context.TokenService, limit: Nat, offset: Nat): [Types.TokenPublic] {
    let rows = TokenRepo.listActive(service.tokens, limit, offset);
    Array.map<Types.Token, Types.TokenPublic>(rows, Types.tokenToPublic);
  };

  func isActiveLaunchedLedger(service: Context.TokenService, ledgerId: Text): Bool {
    switch (TokenRepo.findByLedgerId(service.tokens, service.byLedger, ledgerId)) {
      case (?t) { t.status == #active };
      case (null) { false };
    };
  };

  // Chain-key and SNS ledgers live in the registry; ICPay-launched ledgers are
  // stored in TokenStorage and re-registered on every start so an upgrade never
  // leaves a live launch unspendable until someone runs a manual backfill.
  public func isCustodiedLedger(service: Context.TokenService, ledgerId: Text): Bool {
    LedgerService.isAllowed(service.ledger, ledgerId)
    or isActiveLaunchedLedger(service, ledgerId);
  };

  public func ensureCustodiedLedger(service: Context.TokenService, ledgerId: Text): Bool {
    if (LedgerService.isAllowed(service.ledger, ledgerId)) { return true };
    if (not isActiveLaunchedLedger(service, ledgerId)) { return false };
    ignore LedgerService.registerLedger(service.ledger, ledgerId);
    true;
  };

  public func ensureCustodiedLedgerAsync(service: Context.TokenService, ledgerId: Text): async Bool {
    if (LedgerService.isAllowed(service.ledger, ledgerId)) { return true };
    if (isActiveLaunchedLedger(service, ledgerId)) {
      ignore LedgerService.registerLedger(service.ledger, ledgerId);
      return true;
    };
    if (await LedgerService.isValidIcrcLedger(ledgerId)) {
      ignore LedgerService.registerLedger(service.ledger, ledgerId);
      return true;
    };
    false
  };

  public func registerLaunchedLedgers(service: Context.TokenService): Nat {
    var added = 0;
    for (id in TokenRepo.activeLedgerIds(service.tokens).values()) {
      if (LedgerService.registerLedger(service.ledger, id)) { added += 1 };
    };
    added;
  };

  public func isSymbolAvailable(service: Context.TokenService, symbol: Text): Bool {
    switch (TokenValidator.validateSymbol(symbol)) {
      case (?_) { false };
      case (null) {
        not TokenRepo.symbolTaken(service.tokens, service.reservedSymbols, symbol);
      };
    };
  };
};
