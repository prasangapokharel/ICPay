import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types";

// Adds `verifiedEmail: ?Text` to the User record.
//
// APPLIED on the deploy that ships verified email. After this deploy the live
// canister's stable signature carries `verifiedEmail`, so this migration must
// NOT be wired again on subsequent deploys -- the old shape is gone.
module {
  public type OldUser = {
    id: Types.UserId;
    principal: Principal;
    var username: ?Types.Username;
    var displayName: Text;
    var socialLinks: [Types.SocialLink];
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
        var socialLinks = u.socialLinks;
        var verifiedEmail = null : ?Text;
        createdAt = u.createdAt;
        var updatedAt = u.updatedAt;
      });
    };
    { users = out }
  };
};
