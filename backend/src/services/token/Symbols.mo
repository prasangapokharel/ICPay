import Text "mo:core/Text";
import TokenRepo "../../repositories/TokenRepository";
import Context "Context";

module {
  public func seedReservedSymbols(service: Context.TokenService, symbols: [Text]) {
    for (s in symbols.values()) {
      TokenRepo.reserveSymbol(service.reservedSymbols, s);
    };
  };
};
