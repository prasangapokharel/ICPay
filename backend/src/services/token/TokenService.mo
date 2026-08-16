import Context "Context";
import TypesModule "Types";
import Launch "Launch";
import Wasm "Wasm";
import Query "Query";
import Revenue "Revenue";
import Symbols "Symbols";

module {
  public type TokenService = Context.TokenService;
  public type LedgerInitArgs = TypesModule.LedgerInitArgs;
  public type LedgerArg = TypesModule.LedgerArg;

  public let create = Context.create;

  public let launch = Launch.launch;
  public let ledgerInitArgs = Launch.ledgerInitArgs;

  public let sweepRevenue = Revenue.sweepRevenue;
  public let releaseFailedCanister = Revenue.releaseFailedCanister;
  public let topUpToken = Revenue.topUpToken;

  public let seedReservedSymbols = Symbols.seedReservedSymbols;

  public let getToken = Query.getToken;
  public let getById = Query.getById;
  public let listByUser = Query.listByUser;
  public let listActive = Query.listActive;
  public let registerLaunchedLedgers = Query.registerLaunchedLedgers;
  public let isSymbolAvailable = Query.isSymbolAvailable;

  public let uploadWasmChunk = Wasm.uploadWasmChunk;
  public let sealWasm = Wasm.sealWasm;
  public let resetWasm = Wasm.resetWasm;
  public let isLaunchReady = Wasm.isLaunchReady;
};
