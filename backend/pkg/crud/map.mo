import Map "mo:core/Map";
import Text "mo:core/Text";

module {
  public func getOrErr<K, V>(
    map: Map.Map<K, V>,
    compare: (K, K) -> { #less; #equal; #greater },
    key: K,
    notFound: Text,
  ) : { #ok: V; #err: Text } {
    switch (Map.get(map, compare, key)) {
      case (null) { #err(notFound) };
      case (?value) { #ok(value) };
    }
  };

  public func upsert<K, V>(
    map: Map.Map<K, V>,
    compare: (K, K) -> { #less; #equal; #greater },
    key: K,
    value: V,
  ) {
    switch (Map.get(map, compare, key)) {
      case (null) { Map.add(map, compare, key, value) };
      case (?_) { map.add(key, value) };
    }
  };

  public func removeOrErr<K, V>(
    map: Map.Map<K, V>,
    compare: (K, K) -> { #less; #equal; #greater },
    key: K,
    notFound: Text,
  ) : { #ok: V; #err: Text } {
    switch (Map.get(map, compare, key)) {
      case (null) { #err(notFound) };
      case (?value) {
        map.remove(key);
        #ok(value)
      };
    }
  };

  public func contains<K, V>(
    map: Map.Map<K, V>,
    compare: (K, K) -> { #less; #equal; #greater },
    key: K,
  ) : Bool {
    switch (Map.get(map, compare, key)) {
      case (null) false;
      case (?_) true;
    }
  };
};
