import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Types "../types";

module {
  public type TokenMap = Map.Map<Types.TokenId, Types.Token>;

  // Canister id -> internal id. The canister id cannot key the primary map
  // because it does not exist when the #pending row is written, but every public
  // lookup arrives with one, so the reverse index keeps that O(1).
  public type TokensByLedger = Map.Map<Text, Types.TokenId>;

  // Ids, not tokens: the row itself is mutated in place by markActive/markFailed,
  // and a second copy would diverge the first time one of those runs.
  public type TokensByUser = Map.Map<Types.UserId, List.List<Types.TokenId>>;

  // Symbols nobody may launch under. Seeded from CHAIN_KEY_LEDGERS at init and
  // extendable by a controller, so a squatter cannot mint a token called "ICP".
  public type ReservedSymbolSet = Set.Set<Text>;

  public func createTokenMap(): TokenMap { Map.empty<Types.TokenId, Types.Token>() };
  public func createTokensByLedger(): TokensByLedger { Map.empty<Text, Types.TokenId>() };
  public func createTokensByUser(): TokensByUser {
    Map.empty<Types.UserId, List.List<Types.TokenId>>();
  };
  public func createReservedSymbolSet(): ReservedSymbolSet { Set.empty<Text>() };
};
