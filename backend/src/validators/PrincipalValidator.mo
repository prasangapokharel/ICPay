import Principal "mo:core/Principal";

module {
  public func validate(p: Principal): ?Text {
    if (Principal.isAnonymous(p)) {
      ?"Anonymous principal not allowed";
    } else {
      null;
    };
  };
};
