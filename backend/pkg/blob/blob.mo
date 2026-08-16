import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";

module {
  public func join(left: Blob, right: Blob) : Blob {
    if (left.size() == 0) { return right };
    if (right.size() == 0) { return left };
    Blob.fromArray(Array.concat(Blob.toArray(left), Blob.toArray(right)))
  };

  public func concat(chunks: [Blob]) : Blob {
    if (chunks.size() == 0) { return Blob.fromArray([]) };
    if (chunks.size() == 1) { return chunks[0] };
    Blob.fromArray(Array.flatten(Array.map<Blob, [Nat8]>(chunks, Blob.toArray)))
  };

  public func slice(data: Blob, start: Nat, end: Nat) : Blob {
    if (start >= end or start >= data.size()) {
      return Blob.fromArray([])
    };
    let stop = if (end > data.size()) { data.size() } else { end };
    let bytes = Blob.toArray(data);
    Blob.fromArray(Array.tabulate<Nat8>(stop - start, func(i) { bytes[start + i] }))
  };

  public func take(data: Blob, limit: Nat) : Blob {
    if (limit >= data.size()) { data } else { slice(data, 0, limit) }
  };
};
