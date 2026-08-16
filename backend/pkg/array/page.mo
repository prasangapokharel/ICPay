import Nat "mo:core/Nat";

module {
  public func chunkCount(totalSize: Nat, chunkSize: Nat) : Nat {
    if (chunkSize == 0) { 0 }
    else if (totalSize == 0) { 1 }
    else { (totalSize + chunkSize - 1) / chunkSize }
  };

  public func offsetFor(page: Nat, pageSize: Nat) : Nat {
    page * pageSize
  };

  public func pageCount(total: Nat, pageSize: Nat) : Nat {
    if (pageSize == 0 or total == 0) { 0 }
    else { (total + pageSize - 1) / pageSize }
  };
};
