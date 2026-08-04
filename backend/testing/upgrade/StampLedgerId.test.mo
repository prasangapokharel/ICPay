import Debug "mo:core/Debug";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat64 "mo:core/Nat64";
import Text "mo:core/Text";
import Config "../../src/config/Config";
import TxStorage "../../src/storage/TransactionStorage";
import TxRepo "../../src/repositories/TransactionRepository";
import StampLedgerId "../../src/migrations/StampLedgerId";

// Rows exactly as they were persisted before Phase 3: no `ledgerId` field at
// all. The migration consumes this OldTransaction shape and produces the new
// Types.Transaction.
type OldTx = StampLedgerId.OldTransaction;

func legacyRow(
  id: Text,
  userId: Text,
  txType: { #deposit; #withdraw; #transfer; #fee },
  amount: Nat,
  fee: Nat,
  from: Text,
  to: Text,
  memo: ?Text,
  now: Int,
): OldTx {
  {
    id;
    userId;
    txType;
    amount;
    fee;
    from;
    to;
    var status = #completed;
    var blockIndex = ?Nat64.fromIntWrap(now);
    memo;
    createdAt = now;
    var updatedAt = now;
  };
};

let oldTxs = List.empty<OldTx>();
let now = 1000;
let icp = Config.ICP_LEDGER_CANISTER_ID;

let depId = "legacy-deposit";
let wdId = "legacy-withdraw";
let userId = "user-legacy";

// A pre-Phase-3 deposit and withdraw, completed on-chain before the upgrade.
List.add(oldTxs, legacyRow(depId, userId, #deposit, 100_000_000, 0, "alice", "bob", null, now));
List.add(oldTxs, legacyRow(wdId, userId, #withdraw, 50_000_000, 10_000, "alice", "carol", ?"rent", now));

// ---- migration: old-shape state in, new-shape state out ----
// `transactionsByUser` is passed in populated to prove the migration does not
// carry it across: it is a derived index of references into `transactions`, and
// mapping it would mint a second set of row objects whose status could drift
// from the log's.
let oldByUser = Map.empty<Text, List.List<OldTx>>();
Map.add(oldByUser, Text.compare, userId, oldTxs);

let result = StampLedgerId.migration({ transactions = oldTxs; transactionsByUser = oldByUser });
let migrated = result.transactions;

assert(migrated.size() == 2);
Debug.print("PASS: migration returns a migrated list of the same length");

// Returned empty on purpose -- main.mo reindexes from the stamped log instead.
assert(Map.size(result.transactionsByUser) == 0);
Debug.print("PASS: migration returns an empty index for reindex to rebuild");

// The per-user index is rebuilt from the stamped log exactly as main.mo does on
// a live upgrade (the migration produced new objects, so the old index would
// reference stale ones).
let txsByUser = TxStorage.createTxByUser();
TxRepo.reindex(migrated, txsByUser);

// Legacy rows now name the ICP ledger -- the only one this canister could have
// settled before Phase 3 -- so history renders the true token.
switch (TxRepo.getById(migrated, depId)) {
  case (?tx) {
    assert(tx.ledgerId == icp);
    Debug.print("PASS: legacy deposit row stamped with ICP ledger id");
  };
  case (null) { assert(false) };
};

switch (TxRepo.getById(migrated, wdId)) {
  case (?tx) {
    assert(tx.ledgerId == icp);
    Debug.print("PASS: legacy withdraw row stamped with ICP ledger id");
  };
  case (null) { assert(false) };
};

// Rebuilding must not drop the mutable status of a completed legacy row: a
// deposit that completed pre-upgrade has to stay completed, or the
// credited-deposit guard would no longer see it and an on-ledger balance
// could be credited twice on the next sync.
switch (TxRepo.getById(migrated, depId)) {
  case (?tx) {
    assert(tx.status == #completed);
    assert(tx.blockIndex == ?1000);
    assert(tx.amount == 100_000_000);
    assert(tx.fee == 0);
    assert(tx.from == "alice");
    assert(tx.to == "bob");
    assert(tx.memo == null);
    assert(tx.createdAt == now);
    assert(tx.updatedAt == now);
    Debug.print("PASS: rebuild preserves all fields and status");
  };
  case (null) { assert(false) };
};

// The per-user index must point at the stamped rows after reindex, so a user's
// transaction list and the ledger-scoped deposit total see the ICP stamp.
assert(TxRepo.getUserTxCount(txsByUser, userId) == 2);
assert(TxRepo.getTotalDepositAmount(txsByUser, userId, icp) == 100_000_000);
assert(TxRepo.getTotalDepositAmount(txsByUser, userId, "mxzaz-hqaaa-aaaar-qaada-cai") == 0);
Debug.print("PASS: index sees stamped rows after reindex");

// Every migrated row carries a non-blank ledger id.
for (tx in List.values(migrated)) {
  assert(tx.ledgerId != "");
  assert(tx.ledgerId == icp);
};
Debug.print("PASS: no row left with a blank ledger id");

Debug.print("ALL MIGRATION TESTS PASSED");
