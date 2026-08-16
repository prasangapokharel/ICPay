import Text "mo:core/Text";

module {
  public type Status = {
    code: Nat;
    reason: Text;
  };

  public func ok() : Status { { code = 200; reason = "OK" } };
  public func created() : Status { { code = 201; reason = "Created" } };
  public func noContent() : Status { { code = 204; reason = "No Content" } };
  public func badRequest() : Status { { code = 400; reason = "Bad Request" } };
  public func unauthorized() : Status { { code = 401; reason = "Unauthorized" } };
  public func forbidden() : Status { { code = 403; reason = "Forbidden" } };
  public func notFound() : Status { { code = 404; reason = "Not Found" } };
  public func methodNotAllowed() : Status { { code = 405; reason = "Method Not Allowed" } };
  public func conflict() : Status { { code = 409; reason = "Conflict" } };
  public func tooManyRequests() : Status { { code = 429; reason = "Too Many Requests" } };
  public func internalError() : Status { { code = 500; reason = "Internal Server Error" } };
  public func notImplemented() : Status { { code = 501; reason = "Not Implemented" } };
  public func serviceUnavailable() : Status { { code = 503; reason = "Service Unavailable" } };

  public func isSuccess(status: Status) : Bool {
    status.code >= 200 and status.code < 300
  };
};
