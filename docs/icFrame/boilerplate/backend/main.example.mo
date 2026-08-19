// backend/src/main.mo — skeleton
// Rename domains, add storage maps, wire your services.

import Principal "mo:core/Principal";
import HealthApi "api/v1/Health";
import FeatureStorage "storage/FeatureStorage";
import FeatureService "services/FeatureService";
import FeatureApi "api/v1/Feature";
import MiddlewareAuth "middleware/Auth";

persistent actor self {
  transient let mwConfig = MiddlewareAuth.prodConfig();

  // Stable — survives upgrades. Never mark storage transient.
  let features = FeatureStorage.createFeatureMap();

  // Transient — rebuilt each upgrade from storage refs.
  transient let feature = FeatureService.create(features);

  // Health is stateless — no service deps.
  public let Health = HealthApi();
  public let Feature = FeatureApi(feature, mwConfig);

  // system func preupgrade() { ... serialize if needed ... }
  // system func postupgrade() { ... run migrations ... }
};
