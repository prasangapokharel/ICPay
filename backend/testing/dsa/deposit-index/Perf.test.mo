import Debug "mo:core/Debug";
import Nat "mo:core/Nat";
import Blob "mo:core/Blob";
import Principal "mo:core/Principal";
import UserRepo "../../../src/repositories/UserRepository";
import AccountHelper "../../../src/ledger/Account";
import Fixtures "../lib/Fixtures";
import Scan "../lib/Scan";
import Bench "../lib/Bench";

/// Small seed + few scan reps — account-id scan is O(n) with hex derivation per user.
let userCount : Nat = 30;

let seed = Fixtures.seedUsers(userCount, Principal.fromText("aaaaa-aa"), null);
let target = Fixtures.principalAt(userCount / 2);
let targetAccount = AccountHelper.custodialAccount(seed.custodian, target);
let targetSub = switch (targetAccount.subaccount) {
  case (?s) { s };
  case (null) { assert(false); Blob.fromArray([]) };
};
let targetAccountId = AccountHelper.toAccountIdentifier(targetAccount);

// Correctness once — no repeated full-table scan in the hot loop below.
switch (Scan.bySubaccount(seed.users, targetSub)) {
  case (?p) { assert(p == target) };
  case (null) { assert(false) };
};
switch (UserRepo.getByDepositSubaccount(seed.depositSubaccounts, seed.users, targetSub)) {
  case (?u) { assert(u.principal == target) };
  case (null) { assert(false) };
};
switch (Scan.byAccountId(seed.users, seed.custodian, targetAccountId)) {
  case (?p) { assert(p == target) };
  case (null) { assert(false) };
};
switch (UserRepo.getByDepositAccountId(seed.depositAccountIds, seed.users, targetAccountId)) {
  case (?u) { assert(u.principal == target) };
  case (null) { assert(false) };
};
Debug.print("PASS: scan baseline and deposit index agree (checked once)");

let scanSub = Bench.run("deposit_subaccount_scan", Bench.scanIterations, func() {
  ignore Scan.bySubaccount(seed.users, targetSub);
});
let indexSub = Bench.run("deposit_subaccount_index", Bench.indexIterations, func() {
  ignore UserRepo.getByDepositSubaccount(seed.depositSubaccounts, seed.users, targetSub);
});
Bench.printCompare(scanSub, indexSub);

let scanAcct = Bench.run("deposit_account_id_scan", Bench.scanIterations, func() {
  ignore Scan.byAccountId(seed.users, seed.custodian, targetAccountId);
});
let indexAcct = Bench.run("deposit_account_id_index", Bench.indexIterations, func() {
  ignore UserRepo.getByDepositAccountId(seed.depositAccountIds, seed.users, targetAccountId);
});
Bench.printCompare(scanAcct, indexAcct);

Debug.print(
  "SUMMARY deposit-index users=" # Nat.toText(userCount)
  # " scan_iters=" # Nat.toText(Bench.scanIterations)
  # " index_iters=" # Nat.toText(Bench.indexIterations)
  # " — production uses index",
);
Debug.print("ALL deposit-index PERF TESTS PASSED");
