import Debug "mo:core/Debug";
import TxModel "../../src/models/Transaction";
import Types "../../src/types";

let now = 1000;
let icp = "ryjl3-tyaaa-aaaaa-aaaba-cai";
let tx = TxModel.new("tx-1", "user-1", #deposit, icp, 100_000_000, 0, "from-principal", "to-principal", ?"memo-test", now);

assert(tx.id == "tx-1");
assert(tx.userId == "user-1");
assert(tx.txType == #deposit);
assert(tx.ledgerId == icp);
assert(tx.amount == 100_000_000);
assert(tx.fee == 0);
assert(tx.from == "from-principal");
assert(tx.to == "to-principal");
assert(tx.memo == ?"memo-test");
assert(tx.status == #pending);
assert(tx.blockIndex == null);
assert(tx.createdAt == now);
assert(tx.updatedAt == now);
Debug.print("PASS: Transaction.new() creates pending transaction");

tx.complete(42, 2000);
assert(tx.status == #completed);
assert(tx.blockIndex == ?42);
assert(tx.updatedAt == 2000);
Debug.print("PASS: Transaction.complete() sets completed status");

let tx2 = TxModel.new("tx-2", "user-1", #withdraw, icp, 50_000, 10_000, "from", "to", null, now);
tx2.fail(3000);
assert(tx2.status == #failed);
assert(tx2.updatedAt == 3000);
Debug.print("PASS: Transaction.fail() sets failed status");

let tx3 = TxModel.new("tx-3", "user-1", #transfer, icp, 25_000, 10_000, "from", "to", null, now);
tx3.cancel(4000);
assert(tx3.status == #cancelled);
assert(tx3.updatedAt == 4000);
Debug.print("PASS: Transaction.cancel() sets cancelled status");

let tx4 = TxModel.new("tx-4", "user-1", #fee, icp, 10_000, 0, "from", "to", null, now);
assert(tx4.txType == #fee);
Debug.print("PASS: Transaction supports all tx types");

Debug.print("ALL TRANSACTION MODEL TESTS PASSED");
