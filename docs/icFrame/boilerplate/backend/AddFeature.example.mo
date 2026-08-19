// backend/src/migrations/AddFeatureField.mo
// Run once on upgrade when stable type shape changes.

import Map "mo:core/Map";
import Principal "mo:core/Principal";
import FeatureStorage "../storage/FeatureStorage";

module {
  // Shape currently in stable memory.
  public type OldFeature = {
    id: Text;
    name: Text;
    owner: Principal;
    createdAt: Int;
  };

  public type OldFeatureMap = Map.Map<Text, OldFeature>;

  public func migrate(old: OldFeatureMap) : FeatureStorage.FeatureMap {
    let next = FeatureStorage.createFeatureMap();
    for ((id, oldFeature) in old.entries()) {
      next.put(id, {
        id = oldFeature.id;
        name = oldFeature.name;
        owner = oldFeature.owner;
        createdAt = oldFeature.createdAt;
        // newField = defaultValue;
      });
    };
    next;
  };
};
