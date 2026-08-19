// backend/src/validators/FeatureValidator.mo
// Pure validation — return ?error message or null if valid.

module {
  public func validateName(name: Text) : ?Text {
    if (name.size() < 2) { return ?"Name too short" };
    if (name.size() > 32) { return ?"Name too long" };
    null;
  };
};
