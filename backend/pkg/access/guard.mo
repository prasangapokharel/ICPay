import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Caller "../principal/caller";

module {
  public type ApiResult<T> = { #ok: T; #err: Text };

  public func requireAuth(caller: Principal) : ApiResult<()> {
    switch (Caller.denyAnonymous(caller)) {
      case (null) { #ok(()) };
      case (?msg) { #err(msg) };
    }
  };

  public func requireOwner(caller: Principal, owner: Principal) : ApiResult<()> {
    switch (Caller.requireOwner(caller, owner)) {
      case (null) { #ok(()) };
      case (?msg) { #err(msg) };
    }
  };
};
