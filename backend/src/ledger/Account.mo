import Principal "mo:core/Principal";
import Nat8 "mo:core/Nat8";
import Blob "mo:core/Blob";
import Types "Types";
import Subaccount "Subaccount";

module {
  public func defaultAccount(owner: Principal): Types.Account {
    { owner; subaccount = null };
  };

  // Custodial deposit account: owned by the wallet canister so the canister can
  // actually spend the funds, with a per-user subaccount to attribute them.
  public func custodialAccount(custodian: Principal, user: Principal): Types.Account {
    { owner = custodian; subaccount = ?Subaccount.fromPrincipal(user) };
  };

  // Canister-owned account under a subaccount that belongs to no user, for funds
  // the platform itself holds. The subaccount is passed in rather than read from
  // config so this layer keeps no dependencies above it.
  public func fixedAccount(custodian: Principal, subaccount: Blob): Types.Account {
    { owner = custodian; subaccount = ?subaccount };
  };

  public func toText(self: Types.Account): Text {
    let ownerText = Principal.toText(self.owner);
    switch (self.subaccount) {
      case (null) { ownerText };
      case (?sub) { ownerText # "?subaccount=" # toHex(sub) };
    };
  };

  public func toAccountIdentifier(self: Types.Account): Text {
    toHex(Principal.toLedgerAccount(self.owner, self.subaccount));
  };

  public func toHex(b: Blob): Text {
    var out = "";
    for (byte in b.values()) {
      out #= nibbleHex(byte / 16) # nibbleHex(byte % 16);
    };
    out;
  };

  func nibbleHex(n: Nat8): Text {
    switch (n) {
      case (0) { "0" }; case (1) { "1" }; case (2) { "2" }; case (3) { "3" };
      case (4) { "4" }; case (5) { "5" }; case (6) { "6" }; case (7) { "7" };
      case (8) { "8" }; case (9) { "9" }; case (10) { "a" }; case (11) { "b" };
      case (12) { "c" }; case (13) { "d" }; case (14) { "e" }; case (_) { "f" };
    };
  };
};
