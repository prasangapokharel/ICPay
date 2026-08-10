import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types";

// Adds `socialLinks: [SocialLink]` to the User record.
//
// APPLIED on the deploy that ships SocialLink. After this deploy the live
// canister's stable signature carries `socialLinks`, so this migration must
// NOT be wired again on subsequent deploys -- the old shape is gone.
module {
  // The User record exactly as serialised before this migration.
  public type OldUser = {
    id: Types.UserId;
    principal: Principal;
    var username: ?Types.Username;
    var displayName: Text;
    createdAt: Int;
    var updatedAt: Int;
  };

  public func migration(
    old: { users: Map.Map<Principal, OldUser> }
  ): { users: Map.Map<Principal, Types.User> } {
    let out = Map.empty<Principal, Types.User>();
    for ((p, u) in old.users.entries()) {
      out.add(p, {
        id = u.id;
        principal = u.principal;
        var username = u.username;
        var displayName = u.displayName;
        var socialLinks : [Types.SocialLink] = [];
        createdAt = u.createdAt;
        var updatedAt = u.updatedAt;
      });
    };
    { users = out }
  };
};
