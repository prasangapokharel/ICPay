import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

// Dedicated blob store for ICPay Cloud file bytes. Only the wallet backend
// canister may write or delete; reads are open query for the backend to serve.
persistent actor class BlobStore(initAuthorized: Principal) {
  var authorized = initAuthorized;
  var blobs = Map.empty<Text, Blob>();

  func assertWriter(caller: Principal) {
    if (not Principal.equal(caller, authorized)) {
      assert false;
    };
  };

  public shared ({ caller }) func putBlob(id: Text, data: Blob) : async () {
    assertWriter(caller);
    blobs.add(id, data);
  };

  public shared query func getBlob(id: Text) : async ?Blob {
    blobs.get(id)
  };

  public shared composite query func fetchBlob(id: Text) : async ?Blob {
    blobs.get(id)
  };

  public shared ({ caller }) func deleteBlob(id: Text) : async Bool {
    assertWriter(caller);
    switch (blobs.get(id)) {
      case (null) false;
      case (?_) {
        blobs.remove(id);
        true
      };
    }
  };

  public shared query func stats() : async { count: Nat; bytes: Nat } {
    var count : Nat = 0;
    var bytes : Nat = 0;
    for (data in Map.values(blobs)) {
      count += 1;
      bytes += data.size();
    };
    { count; bytes }
  };

  public shared ({ caller }) func setAuthorized(principal: Principal) : async () {
    assertWriter(caller);
    authorized := principal;
  };
};
