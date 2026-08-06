import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Types "../types";
import TokenModel "../models/Token";
import TokenStorage "../storage/TokenStorage";
import TokenValidator "../validators/TokenValidator";

module {
  // Written before the canister exists, so the row is indexed by internal id and
  // by user only. tokensByLedger is filled by setLedgerId once the CMC answers.
  public func createPending(
    tokens: TokenStorage.TokenMap,
    byUser: TokenStorage.TokensByUser,
    id: Types.TokenId,
    userId: Types.UserId,
    creator: Principal,
    name: Text,
    symbol: Text,
    description: Text,
    logo: ?Text,
    website: ?Text,
    telegram: ?Text,
    twitter: ?Text,
    decimals: Nat8,
    totalSupply: Nat,
    immutable: Bool,
    paymentBlockIndex: Nat64,
    now: Int,
  ): Types.Token {
    let token = TokenModel.new(
      id, userId, creator, name, symbol, description,
      logo, website, telegram, twitter,
      decimals, totalSupply, immutable, paymentBlockIndex, now,
    );
    tokens.add(id, token);
    userTokens(byUser, userId).add(id);
    token;
  };

  // Called the instant the CMC returns, not at markActive: a create that
  // succeeds followed by an install that traps must still leave the canister id
  // recorded, or the user's cycles are stranded in a canister nothing points at.
  public func setLedgerId(
    byLedger: TokenStorage.TokensByLedger,
    token: Types.Token,
    canisterId: Text,
  ) {
    TokenModel.setLedgerId(token, canisterId);
    byLedger.add(canisterId, token.id);
  };

  public func getById(tokens: TokenStorage.TokenMap, id: Types.TokenId): ?Types.Token {
    tokens.get(id);
  };

  public func findByLedgerId(
    tokens: TokenStorage.TokenMap,
    byLedger: TokenStorage.TokensByLedger,
    canisterId: Text,
  ): ?Types.Token {
    switch (byLedger.get(canisterId)) {
      case (?id) { tokens.get(id) };
      case (null) { null };
    };
  };

  func userTokens(
    byUser: TokenStorage.TokensByUser,
    userId: Types.UserId,
  ): List.List<Types.TokenId> {
    switch (byUser.get(userId)) {
      case (?list) { list };
      case (null) {
        let list = List.empty<Types.TokenId>();
        byUser.add(userId, list);
        list;
      };
    };
  };

  func userView(
    byUser: TokenStorage.TokensByUser,
    userId: Types.UserId,
  ): List.List<Types.TokenId> {
    switch (byUser.get(userId)) {
      case (?list) { list };
      case (null) { List.empty<Types.TokenId>() };
    };
  };

  // Newest-first, stopping once the page is filled, so the cost is bounded by
  // (offset + limit) rather than by anyone else's launch volume.
  public func getByUser(
    tokens: TokenStorage.TokenMap,
    byUser: TokenStorage.TokensByUser,
    userId: Types.UserId,
    limit: Nat,
    offset: Nat,
  ): [Types.Token] {
    let page = List.empty<Types.Token>();
    var seen = 0;
    label scan for (id in userView(byUser, userId).reverseValues()) {
      if (seen >= offset) {
        switch (tokens.get(id)) { case (?t) { page.add(t) }; case (null) {} };
        if (page.size() >= limit) { break scan };
      };
      seen += 1;
    };
    List.toArray(page);
  };

  public func getUserTokenCount(
    byUser: TokenStorage.TokensByUser,
    userId: Types.UserId,
  ): Nat {
    userView(byUser, userId).size();
  };

  // A pending launch is still holding its symbol, so it counts as taken: two
  // launches racing on one symbol must not both be allowed to reach the ledger.
  public func symbolTaken(
    tokens: TokenStorage.TokenMap,
    reserved: TokenStorage.ReservedSymbolSet,
    symbol: Text,
  ): Bool {
    let key = TokenValidator.normalizeSymbol(symbol);
    if (reserved.contains(key)) { return true };
    for (token in tokens.values()) {
      if (TokenValidator.normalizeSymbol(token.symbol) == key) {
        switch (token.status) {
          case (#failed(_)) {};
          case (_) { return true };
        };
      };
    };
    false;
  };

  public func reserveSymbol(reserved: TokenStorage.ReservedSymbolSet, symbol: Text) {
    reserved.add(TokenValidator.normalizeSymbol(symbol));
  };

  public func isReservedSymbol(reserved: TokenStorage.ReservedSymbolSet, symbol: Text): Bool {
    reserved.contains(TokenValidator.normalizeSymbol(symbol));
  };

  public func listReservedSymbols(reserved: TokenStorage.ReservedSymbolSet): [Text] {
    let names = List.empty<Text>();
    for (name in reserved.values()) { names.add(name) };
    List.toArray(names);
  };

  // Scanned rather than counted. Status is mutated in place by markActive and
  // markFailed, so a running counter would drift the first time a call site was
  // added without touching it. This runs in a query, which is not billed.
  public func countByStatus(tokens: TokenStorage.TokenMap): { pending: Nat; active: Nat; failed: Nat } {
    var pending = 0;
    var active = 0;
    var failed = 0;
    for (token in tokens.values()) {
      switch (token.status) {
        case (#pending) { pending += 1 };
        case (#active) { active += 1 };
        case (#failed(_)) { failed += 1 };
      };
    };
    { pending; active; failed };
  };

  public func listActive(tokens: TokenStorage.TokenMap, limit: Nat, offset: Nat): [Types.Token] {
    let page = List.empty<Types.Token>();
    var seen = 0;
    label scan for (token in tokens.values()) {
      if (token.status == #active) {
        if (seen >= offset) {
          page.add(token);
          if (page.size() >= limit) { break scan };
        };
        seen += 1;
      };
    };
    List.toArray(page);
  };
};
