import Types "../../types";
import AdminService "../../services/AdminService";
import MiddlewareAuth "../../middleware/Auth";

mixin (admin: AdminService.AdminService, mwConfig: MiddlewareAuth.Config) {
  public shared ({ caller }) func reserveUsername(name: Text) : async Types.ApiResult<Text> {
    AdminService.reserveUsername(admin, MiddlewareAuth.effectiveCaller(mwConfig, caller), name);
  };

  public shared ({ caller }) func releaseUsername(name: Text) : async Types.ApiResult<Text> {
    AdminService.releaseUsername(admin, MiddlewareAuth.effectiveCaller(mwConfig, caller), name);
  };

  // A query would be served by a single node without consensus, so a malicious
  // replica could hide entries; the reserved list is an authorization decision,
  // so it goes through consensus.
  public shared ({ caller }) func listReservedUsernames() : async Types.ApiResult<[Text]> {
    AdminService.listReservedUsernames(admin, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };
};
