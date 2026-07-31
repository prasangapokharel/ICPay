import Principal "mo:core/Principal";

module {
  public type Config = {
    devMode: Bool;
    devPrincipal: Principal;
  };

  public func devConfig(): Config {
    { devMode = false; devPrincipal = Principal.anonymous() };
  };

  public func prodConfig(): Config {
    { devMode = false; devPrincipal = Principal.anonymous() };
  };

  // The caller principal is supplied by the replica and cannot be forged, so it
  // is always the identity we act on. devMode is retained only as an explicit
  // opt-in escape hatch and must never be enabled on a shared deployment.
  public func effectiveCaller(config: Config, caller: Principal): Principal {
    if (config.devMode and Principal.isAnonymous(caller)) {
      config.devPrincipal;
    } else { caller };
  };
};
