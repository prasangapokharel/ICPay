import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Types "../types";
import Config "../config/Config";
import AccountHelper "../ledger/Account";
import DateTime "../utils/DateTime";
import TransferService "TransferService";
import UserRepo "../repositories/UserRepository";
import ReservedRepo "../repositories/ReservedUsernameRepository";
import ReservedStorage "../storage/ReservedUsernameStorage";
import UserStorage "../storage/UserStorage";
import UsernameValidator "../validators/UsernameValidator";

module {
  public func create(
    users: UserStorage.UserMap,
    usernames: UserStorage.UsernameMap,
    reserved: ReservedStorage.ReservedUsernameSet,
    transfers: TransferService.TransferService,
  ) : UsernameSaleService {
    // Held only for the duration of one purchase, so it is deliberately not
    // persisted: an upgrade landing between two calls must not strand a name
    // behind a lock nobody will ever release.
    { users; usernames; reserved; transfers; pending = Set.empty<Text>() };
  };

  public type UsernameSaleService = {
    users: UserStorage.UserMap;
    usernames: UserStorage.UsernameMap;
    reserved: ReservedStorage.ReservedUsernameSet;
    transfers: TransferService.TransferService;
    pending: Set.Set<Text>;
  };

  public type Purchase = {
    blockIndex: Nat64;
    txId: Types.TxId;
    username: Types.Username;
    price: Nat;
  };

  public func priceOf(name: Types.Username): Nat {
    UsernameValidator.priceFor(name);
  };

  public func treasury(): Principal {
    Principal.fromText(Config.USERNAME_TREASURY);
  };

  // Buys a handle outright. The payment is made first and the name is only
  // assigned once the ledger confirms it, so a failed transfer never hands out
  // a free handle.
  public func purchase(service: UsernameSaleService, caller: Principal, name: Types.Username): async Types.ApiResult<Purchase> {
    switch (UsernameValidator.validate(name)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    let key = UsernameValidator.normalize(name);
    if (ReservedRepo.isReserved(service.reserved, name)) {
      return #err("Username is reserved");
    };
    if (UserRepo.usernameExists(service.usernames, name)) {
      return #err("Username already taken");
    };
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (null) { return #err("User not found") };
      case (?_) {};
    };
    // The ledger call below suspends. Without this lock two buyers could both
    // clear the availability check above and both be charged for one name.
    if (service.pending.contains(key)) {
      return #err("Username purchase already in progress");
    };
    service.pending.add(key);

    let price = UsernameValidator.priceFor(name);
    let destination = AccountHelper.defaultAccount(treasury());
    let memo = saleMemo(name, price, Time.now());

    // Prices are denominated in ICP, so a sale settles on the ICP ledger
    // regardless of which token the buyer was last looking at.
    let result = await TransferService.transferByAccount(service.transfers, caller, Config.ICP_LEDGER_CANISTER_ID, destination, price, ?memo);

    switch (result) {
      case (#err(e)) {
        service.pending.remove(key);
        #err(e);
      };
      case (#ok({ blockIndex; txId })) {
        // Re-checked after the suspension: an ordinary free claim could have
        // taken the name while the payment was in flight.
        if (UserRepo.usernameExists(service.usernames, name)) {
          service.pending.remove(key);
          return #err("Username was claimed while payment was in flight. Payment block " # Nat.toText(Nat64.toNat(blockIndex)) # " -- contact support for a refund.");
        };
        switch (UserRepo.getByPrincipal(service.users, caller)) {
          case (null) {
            service.pending.remove(key);
            #err("User not found");
          };
          case (?user) {
            UserRepo.addAlias(service.usernames, user, name, Time.now());
            service.pending.remove(key);
            #ok({ blockIndex; txId; username = name; price });
          };
        };
      };
    };
  };

  // The ledger memo is capped at 32 bytes, so the fields are packed tight:
  // "@handle 10ICP 2026-08-02" is 24 bytes at the widest (an 8-char handle only
  // ever prices at 1 ICP, so the long name and the long price cannot coincide).
  public func saleMemo(name: Types.Username, price: Nat, now: Int): Text {
    "@" # name # " " # icpWhole(price) # "ICP " # DateTime.toIsoDate(Int.abs(now));
  };

  // Every tier is a whole number of ICP, so no decimal part is printed.
  func icpWhole(e8s: Nat): Text {
    Nat.toText(e8s / 100_000_000);
  };
};
