import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import TokenStorage "../../src/storage/TokenStorage";
import TokenRepo "../../src/repositories/TokenRepository";
import TokenModel "../../src/models/Token";

let tokens = TokenStorage.createTokenMap();
let byLedger = TokenStorage.createTokensByLedger();
let byUser = TokenStorage.createTokensByUser();
let reserved = TokenStorage.createReservedSymbolSet();

let alice = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
let bob = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
let now = 1000;

let t1 = TokenRepo.createPending(
  tokens, byUser, "tok-1", "user-1", alice,
  "My Token", "MTK", "", null, null, null, null,
  8, 1_000_000, false, 42, now,
);
assert (t1.id == "tok-1");
assert (t1.status == #pending);
Debug.print("PASS: createPending writes a pending row");

// The row exists before the canister does. This is the whole reason the canister
// id cannot be the primary key.
assert (t1.ledgerId == null);
switch (TokenRepo.findByLedgerId(tokens, byLedger, "aaaaa-aa")) {
  case (?_) { assert false };
  case (null) {};
};
switch (TokenRepo.getById(tokens, "tok-1")) {
  case (?t) { assert (t.id == "tok-1") };
  case (null) { assert false };
};
Debug.print("PASS: a pending row is reachable by internal id with no canister id");

// The payment block is committed before any canister call, so a later trap
// leaves evidence a refund can be traced to.
assert (t1.paymentBlockIndex == 42);
Debug.print("PASS: payment block index is on the row from the start");

TokenRepo.setLedgerId(byLedger, t1, "mxzaz-hqaaa-aaaar-qaada-cai");
assert (t1.ledgerId == ?"mxzaz-hqaaa-aaaar-qaada-cai");
switch (TokenRepo.findByLedgerId(tokens, byLedger, "mxzaz-hqaaa-aaaar-qaada-cai")) {
  case (?t) { assert (t.id == "tok-1") };
  case (null) { assert false };
};
Debug.print("PASS: setLedgerId indexes a live canister while still pending");

// A pending launch still holds its symbol: two launches racing on one symbol
// must not both reach the ledger.
assert (TokenRepo.symbolTaken(tokens, reserved, "MTK"));
assert (TokenRepo.symbolTaken(tokens, reserved, "mtk"));
assert (not TokenRepo.symbolTaken(tokens, reserved, "OTHER"));
Debug.print("PASS: a pending launch reserves its symbol, case-insensitively");

// A failed launch releases the symbol -- the creator paid and got nothing, so
// they must be able to retry under the same name.
TokenModel.markFailed(t1, "install trapped");
assert (not TokenRepo.symbolTaken(tokens, reserved, "MTK"));
Debug.print("PASS: a failed launch releases its symbol");

TokenModel.markActive(t1, "\00\01", 4_400_000_000_000);
assert (t1.status == #active);
assert (t1.cyclesFunded == ?4_400_000_000_000);
assert (TokenRepo.symbolTaken(tokens, reserved, "MTK"));
Debug.print("PASS: an active launch holds its symbol");

TokenRepo.reserveSymbol(reserved, "icp");
assert (TokenRepo.isReservedSymbol(reserved, "ICP"));
assert (TokenRepo.symbolTaken(tokens, reserved, "ICP"));
assert (TokenRepo.listReservedSymbols(reserved).size() == 1);
Debug.print("PASS: reserved symbols are normalized and block launches");

let t2 = TokenRepo.createPending(
  tokens, byUser, "tok-2", "user-2", bob,
  "Bob Coin", "BOB", "", null, null, null, null,
  8, 500, true, 43, now,
);
TokenRepo.setLedgerId(byLedger, t2, "ss2fx-dyaaa-aaaar-qacoq-cai");
TokenModel.markActive(t2, "\00\01", 1);

assert (TokenRepo.getUserTokenCount(byUser, "user-1") == 1);
assert (TokenRepo.getUserTokenCount(byUser, "user-2") == 1);
assert (TokenRepo.getUserTokenCount(byUser, "nobody") == 0);
Debug.print("PASS: per-user index does not leak across users");

let alicePage = TokenRepo.getByUser(tokens, byUser, "user-1", 10, 0);
assert (alicePage.size() == 1);
assert (alicePage[0].id == "tok-1");
Debug.print("PASS: getByUser returns only that user's tokens");

let counts = TokenRepo.countByStatus(tokens);
assert (counts.active == 2);
assert (counts.pending == 0);
assert (counts.failed == 0);
Debug.print("PASS: countByStatus scans rather than counting");

assert (TokenRepo.listActive(tokens, 10, 0).size() == 2);
assert (TokenRepo.listActive(tokens, 1, 0).size() == 1);
assert (TokenRepo.listActive(tokens, 10, 2).size() == 0);
Debug.print("PASS: listActive paginates");

// Two tokens must never share a canister id lookup.
switch (TokenRepo.findByLedgerId(tokens, byLedger, "ss2fx-dyaaa-aaaar-qacoq-cai")) {
  case (?t) { assert (t.id == "tok-2") };
  case (null) { assert false };
};
Debug.print("PASS: ledger index resolves each token distinctly");

Debug.print("ALL TOKEN REPOSITORY TESTS PASSED");
