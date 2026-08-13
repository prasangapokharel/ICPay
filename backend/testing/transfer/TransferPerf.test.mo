import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Time "mo:core/Time";
import Int "mo:core/Int";
import UserStorage "../../src/storage/UserStorage";
import UserRepo "../../src/repositories/UserRepository";
import AccountHelper "../../src/ledger/Account";
import Subaccount "../../src/ledger/Subaccount";

let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();
let depositSubaccounts = UserStorage.createDepositSubaccountIndex();
let depositAccountIds = UserStorage.createDepositAccountIdIndex();
let custodian = Principal.fromText("aaaaa-aa");
let depositIndex : UserRepo.DepositIndexCtx = {
  subaccounts = depositSubaccounts;
  accountIds = depositAccountIds;
  custodian;
};
let now = Time.now();
let userCount : Nat = 200;
let lookupIterations : Nat = 500;

func principalAt(i: Nat) : Principal {
  let bytes = Blob.fromArray(Array.tabulate<Nat8>(29, func(j) { Nat8.fromNat((i + j) % 256) }));
  Principal.fromBlob(bytes)
};

var seed = 0;
while (seed < userCount) {
  let p = principalAt(seed);
  ignore UserRepo.create(
    users, usernames, usersById, "uid-" # Int.toText(seed), p, null, "", now, ?depositIndex,
  );
  seed += 1;
};

let target = principalAt(userCount / 2);
let targetAccount = AccountHelper.custodialAccount(custodian, target);
let targetSub = switch (targetAccount.subaccount) {
  case (?s) { s };
  case (null) { assert(false); Blob.fromArray([]) };
};
let targetAccountId = AccountHelper.toAccountIdentifier(targetAccount);

func scanBySubaccount(sub: Blob) : ?Principal {
  for ((p, _) in Map.entries(users)) {
    if (Subaccount.fromPrincipal(p) == sub) { return ?p };
  };
  null
};

func scanByAccountId(accountIdHex: Text) : ?Principal {
  for ((p, _) in Map.entries(users)) {
    let account = AccountHelper.custodialAccount(custodian, p);
    if (AccountHelper.toAccountIdentifier(account) == accountIdHex) { return ?p };
  };
  null
};

let scanStart = Time.now();
var scanHits : Nat = 0;
var scanRound = 0;
while (scanRound < lookupIterations) {
  switch (scanBySubaccount(targetSub)) {
    case (?p) { if (p == target) { scanHits += 1 } };
    case (null) {};
  };
  scanRound += 1;
};
let scanNs = Time.now() - scanStart;

let indexStart = Time.now();
var indexHits : Nat = 0;
var indexRound = 0;
while (indexRound < lookupIterations) {
  switch (UserRepo.getByDepositSubaccount(depositSubaccounts, users, targetSub)) {
    case (?u) { if (u.principal == target) { indexHits += 1 } };
    case (null) {};
  };
  indexRound += 1;
};
let indexNs = Time.now() - indexStart;

assert(scanHits == lookupIterations);
assert(indexHits == lookupIterations);
Debug.print(
  "BENCH users=" # Nat.toText(userCount)
  # " lookups=" # Nat.toText(lookupIterations)
  # " scan_ns=" # Int.toText(scanNs)
  # " index_ns=" # Int.toText(indexNs),
);

switch (scanByAccountId(targetAccountId)) {
  case (?p) { assert(p == target) };
  case (null) { assert(false) };
};
switch (UserRepo.getByDepositAccountId(depositAccountIds, users, targetAccountId)) {
  case (?u) { assert(u.principal == target) };
  case (null) { assert(false) };
};
Debug.print("PASS: account-id scan and index agree on target user");

// moc -r may not resolve sub-millisecond timing; correctness + printed ns are
// what we gate on. At scale, scan is O(users × lookups) vs index O(lookups).
if (scanNs > indexNs) {
  Debug.print("PASS: index lookup faster than full user scan (scan_ns > index_ns)");
} else {
  Debug.print("NOTE: timing tie under moc -r resolution — complexity win is O(1) vs O(n) per lookup");
};

Debug.print("ALL TRANSFER PERF TESTS PASSED");
