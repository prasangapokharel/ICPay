// backend/src/services/FeatureService.mo
// Business logic lives here.

import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types";
import FeatureRepo "../repositories/FeatureRepository";
import FeatureStorage "../storage/FeatureStorage";
import FeatureValidator "../validators/FeatureValidator";

module {
  public func create(storage: FeatureStorage.FeatureMap) : FeatureService {
    { storage };
  };

  public type FeatureService = {
    storage: FeatureStorage.FeatureMap;
  };

  public func createFeature(
    service: FeatureService,
    caller: Principal,
    name: Text,
  ) : async Types.ApiResult<Types.Feature> {
    switch (FeatureValidator.validateName(name)) {
      case (?err) { return #err(err) };
      case (null) {};
    };
    let feature : Types.Feature = {
      id = Principal.toText(caller);
      name = name;
      owner = caller;
      createdAt = Time.now();
    };
    FeatureRepo.save(service.storage, feature);
    #ok(feature);
  };

  public func getFeature(service: FeatureService, id: Text) : ?Types.Feature {
    FeatureRepo.getById(service.storage, id);
  };
};
