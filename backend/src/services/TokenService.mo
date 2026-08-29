import Token "./token/TokenService";

module {
  public type TokenService = Token.TokenService;
  public type LedgerInitArgs = Token.LedgerInitArgs;
  public type LedgerArg = Token.LedgerArg;

  public let create = Token.create;

  public let launch = Token.launch;
  public let ledgerInitArgs = Token.ledgerInitArgs;

  public let sweepRevenue = Token.sweepRevenue;
  public let releaseFailedCanister = Token.releaseFailedCanister;
  public let topUpToken = Token.topUpToken;

  public let seedReservedSymbols = Token.seedReservedSymbols;

  public let getToken = Token.getToken;
  public let getById = Token.getById;
  public let listByUser = Token.listByUser;
  public let listActive = Token.listActive;
  public let isCustodiedLedger = Token.isCustodiedLedger;
  public let ensureCustodiedLedger = Token.ensureCustodiedLedger;
  public let ensureCustodiedLedgerAsync = Token.ensureCustodiedLedgerAsync;
  public let registerLaunchedLedgers = Token.registerLaunchedLedgers;
  public let isSymbolAvailable = Token.isSymbolAvailable;

  public let uploadWasmChunk = Token.uploadWasmChunk;
  public let sealWasm = Token.sealWasm;
  public let resetWasm = Token.resetWasm;
  public let isLaunchReady = Token.isLaunchReady;
};
