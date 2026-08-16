import Principal "mo:core/Principal";
import Set "mo:core/Set";
import Text "mo:core/Text";
import TokenStorage "../../storage/TokenStorage";
import UserStorage "../../storage/UserStorage";
import LedgerService "../LedgerService";
import TransferService "../TransferService";
import TokenWasmService "../TokenWasmService";
import RateLimitStorage "../../storage/RateLimitStorage";

module {
  public type TokenService = {
    tokens: TokenStorage.TokenMap;
    byLedger: TokenStorage.TokensByLedger;
    byUser: TokenStorage.TokensByUser;
    reservedSymbols: TokenStorage.ReservedSymbolSet;
    wasm: TokenWasmService.TokenWasmStore;
    transfers: TransferService.TransferService;
    ledger: LedgerService.LedgerService;
    users: UserStorage.UserMap;
    self: Principal;
    nextId: () -> Text;
    limits: RateLimitStorage.RateLimitMap;
    pending: Set.Set<Text>;
  };

  public func create(
    tokens: TokenStorage.TokenMap,
    byLedger: TokenStorage.TokensByLedger,
    byUser: TokenStorage.TokensByUser,
    reservedSymbols: TokenStorage.ReservedSymbolSet,
    wasm: TokenWasmService.TokenWasmStore,
    transfers: TransferService.TransferService,
    ledger: LedgerService.LedgerService,
    users: UserStorage.UserMap,
    self: Principal,
    nextId: () -> Text,
    limits: RateLimitStorage.RateLimitMap,
  ) : TokenService {
    {
      tokens; byLedger; byUser; reservedSymbols; wasm; transfers; ledger; users; self; nextId; limits;
      pending = Set.empty<Text>();
    };
  };
};
