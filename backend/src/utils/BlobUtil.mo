import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";

/// Blob helpers — prefer Blob over [Nat8] for binary data (4× more compact, less GC).
module {
  /** Join two blobs without an intermediate chunk list. */
  public func join(left : Blob, right : Blob) : Blob {
    if (left.size() == 0) return right;
    if (right.size() == 0) return left;
    Blob.fromArray(Array.concat(Blob.toArray(left), Blob.toArray(right)))
  };

  /** Assemble chunked ingress payloads into one blob (single allocation). */
  public func concat(chunks : [Blob]) : Blob {
    if (chunks.size() == 0) return Blob.fromArray([]);
    if (chunks.size() == 1) return chunks[0];
    var total : Nat = 0;
    for (c in chunks.vals()) { total += c.size() };
    if (total == 0) return Blob.fromArray([]);
    Blob.fromArray(Array.flatten(Array.map<Blob, [Nat8]>(chunks, Blob.toArray)))
  };
};
