import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Array "mo:core/Array";
import Nat8 "mo:core/Nat8";
import Nat "mo:core/Nat";
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

func principalAt(i: Nat) : Principal {
  let bytes = Blob.fromArray(Array.tabulate<Nat8>(29, func(j) { Nat8.fromNat((i + j) % 256) }));
  Principal.fromBlob(bytes)
};

var seed = 0;
while (seed < 100) {
  let p = principalAt(seed);
  ignore UserRepo.create(
    users, usernames, usersById, "uid-" # Int.toText(seed), p, null, "User " # Int.toText(seed), now, ?depositIndex,
  );
  seed += 1;
};

let target = principalAt(42);
let targetAccount = AccountHelper.custodialAccount(custodian, target);
let targetSub = switch (targetAccount.subaccount) {
  case (?s) { s };
  case (null) { assert(false); Blob.fromArray([]) };
};
let targetAccountId = AccountHelper.toAccountIdentifier(targetAccount);

switch (UserRepo.getByDepositSubaccount(depositSubaccounts, users, targetSub)) {
  case (?u) {
    assert(u.principal == target);
    Debug.print("PASS: getByDepositSubaccount resolves indexed user");
  };
  case (null) { assert(false); Debug.print("FAIL: subaccount index miss") };
};

switch (UserRepo.getByDepositAccountId(depositAccountIds, users, targetAccountId)) {
  case (?u) {
    assert(u.principal == target);
    Debug.print("PASS: getByDepositAccountId resolves indexed user");
  };
  case (null) { assert(false); Debug.print("FAIL: account-id index miss") };
};

switch (UserRepo.getByDepositSubaccount(depositSubaccounts, users, Subaccount.fromPrincipal(Principal.fromText("2vxsx-fae")))) {
  case (?_) { assert(false); Debug.print("FAIL: unknown subaccount should not resolve") };
  case (null) { Debug.print("PASS: unknown subaccount returns null") };
};

Debug.print("ALL TRANSFER INDEX TESTS PASSED");
