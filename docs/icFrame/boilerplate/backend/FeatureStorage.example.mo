// backend/src/storage/FeatureStorage.mo
// Stable memory factories — types + create functions only.

import Map "mo:core/Map";
import Types "../types";

module {
  public type FeatureMap = Map.Map<Text, Types.Feature>;

  public func createFeatureMap() : FeatureMap {
    Map.empty<Text, Types.Feature>();
  };
};
