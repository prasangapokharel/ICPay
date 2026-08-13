import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import UserRepo "../../../src/repositories/UserRepository";
import AccountHelper "../../../src/ledger/Account";
import Subaccount "../../../src/ledger/Subaccount";
import Fixtures "../lib/Fixtures";

let seed = Fixtures.seedUsers(100, Principal.fromText("aaaaa-aa"), null);
let target = Fixtures.principalAt(42);
let targetAccount = AccountHelper.custodialAccount(seed.custodian, target);
let targetSub = switch (targetAccount.subaccount) {
  case (?s) { s };
  case (null) { assert(false); Blob.fromArray([]) };
};
let targetAccountId = AccountHelper.toAccountIdentifier(targetAccount);

switch (UserRepo.getByDepositSubaccount(seed.depositSubaccounts, seed.users, targetSub)) {
  case (?u) {
    assert(u.principal == target);
    Debug.print("PASS: getByDepositSubaccount resolves indexed user");
  };
  case (null) { assert(false); Debug.print("FAIL: subaccount index miss") };
};

switch (UserRepo.getByDepositAccountId(seed.depositAccountIds, seed.users, targetAccountId)) {
  case (?u) {
    assert(u.principal == target);
    Debug.print("PASS: getByDepositAccountId resolves indexed user");
  };
  case (null) { assert(false); Debug.print("FAIL: account-id index miss") };
};

switch (UserRepo.getByDepositSubaccount(seed.depositSubaccounts, seed.users, Subaccount.fromPrincipal(Principal.fromText("2vxsx-fae")))) {
  case (?_) { assert(false); Debug.print("FAIL: unknown subaccount should not resolve") };
  case (null) { Debug.print("PASS: unknown subaccount returns null") };
};

Debug.print("ALL deposit-index CORRECTNESS TESTS PASSED");
