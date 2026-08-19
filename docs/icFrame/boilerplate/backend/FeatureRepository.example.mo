// backend/src/repositories/FeatureRepository.mo
// Data access only — no validation, no ledger calls.

import Text "mo:core/Text";
import Types "../types";
import FeatureStorage "../storage/FeatureStorage";

module {
  public func getById(storage: FeatureStorage.FeatureMap, id: Text) : ?Types.Feature {
    storage.get(id);
  };

  public func save(storage: FeatureStorage.FeatureMap, feature: Types.Feature) : () {
    storage.put(feature.id, feature);
  };

  public func remove(storage: FeatureStorage.FeatureMap, id: Text) : () {
    storage.delete(id);
  };
};
