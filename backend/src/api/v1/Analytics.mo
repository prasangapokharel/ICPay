import Types "../../types";
import AnalyticsService "../../services/AnalyticsService";
import MiddlewareAuth "../../middleware/Auth";

mixin (analytics: AnalyticsService.AnalyticsService, mwConfig: MiddlewareAuth.Config) {
  public shared query ({ caller }) func getUserAnalytics() : async Types.ApiResult<Types.AnalyticsData> {
    AnalyticsService.getUserAnalytics(analytics, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };

  public shared ({ caller }) func exportUserAnalytics() : async Types.ApiResult<Types.AnalyticsExportResult> {
    await AnalyticsService.exportUserAnalytics(analytics, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };
};
