module {
  public type Result<T, E> = { #ok: T; #err: E };

  public func ok<T, E>(value: T) : Result<T, E> {
    #ok(value)
  };

  public func err<T, E>(error: E) : Result<T, E> {
    #err(error)
  };

  public func isOk<T, E>(result: Result<T, E>) : Bool {
    switch (result) {
      case (#ok(_)) true;
      case (#err(_)) false;
    }
  };

  public func unwrapOr<T, E>(result: Result<T, E>, default: T) : T {
    switch (result) {
      case (#ok(v)) v;
      case (#err(_)) default;
    }
  };

  public func mapOk<T, U, E>(result: Result<T, E>, f: T -> U) : Result<U, E> {
    switch (result) {
      case (#ok(v)) #ok(f(v));
      case (#err(e)) #err(e);
    }
  };

  public func mapErr<T, E, F>(result: Result<T, E>, f: E -> F) : Result<T, F> {
    switch (result) {
      case (#ok(v)) #ok(v);
      case (#err(e)) #err(f(e));
    }
  };

  public func andThen<T, U, E>(result: Result<T, E>, f: T -> Result<U, E>) : Result<U, E> {
    switch (result) {
      case (#ok(v)) f(v);
      case (#err(e)) #err(e);
    }
  };
};
