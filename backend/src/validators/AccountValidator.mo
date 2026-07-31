import Principal "mo:core/Principal";

module {
  public func validatePrincipal(p: Principal): ?Text {
    if (Principal.isAnonymous(p)) {
      ?"Invalid principal (anonymous)";
    } else {
      null;
    };
  };

  public func validateAccountId(id: Text): ?Text {
    if (id.size() != 64) {
      return ?"Invalid account identifier length (expected 64 hex chars)";
    };
    null;
  };
};
