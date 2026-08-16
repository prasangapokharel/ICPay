import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  public func isAnonymous(caller: Principal) : Bool {
    Principal.isAnonymous(caller)
  };

  public func denyAnonymous(caller: Principal) : ?Text {
    if (isAnonymous(caller)) { ?("Anonymous principal not allowed") } else { null }
  };

  public func requireOwner(caller: Principal, owner: Principal) : ?Text {
    if (caller != owner) { ?("Permission denied") } else { null }
  };

  public func requireAny(caller: Principal, allowed: [Principal]) : ?Text {
    for (p in allowed.vals()) {
      if (p == caller) { return null };
    };
    ?("Access denied")
  };
};
