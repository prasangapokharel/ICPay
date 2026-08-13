import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import UserStorage "../../../src/storage/UserStorage";
import AccountHelper "../../../src/ledger/Account";
import Subaccount "../../../src/ledger/Subaccount";

/// O(n) baselines — what transfer recipient lookup did before deposit indexes.
module {
  public func bySubaccount(
    users: UserStorage.UserMap,
    sub: Blob,
  ) : ?Principal {
    for ((p, _) in Map.entries(users)) {
      if (Subaccount.fromPrincipal(p) == sub) { return ?p };
    };
    null
  };

  public func byAccountId(
    users: UserStorage.UserMap,
    custodian: Principal,
    accountIdHex: Text,
  ) : ?Principal {
    for ((p, _) in Map.entries(users)) {
      let account = AccountHelper.custodialAccount(custodian, p);
      if (AccountHelper.toAccountIdentifier(account) == accountIdHex) { return ?p };
    };
    null
  };

  public func byPrincipalScan(
    users: UserStorage.UserMap,
    target: Principal,
  ) : ?Principal {
    for ((p, _) in Map.entries(users)) {
      if (p == target) { return ?p };
    };
    null
  };
};
