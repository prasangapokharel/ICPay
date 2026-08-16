module {
  public func getOr<T>(value: ?T, default: T) : T {
    switch (value) {
      case (null) default;
      case (?v) v;
    }
  };

  public func mapOr<T, U>(value: ?T, default: U, f: T -> U) : U {
    switch (value) {
      case (null) default;
      case (?v) f(v);
    }
  };

  public func toResult<T>(value: ?T, err: Text) : { #ok: T; #err: Text } {
    switch (value) {
      case (null) #err(err);
      case (?v) #ok(v);
    }
  };

  public func isSome<T>(value: ?T) : Bool {
    switch (value) {
      case (null) false;
      case (?_) true;
    }
  };
};
