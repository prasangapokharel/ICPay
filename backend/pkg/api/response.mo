import Text "mo:core/Text";

module {
  public type ApiResult<T> = { #ok: T; #err: Text };

  public func ok<T>(value: T) : ApiResult<T> {
    #ok(value)
  };

  public func err<T>(message: Text) : ApiResult<T> {
    #err(message)
  };

  public func require(condition: Bool, message: Text) : ApiResult<()> {
    if (condition) { #ok(()) } else { #err(message) };
  };

  public func guard<T>(condition: Bool, message: Text, value: T) : ApiResult<T> {
    if (condition) { #ok(value) } else { #err(message) };
  };

  public func mapOk<T, U>(result: ApiResult<T>, f: T -> U) : ApiResult<U> {
    switch (result) {
      case (#ok(v)) #ok(f(v));
      case (#err(e)) #err(e);
    }
  };

  public func flatten<T>(result: ApiResult<ApiResult<T>>) : ApiResult<T> {
    switch (result) {
      case (#ok(inner)) inner;
      case (#err(e)) #err(e);
    }
  };
};
