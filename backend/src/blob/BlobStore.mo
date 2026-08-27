import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Text "mo:core/Text";

module {
  public type Store = {
    var blobs: Map.Map<Text, Blob>;
  };

  public type Service = {
    put: (Text, Blob) -> async ();
    get: Text -> async ?Blob;
    delete: Text -> async ();
  };

  public func emptyStore() : Store {
    { var blobs = Map.empty<Text, Blob>() };
  };

  public func localService(store: Store) : Service {
    {
      put = func(id: Text, data: Blob) : async () {
        Map.add(store.blobs, Text.compare, id, data);
      };
      get = func(id: Text) : async ?Blob {
        Map.get(store.blobs, Text.compare, id)
      };
      delete = func(id: Text) : async () {
        Map.remove(store.blobs, Text.compare, id);
      };
    }
  };
};
