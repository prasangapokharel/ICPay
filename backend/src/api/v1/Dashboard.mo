import Types "../../types";
import DashboardService "../../services/DashboardService";
import MiddlewareAuth "../../middleware/Auth";

mixin (dashboard: DashboardService.DashboardService, mwConfig: MiddlewareAuth.Config) {
  public shared ({ caller }) func getDashboard() : async Types.ApiResult<Types.DashboardData> {
    await DashboardService.getDashboard(dashboard, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };
};
