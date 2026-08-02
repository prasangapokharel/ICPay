import Types "../../types";
import DashboardService "../../services/DashboardService";
import MiddlewareAuth "../../middleware/Auth";

mixin (dashboard: DashboardService.DashboardService, mwConfig: MiddlewareAuth.Config) {
  public shared query ({ caller }) func getDashboard() : async Types.ApiResult<Types.DashboardData> {
    DashboardService.getDashboard(dashboard, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };
};
