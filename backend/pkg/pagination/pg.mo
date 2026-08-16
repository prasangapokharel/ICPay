import Nat "mo:core/Nat";
import Array "mo:core/Array";

module {
  public type Page<T> = {
    items: [T];
    total: Nat;
    page: Nat;
    pageSize: Nat;
  };

  public func clampSize(requested: Nat, defaultSize: Nat, maxSize: Nat) : Nat {
    if (requested == 0) {
      defaultSize
    } else if (requested > maxSize) {
      maxSize
    } else {
      requested
    }
  };

  public func slice<T>(
    items: [T],
    page: Nat,
    pageSize: Nat,
    defaultSize: Nat,
    maxSize: Nat,
  ) : Page<T> {
    let limit = clampSize(pageSize, defaultSize, maxSize);
    let total = items.size();
    let offset = page * limit;
    if (offset >= total) {
      { items = []; total; page; pageSize = limit }
    } else {
      let end = if (offset + limit > total) { total } else { offset + limit };
      let chunk = Array.tabulate<T>(end - offset, func(i) { items[offset + i] });
      { items = chunk; total; page; pageSize = limit }
    }
  };
};
