import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import BlobStore "BlobStore";

module {
  public type Actor = actor {
    putBlob: shared (Text, Blob) -> async ();
    getBlob: shared query (Text) -> async ?Blob;
    fetchBlob: shared composite query (Text) -> async ?Blob;
    deleteBlob: shared (Text) -> async Bool;
    stats: shared query () -> async { count: Nat; bytes: Nat };
  };

  public func connect(canisterId: Principal) : Actor {
    actor (Principal.toText(canisterId)) : Actor
  };

  public func service(canisterId: Principal) : BlobStore.Service {
    let remote = actor (Principal.toText(canisterId)) : Actor;
    {
      put = func(id: Text, data: Blob) : async () { await remote.putBlob(id, data) };
      get = func(id: Text) : async ?Blob { await remote.getBlob(id) };
      delete = func(id: Text) : async () { ignore await remote.deleteBlob(id) };
    }
  };
};
