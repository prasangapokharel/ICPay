import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import UserStorage "../../src/storage/UserStorage";
import TxStorage "../../src/storage/TransactionStorage";
import LedgerStorage "../../src/storage/LedgerStorage";
import RateLimitStorage "../../src/storage/RateLimitStorage";
import LedgerService "../../src/services/LedgerService";
import TradeService "../../src/services/TradeService";
import AmountValidator "../../src/validators/AmountValidator";

let users = UserStorage.createUserMap();
let txs = TxStorage.createTxList();
let txsByUser = TxStorage.createTxByUser();
let ledgerRegistry = LedgerStorage.createLedgerRegistry();
let ledger = LedgerService.create(Principal.fromText("aaaaa-aa"), ledgerRegistry);
ignore LedgerService.registerLedger(ledger, "ryjl3-tyaaa-aaaaa-aaaba-cai");

var uidCounter = 0;
func nextUid(): Text {
  uidCounter += 1;
  "tx-trade-" # debug_show(uidCounter);
};

let trade = TradeService.create(
  users,
  txs,
  txsByUser,
  ledger,
  nextUid,
  RateLimitStorage.createRateLimitMap(),
);

let caller = Principal.fromText("2vxsx-fae");

switch (AmountValidator.validate(0)) {
  case (?err) { assert(err.size() > 0) };
  case (null) { assert(false) };
};
Debug.print("PASS: zero amount rejected by validator");

switch (await TradeService.depositForTrade(trade, caller, "ryjl3-tyaaa-aaaaa-aaaba-cai", 1_000_000)) {
  case (#err(msg)) {
    assert(msg == "User not found");
    Debug.print("PASS: depositForTrade rejects unknown user");
  };
  case (#ok(_)) { assert(false) };
};

switch (await TradeService.depositForTrade(trade, caller, "bad-ledger", 1_000_000)) {
  case (#err(msg)) {
    assert(Text.contains(msg, #text "Unsupported"));
    Debug.print("PASS: depositForTrade rejects unsupported ledger");
  };
  case (#ok(_)) { assert(false) };
};
