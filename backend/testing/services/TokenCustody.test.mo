import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import Text "mo:core/Text";
import TokenStorage "../../src/storage/TokenStorage";
import UserStorage "../../src/storage/UserStorage";
import TxStorage "../../src/storage/TransactionStorage";
import RateLimitStorage "../../src/storage/RateLimitStorage";
import LedgerStorage "../../src/storage/LedgerStorage";
import TokenRepo "../../src/repositories/TokenRepository";
import TokenModel "../../src/models/Token";
import LedgerService "../../src/services/LedgerService";
import TransferService "../../src/services/TransferService";
import TokenWasmService "../../src/services/TokenWasmService";
import TokenQuery "../../src/services/token/Query";

let tokens = TokenStorage.createTokenMap();
let byLedger = TokenStorage.createTokensByLedger();
let byUser = TokenStorage.createTokensByUser();
let reserved = TokenStorage.createReservedSymbolSet();
let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let transactions = TxStorage.createTxList();
let byUserTx = TxStorage.createTxByUser();
let registry = LedgerStorage.createLedgerRegistry();
let custodian = Principal.fromText("aaaaa-aa");
let ledger = LedgerService.create(custodian, registry);
let transfers = TransferService.create(
  users, usernames, transactions, byUserTx, ledger,
  func() { "tx-1" },
  RateLimitStorage.createRateLimitMap(),
  UserStorage.createDepositSubaccountIndex(),
  UserStorage.createDepositAccountIdIndex(),
);
let service = {
  tokens; byLedger; byUser; reservedSymbols = reserved;
  wasm = TokenWasmService.empty();
  transfers; ledger; users;
  self = custodian;
  nextId = func() : Text { "tok-next" };
  limits = RateLimitStorage.createRateLimitMap();
  pending = Set.empty<Text>();
};

let launched = "7rrmx-tyaaa-aaaal-qsraq-cai";
assert (not TokenQuery.isCustodiedLedger(service, launched));
assert (not TokenQuery.ensureCustodiedLedger(service, launched));
Debug.print("PASS: unknown ledgers are not custodied");

let row = TokenRepo.createPending(
  tokens, byUser, "tok-1", "user-1", custodian,
  "OhShii", "OHSHII", "", null, null, null, null,
  8, 1_000_000, false, 1, 1,
);
TokenRepo.setLedgerId(byLedger, row, launched);
TokenModel.markActive(row, "\00\01", 4_400_000_000_000);

assert (TokenQuery.isCustodiedLedger(service, launched));
assert (not LedgerService.isAllowed(ledger, launched));
Debug.print("PASS: an active launch reads as custodied before registration");

assert (TokenQuery.ensureCustodiedLedger(service, launched));
assert (LedgerService.isAllowed(ledger, launched));
assert (TokenQuery.ensureCustodiedLedger(service, launched));
Debug.print("PASS: ensure registers a launched ledger once");

assert (not TokenQuery.isCustodiedLedger(service, "god5q-iaaaa-aaaae-qkiea-cai"));
Debug.print("PASS: unrelated ledgers without a launch row stay blocked");

Debug.print("ALL TOKEN CUSTODY TESTS PASSED");
