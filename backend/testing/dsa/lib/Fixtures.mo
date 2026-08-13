import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Time "mo:core/Time";
import UserStorage "../../../src/storage/UserStorage";
import UserRepo "../../../src/repositories/UserRepository";

module {
  public type SeedResult = {
    users: UserStorage.UserMap;
    usernames: UserStorage.UsernameMap;
    usersById: UserStorage.UserIdMap;
    depositSubaccounts: UserStorage.DepositSubaccountIndex;
    depositAccountIds: UserStorage.DepositAccountIdIndex;
    depositIndex: UserRepo.DepositIndexCtx;
    custodian: Principal;
  };

  public func principalAt(i: Nat) : Principal {
    let bytes = Blob.fromArray(Array.tabulate<Nat8>(29, func(j) { Nat8.fromNat((i + j) % 256) }));
    Principal.fromBlob(bytes)
  };

  public func seedUsers(count: Nat, custodian: Principal, usernamePrefix: ?Text) : SeedResult {
    let users = UserStorage.createUserMap();
    let usernames = UserStorage.createUsernameMap();
    let usersById = UserStorage.createUserIdMap();
    let depositSubaccounts = UserStorage.createDepositSubaccountIndex();
    let depositAccountIds = UserStorage.createDepositAccountIdIndex();
    let depositIndex : UserRepo.DepositIndexCtx = {
      subaccounts = depositSubaccounts;
      accountIds = depositAccountIds;
      custodian;
    };
    let now = Time.now();
    var i = 0;
    while (i < count) {
      let p = principalAt(i);
      let username = switch (usernamePrefix) {
        case (?prefix) { ?(prefix # Nat.toText(i)) };
        case (null) { null };
      };
      ignore UserRepo.create(
        users,
        usernames,
        usersById,
        "uid-" # Nat.toText(i),
        p,
        username,
        "User " # Nat.toText(i),
        now,
        ?depositIndex,
      );
      i += 1;
    };
    {
      users;
      usernames;
      usersById;
      depositSubaccounts;
      depositAccountIds;
      depositIndex;
      custodian;
    }
  };
};
