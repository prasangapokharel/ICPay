import Types "../../types";
import AuthService "../../services/AuthService";
import MiddlewareAuth "../../middleware/Auth";

mixin (auth: AuthService.AuthService, mwConfig: MiddlewareAuth.Config) {
  public shared ({ caller }) func login() : async Types.AuthResult {
    AuthService.login(auth, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };

  public shared ({ caller }) func register(username: Text) : async Types.AuthResult {
    AuthService.register(auth, MiddlewareAuth.effectiveCaller(mwConfig, caller), username);
  };

  public shared query ({ caller }) func getProfile() : async ?Types.UserPublic {
    AuthService.getProfile(auth, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };
};
