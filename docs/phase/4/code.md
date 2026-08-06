# Phase 4 — reference implementations

Companion to [`here.md`](here.md), which holds the decisions. This file is the
code, one section per file, in the order of the build.

**Everything here is `mo:core` 2.5.0.** This project has zero `mo:base` imports in
`src/`. The vendored reference docs and `docs/dashabord.dfninyty/token/*` still use
`mo:base` and `ExperimentalCycles` — do not copy those imports.

Three constants were marked VERIFY in earlier drafts. Two are now settled: the CMC
id is the one `skills/icpay-ops` already uses, and both memos are ASCII read
little-endian, checkable with a calculator. **The CMC destination subaccount is the
one thing left** — see the resolution procedure under `createCanister`.

---

## `config/Config.mo`

Rename `USERNAME_TREASURY` → `TREASURY`. **Two call sites, both backend:**
`Config.mo:29` (the declaration) and `UsernameSaleService.mo:53` (`treasury()`).
Nothing in `frontend/` references it — verified by grep. Compile-time only.

Add:

```motoko
// Launch economics. Both denominated in ICP e8s: the fee is what the user pays,
// the allocation is the slice of it spent on cycles for the child canister. The
// remainder is revenue.
public let LAUNCH_FEE: Nat = 500_000_000;              // 5 ICP
public let LAUNCH_CYCLE_ALLOCATION: Nat = 200_000_000; // 2 ICP

// A year of frozen-but-recoverable runway instead of the ~30 day default. Costs
// nothing -- these cycles are reserved, not spent -- and an immutable token that
// runs to zero is gone permanently, so the window is the only safety net. Only
// affordable because the allocation is 2 ICP: a year of reserve is ~1.4T, which
// would freeze a 2T canister almost on arrival.
public let TOKEN_FREEZING_THRESHOLD: Nat = 31_536_000;    // seconds

// Refuse a launch below this. The wallet's own survival outranks any one launch.
public let MIN_CYCLE_RESERVE: Nat = 5_000_000_000_000;

public let MAX_TOKEN_NAME_LENGTH: Nat = 20;
public let MAX_TOKEN_SYMBOL_LENGTH: Nat = 10;
public let MAX_TOKEN_DESCRIPTION_LENGTH: Nat = 256;
public let MAX_TOKEN_LINK_LENGTH: Nat = 200;
public let MAX_TOKEN_LOGO_BYTES: Nat = 32_768;

// Same CMC the ops tooling already talks to for the XDR rate -- see
// skills/icpay-ops, which names this canister for get_icp_xdr_conversion_rate.
public let CMC_CANISTER_ID: Text = "rkp4c-7iaaa-aaaaa-aaaca-cai";
public let MANAGEMENT_CANISTER_ID: Text = "aaaaa-aa";

// Fixed 32-byte subaccount of this canister where launch fees land. Revenue must
// arrive somewhere the canister can spend from: TREASURY is a plain principal,
// so paying the CMC directly out of it is impossible and no failed launch could
// be refunded.
public let REVENUE_SUBACCOUNT: Blob = "\52\45\56\45\4e\55\45\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00";
```

---

## `ledger/Cmc.mo`

Narrow interface, following `SnsWasm.mo`: declare only what this canister calls.
The CMC's real interface is NNS machinery we have no business touching.

```motoko
import Nat64 "mo:core/Nat64";

module {
  public type NotifyCreateCanisterArg = {
    block_index: Nat64;
    controller: Principal;
    subnet_type: ?Text;
    subnet_selection: ?();
    settings: ?();
  };

  public type NotifyTopUpArg = { block_index: Nat64; canister_id: Principal };

  public type NotifyError = {
    #Refunded: { reason: Text; block_index: ?Nat64 };
    #InvalidTransaction: Text;
    #Other: { error_code: Nat64; error_message: Text };
    #Processing;
    #TransactionTooOld: Nat64;
  };

  public type Cmc = actor {
    notify_create_canister: shared NotifyCreateCanisterArg
      -> async { #Ok: Principal; #Err: NotifyError };
    notify_top_up: shared NotifyTopUpArg
      -> async { #Ok: Nat; #Err: NotifyError };
  };

  // ASCII "CREA" and "TPUP" read little-endian, which is how the CMC decodes the
  // memo field. Confirmed arithmetically: b"CREA" = 43 52 45 41, reversed =
  // 0x41455243. The CMC rejects a transfer carrying the wrong one, so a mistake
  // here fails loudly rather than losing funds.
  public let MEMO_CREATE_CANISTER: Nat64 = 0x41455243;  // "CREA"
  public let MEMO_TOP_UP_CANISTER: Nat64 = 0x50555054;  // "TPUP"

  public func cmc(): Cmc { actor (Config.CMC_CANISTER_ID) };
}
```

The destination subaccount for both transfers is the CMC's account derived from
the *target principal* — our own canister id for a create, the token's id for a
top-up. Confirm the derivation in the spike; getting it wrong sends ICP to an
unowned account.

---

## `ledger/Management.mo`

```motoko
module {
  public type CanisterId = { canister_id: Principal };

  public type ChunkHash = { hash: Blob };

  public type InstallChunkedCodeArgs = {
    mode: { #install; #reinstall; #upgrade };
    target_canister: Principal;
    store_canister: ?Principal;      // ours -- chunks live here, uploaded once
    chunk_hashes_list: [ChunkHash];
    wasm_module_hash: Blob;
    arg: Blob;
    sender_canister_version: ?Nat64;
  };

  public type UpdateSettingsArgs = {
    canister_id: Principal;
    settings: {
      controllers: ?[Principal];
      compute_allocation: ?Nat;
      memory_allocation: ?Nat;
      freezing_threshold: ?Nat;
    };
  };

  public type Management = actor {
    upload_chunk: shared { canister_id: Principal; chunk: Blob } -> async ChunkHash;
    stored_chunks: shared CanisterId -> async [ChunkHash];
    clear_chunk_store: shared CanisterId -> async ();
    install_chunked_code: shared InstallChunkedCodeArgs -> async ();
    update_settings: shared UpdateSettingsArgs -> async ();
  };

  public func mgmt(): Management { actor ("aaaaa-aa") };
}
```

**`delete_canister` and `uninstall_code` are deliberately absent.** An interface
that does not declare them cannot be made to call them by a later bug.

---

## `services/TokenWasmService.mo`

The chunk store is what keeps a launch at four calls. Upload happens once, by a
controller; launches reference the chunks by hash forever after.

```motoko
// Chunk hashes only -- the bytes live in the management canister's chunk store,
// keyed by our canister id. Re-uploading per launch would add a call per chunk
// to every single launch for a wasm that never changes.
public type TokenWasmStore = {
  var chunkHashes: [Blob];
  var moduleHash: ?Blob;
  var uploadedAt: Int;
};

public func uploadChunk(store: TokenWasmStore, self: Principal, chunk: Blob): async Blob {
  let h = await Management.mgmt().upload_chunk({ canister_id = self; chunk });
  store.chunkHashes := Array.concat(store.chunkHashes, [h.hash]);
  h.hash;
};

// Called once after the last chunk. Until a module hash is sealed, launching is
// refused: "we deploy the audited wasm" is an unverified claim without it.
public func seal(store: TokenWasmStore, expectedHash: Blob): Result<(), Text> {
  if (store.chunkHashes.size() == 0) return #err("No chunks uploaded");
  store.moduleHash := ?expectedHash;
  #ok(());
};

public func isReady(store: TokenWasmStore): Bool {
  store.moduleHash != null and store.chunkHashes.size() > 0;
};
```

`stored_chunks` exists to reconcile our recorded hashes against the management
canister's view after an upgrade. Call it from a controller endpoint, never from
the launch path.

---

## `services/AnalyticsService.mo`

**There is no counter.** No `var tokenCount`, no increment on success.

A counter is a second source of truth for a fact the storage already holds. It
drifts: increment on a `#failed` launch and it overcounts, forget one path and it
undercounts, and once it disagrees with the map nothing tells you which is right.
`Map.size` is O(1) on `mo:core` — the count is already free and cannot be wrong.

The same reasoning that put `tokensByUser` in from commit one applies here: the
per-user count is that list's size, not a walk over the global map.

```motoko
module {
  public func create(tokens: TokenStorage.TokenStorage, users: UserStorage.UserMap): AnalyticsService {
    { tokens; users };
  };

  public type AnalyticsService = {
    tokens: TokenStorage.TokenStorage;
    users: UserStorage.UserMap;
  };

  public type PlatformStats = { totalUsers: Nat; tokensCreated: Nat; creators: Nat };
  public type UserStats = { tokensCreated: Nat };

  // Derived, never incremented: a counter kept alongside the map is a second
  // source of truth that drifts the first time a launch fails halfway.
  public func platform(service: AnalyticsService): PlatformStats {
    {
      // users is keyed by principal, so this is one entry per person. Counting
      // the username map instead would count a renamer once per handle they have
      // ever held, and miss every user who never claimed one.
      totalUsers = Map.size(service.users);
      tokensCreated = TokenRepo.countActive(service.tokens);
      creators = Map.size(service.tokens.tokensByUser);
    };
  };

  public func forUser(service: AnalyticsService, userId: Types.UserId): UserStats {
    { tokensCreated = TokenRepo.countByUser(service.tokens, userId) };
  };

  // Resolving the caller belongs here, not in the mixin: no api/v1 file touches
  // a repository, and UserService has no requireUserId helper to borrow.
  public func forCaller(service: AnalyticsService, caller: Principal): Types.ApiResult<UserStats> {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?user) #ok(forUser(service, user.id));
      case null #err("User not found");
    };
  };
};
```

```motoko
// TokenRepository -- both O(1) or O(user's tokens), never a global scan.
public func countByUser(storage: TokenStorage, userId: Types.UserId): Nat {
  switch (storage.tokensByUser.get(userId)) {
    case (?ids) ids.size();
    case null 0;
  };
};

// #pending and #failed rows stay in the map as payment evidence, so a raw
// Map.size would report launches that never produced a canister.
public func countActive(storage: TokenStorage): Nat {
  var n = 0;
  for (t in Map.values(storage.tokens)) { if (t.status == #active) n += 1 };
  n;
};
```

`countActive` is the one scan here. It is bounded by total tokens launched
platform-wide and runs in a query, which the IC does not bill. If that set ever
grows past the point where the scan matters, the fix is a `#active` index — not a
counter.

---

## `api/v1/Analytics.mo`

Both endpoints are queries. Free, and no update path can desync them from the
storage they read.

```motoko
import Types "../../types";
import AnalyticsService "../../services/AnalyticsService";
import MiddlewareAuth "../../middleware/Auth";

mixin (analytics: AnalyticsService.AnalyticsService, mwConfig: MiddlewareAuth.Config) {
  public shared query func getPlatformStats() : async AnalyticsService.PlatformStats {
    AnalyticsService.platform(analytics);
  };

  public shared query ({ caller }) func getMyStats() : async Types.ApiResult<AnalyticsService.UserStats> {
    AnalyticsService.forCaller(analytics, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };
};
```

`getPlatformStats` is unauthenticated on purpose — "N tokens created on ICPay" is
a public number, and gating it would only cost a caller lookup. `getMyStats`
resolves the caller because a user's own count is theirs alone.

Wire in `main.mo` beside the others:

```motoko
transient let analyticsService = AnalyticsService.create(tokenStorage, users);
include AnalyticsApi(analyticsService, mwConfig);
```

The service holds a reference to the same `tokenStorage` the launch path writes
and the same `users` map registration writes, so every number moves the instant
the underlying data does. Nothing to keep in sync.

Three numbers, three meanings — worth keeping straight:

| | Source | Counts |
|---|---|---|
| `totalUsers` | `users` | everyone registered, handle or not |
| `creators` | `tokensByUser` | users who launched at least one token |
| `tokensCreated` | `tokens`, `#active` only | launches that produced a canister |

---

## `models/Token.mo`

`types.mo` gains `public type TokenId = Text;` beside the existing `UserId` and
`TxId` (`types.mo:5`, `:7`).

```motoko
public type TokenStatus = { #pending; #active; #failed };

public type Token = {
  // Internal, assigned before the canister exists. The canister id cannot be the
  // key: the #pending row is written before creation, and if the install traps
  // with no row to update, a live canister holding the user's cycles is orphaned
  // with nothing pointing at it.
  id: Types.TokenId;
  userId: Types.UserId;
  creator: Principal;
  name: Text;
  symbol: Text;
  description: Text;
  logo: ?Text;               // data URI, <= 32 KB
  website: ?Text;
  telegram: ?Text;
  twitter: ?Text;
  decimals: Nat8;
  totalSupply: Nat;
  immutable: Bool;
  paymentBlockIndex: Nat64;
  createdAt: Int;
  var status: TokenStatus;
  // Filled at markActive. Also set when creation succeeded but a later step
  // trapped, which is what makes that failure retryable instead of a refund.
  var ledgerId: ?Text;
  var moduleHash: ?Blob;
  // What the CMC actually minted, read once after creation. We cannot read the
  // live balance of a canister we do not control, so this is a record of what was
  // funded, never a current reading.
  var cyclesFunded: ?Nat;
  // Declared now though Phase 5 fills it: adding a field to an already-persisted
  // record triggers M0170 and forces a migration.
  var poolId: ?Text;
};
```

---

## `storage/TokenStorage.mo`

```motoko
public type TokenMap = Map.Map<Types.TokenId, Types.Token>;
public type TokensByLedger = Map.Map<Text, Types.TokenId>;   // canister id -> id
public type TokensByUser = Map.Map<Types.UserId, List.List<Types.TokenId>>;
public type ReservedSymbolSet = Set.Set<Text>;

public func empty(): TokenStorage = {
  tokens = Map.empty<Types.TokenId, Types.Token>();
  tokensByLedger = Map.empty<Text, Types.TokenId>();
  tokensByUser = Map.empty<Types.UserId, List.List<Types.TokenId>>();
  reservedSymbols = Set.empty<Text>();
};
```

`id` comes from the same `nextId: () -> Text` generator `TransferService` already
takes as a constructor argument (`TransferService.mo:31`) — a transaction row has
the identical problem of needing a key before the ledger has assigned one.

`tokensByLedger` is written at `markActive`, so `getToken(canisterId)` stays O(1)
without making the canister id load-bearing before it exists.

`tokensByUser` ships in the same commit as `tokens`. `getUserTxCount` once walked
every row to render one page; that is a correctness cliff, not a slow query, and
it is not being reintroduced.

Storage must **not** be `transient` — in a persistent actor that opts out of
orthogonal persistence and the data is gone on upgrade.

---

## `validators/TokenValidator.mo`

Pure. Returns `?Text` — `null` is valid, `?msg` is the error — matching
`UsernameValidator`.

```motoko
public func validate(p: LaunchParams): ?Text {
  if (p.name.size() == 0 or p.name.size() > Config.MAX_TOKEN_NAME_LENGTH)
    return ?("Name must be 1-" # Nat.toText(Config.MAX_TOKEN_NAME_LENGTH) # " characters");
  if (p.description.size() > Config.MAX_TOKEN_DESCRIPTION_LENGTH)
    return ?"Description too long";
  switch (validateSymbol(p.symbol)) { case (?e) return ?e; case null {} };
  switch (validateLink(p.website)) { case (?e) return ?e; case null {} };
  switch (validateLink(p.telegram)) { case (?e) return ?e; case null {} };
  switch (validateLink(p.twitter)) { case (?e) return ?e; case null {} };
  switch (validateLogo(p.logo)) { case (?e) return ?e; case null {} };
  if (p.initialBuyE8s > 0)
    return ?"Initial buy arrives with trading in a later release";
  null;
};

public func normalizeSymbol(s: Text): Text { Text.toUpper(s) };

public func validateSymbol(s: Text): ?Text {
  let up = normalizeSymbol(s);
  if (up.size() == 0 or up.size() > Config.MAX_TOKEN_SYMBOL_LENGTH)
    return ?"Symbol must be 1-10 characters";
  for (c in up.chars()) {
    if (not ((c >= 'A' and c <= 'Z') or (c >= '0' and c <= '9')))
      return ?"Symbol may contain only letters and digits";
  };
  null;
};

// These render as clickable links. Without a scheme check `javascript:` is XSS
// and anything else is a phishing vector, so the check belongs here and not only
// in the form.
public func validateLink(link: ?Text): ?Text {
  switch (link) {
    case null null;
    case (?l) {
      if (l.size() == 0) return null;
      if (l.size() > Config.MAX_TOKEN_LINK_LENGTH) return ?"Link too long";
      if (not Text.startsWith(l, #text "https://")) return ?"Links must start with https://";
      null;
    };
  };
};

public func validateLogo(logo: ?Text): ?Text {
  switch (logo) {
    case null null;
    case (?l) {
      if (not Text.startsWith(l, #text "data:image/")) return ?"Logo must be a data URI";
      if (l.size() > Config.MAX_TOKEN_LOGO_BYTES) return ?"Logo must be under 32 KB";
      null;
    };
  };
};
```

Symbols reserved against chain-key and allowlisted tokens are seeded into
`reservedSymbols` at init and checked in the service, where storage is reachable.

---

## `services/TokenService.mo`

The launch. `UsernameSaleService.purchase` is the shape being followed.

```motoko
// Held only for the duration of one launch, so deliberately not persisted: an
// upgrade landing between two calls must not strand a symbol behind a lock
// nobody will ever release.
public type TokenService = {
  tokens: TokenStorage.TokenStorage;
  wasm: TokenWasmService.TokenWasmStore;
  transfers: TransferService.TransferService;
  users: UserStorage.UserMap;
  self: Principal;
  // Same generator TransferService takes, for the same reason: the row needs a
  // key before the chain has assigned one.
  nextId: () -> Text;
  pending: Set.Set<Text>;
};

public func launch(
  service: TokenService,
  caller: Principal,
  p: LaunchParams,
): async Types.ApiResult<Types.Token> {

  // Resolved here rather than in the mixin, matching resolveSender.
  let userId = switch (UserRepo.getByPrincipal(service.users, caller)) {
    case (?u) u.id;
    case null return #err("User not found");
  };

  switch (TokenValidator.validate(p)) { case (?e) return #err(e); case null {} };

  let symbol = TokenValidator.normalizeSymbol(p.symbol);
  if (service.tokens.reservedSymbols.contains(symbol))
    return #err("Symbol " # symbol # " is reserved");

  if (not TokenWasmService.isReady(service.wasm))
    return #err("Token creation is temporarily unavailable");

  // Local read, not a call. The wallet's survival outranks any one launch.
  if (Cycles.balance() < Config.MIN_CYCLE_RESERVE)
    return #err("Token creation is temporarily unavailable");

  // Guards the window between the payment and the #pending row: two launches for
  // one symbol both pass the taken-check before either has written a row.
  if (service.pending.contains(symbol))
    return #err("A launch for this symbol is already in progress");
  service.pending.add(symbol);

  // One debit, whole, before any canister work. Charging in two parts creates a
  // state where the token is live and the second debit failed.
  //
  // Destination is this canister's own account under a fixed revenue subaccount.
  // AccountHelper has custodialAccount (keyed by user principal) but no
  // fixed-subaccount helper, so Phase 4 adds one:
  //   revenueAccount(custodian) = { owner = custodian; subaccount = ?REVENUE }
  let revenue = AccountHelper.revenueAccount(service.self);
  let payment = await TransferService.transferByAccount(
    service.transfers, caller, Config.ICP_LEDGER_CANISTER_ID,
    revenue, Config.LAUNCH_FEE, ?launchMemo(symbol),
  );
  let blockIndex = switch (payment) {
    case (#err e) { service.pending.remove(symbol); return #err(e) };
    case (#ok r) r.blockIndex;
  };

  // Written before the canister call so a trap leaves evidence of the payment.
  // Keyed by an internal id -- the canister id does not exist yet.
  let token = TokenRepository.createPending(
    service.tokens, service.nextId(), userId, caller, p, symbol, blockIndex);

  try {
    let canisterId = await createCanister(service);
    // Recorded the moment it exists. A trap in either later step then leaves a
    // row naming a canister we still control, which is retryable -- without this
    // line the same trap orphans a live canister holding the user's cycles.
    TokenRepository.setLedgerId(service.tokens, token, canisterId);
    await installLedger(service, canisterId, caller, p, symbol);
    await handOffControl(canisterId, caller, p.immutable);
    TokenRepository.markActive(service.tokens, token, service.wasm.moduleHash);
    service.pending.remove(symbol);
    #ok(token);
  } catch (e) {
    TokenRepository.markFailed(service.tokens, token);
    service.pending.remove(symbol);
    // Naming the block is what makes a refund traceable. This sequence is not
    // atomic and the error says so rather than pretending otherwise. Whether the
    // right remedy is a refund or a retry depends on how far it got, which the
    // row's ledgerId now records -- see flow.md.
    #err("Launch failed after payment. Block " # Nat64.toText(blockIndex) # " -- contact support.");
  };
};
```

The symbol lock releases on every exit path including the `catch`, so a failed
launch never strands the symbol.

### `createCanister`

```motoko
// Cycles are bought from the CMC out of the fee, never taken from this
// canister's own balance -- that balance is what keeps user funds reachable.
// A flat 2 ICP, so no rate lookup and nothing to clamp: the child gets whatever
// 2 ICP mints at that moment, which is the creator's upside when ICP is strong.
func createCanister(service: TokenService): async Principal {
  // The CMC identifies the intended target by the destination subaccount, and
  // only accepts the legacy `transfer` -- which is why LedgerService pins that
  // one path to the ICP ledger. Cmc.accountOf carries the NNS encoding, which is
  // length-prefixed and LEFT-aligned -- it is NOT Subaccount.fromPrincipal.
  let block = switch (await LedgerService.transferToAccountIdentifier({
    to = Cmc.accountOf(Principal.fromText(Config.CMC_CANISTER_ID), service.self);
    amount = { e8s = Nat64.fromNat(Config.LAUNCH_CYCLE_ALLOCATION) };
    fee = { e8s = 10_000 };  // ICP ledger fee, fixed on the legacy interface
    memo = Cmc.MEMO_CREATE_CANISTER;
    from_subaccount = ?REVENUE_SUBACCOUNT;
    created_at_time = null;
  })) {
    case (#Ok b) b;
    case (#Err e) throw Error.reject(describeOldTransferError(e));
  };

  switch (await Cmc.cmc().notify_create_canister({
    block_index = block;
    controller = service.self;   // temporary: we must install before handing off
    subnet_type = null; subnet_selection = null; settings = null;
  })) {
    case (#Ok id) id;
    case (#Err e) throw Error.reject(describe(e));
  };
};
```

`transferToAccountIdentifier` already exists and takes `OldTransferArgs` directly —
no service handle. Its comment explains the pinning: account identifiers are an
ICP-ledger concept no other ICRC-1 ledger implements.

**The destination derivation is the highest-risk line in this file** — get it
wrong and 2 ICP goes to an account nobody owns, silently, with
`notify_create_canister` then failing. **It is now settled, and the first guess
was wrong.**

### How it was resolved

The plan originally proposed
`Principal.toLedgerAccount(cmc, ?Subaccount.fromPrincipal(self))`, reusing the
helper that derives every user's deposit account. That is the wrong encoding.
`Subaccount.fromPrincipal` is length-prefixed and **right**-aligned; the NNS
convention the CMC follows is length-prefixed and **left**-aligned. The two
produce different accounts for the same principal.

Confirmed against a known-good derivation, no calls and no replica:

```bash
dfx ledger account-id --of-principal rkp4c-7iaaa-aaaaa-aaaca-cai \
  --subaccount-from-principal 6vbhm-nqaaa-aaaan-q6muq-cai
# 3adc5de13a2c69eddb66b26e3adc2ce54bbf1e598e57a46be9ea21a64edbd484
```

`Cmc.accountOf(cmc, self)` reproduces that hex exactly.
`testing/ledger/Cmc.test.mo` pins it, and additionally asserts the custodial
encoding does **not** match — so a later "these two helpers look the same,
let's merge them" cannot silently reintroduce the bug.

Still worth proving the whole path on a **local replica** with a local CMC before
mainnet: that settles whether `notify_create_canister`'s record shape matches
`Cmc.mo`, which the pure-function check cannot.

**Do not skip to a small mainnet launch to "just see."** A wrong subaccount is
exactly the failure that does not announce itself: the transfer succeeds, the
notify fails, and 2 ICP sits in an unowned account permanently.

`cyclesFunded` on the record is what the CMC actually minted, not a constant —
`notify_create_canister` does not return it, so read it from the create response
or record the e8s spent and label the UI accordingly.

### `installLedger`

```motoko
// Installs from the chunk store. The bytes were uploaded once by a controller;
// a launch references them by hash and sends none of them again.
func installLedger(
  service: TokenService, canisterId: Principal,
  creator: Principal, p: LaunchParams, symbol: Text,
): async () {
  let hashes = Array.map<Blob, { hash: Blob }>(service.wasm.chunkHashes, func h = { hash = h });
  await Management.mgmt().install_chunked_code({
    mode = #install;
    target_canister = canisterId;
    store_canister = ?service.self;
    chunk_hashes_list = hashes;
    wasm_module_hash = Option.get(service.wasm.moduleHash, "" : Blob);
    arg = to_candid (ledgerInitArgs(creator, p, symbol));
    sender_canister_version = null;
  });
};
```

`ledgerInitArgs` carries the ICRC-1 init record: `token_name`, `token_symbol`,`decimals`, `transfer_fee`, `minting_account`, `initial_balances` (whole supply to
the creator), and `metadata` with `icrc1:logo` plus the three socials. **The
metadata goes on the child ledger as well as in our record** — the record is what
we list from, the ledger's own metadata is what makes the token legible to wallets
that never heard of ICPay.

### `handOffControl`

```motoko
// The last call. ICPay is controller only long enough to install, then never
// again -- co-controlling every launched token would make one compromised key
// reach all of them.
func handOffControl(canisterId: Principal, creator: Principal, immutable: Bool): async () {
  await Management.mgmt().update_settings({
    canister_id = canisterId;
    settings = {
      controllers = ?(if (immutable) { [] } else { [creator] });
      compute_allocation = null;
      memory_allocation = null;
      // A year of recoverable frozen time instead of ~30 days. With
      // controllers = [] there is no reinstall after deletion, so this window is
      // the only thing standing between a forgotten token and permanent loss.
      freezing_threshold = ?Config.TOKEN_FREEZING_THRESHOLD;
    };
  });
};
```

### `sweepRevenue`

```motoko
// Revenue accrues in a subaccount only this canister can spend from, and
// TREASURY is a plain principal, so nothing else can move it. Manual and
// controller-only: sweeping on every launch would put a ledger call on the hot
// path to move 3 ICP that is in no hurry.
public func sweepRevenue(service: TokenService): async Types.ApiResult<Nat64> {
  let from = AccountHelper.revenueAccount(service.self);
  let balance = await LedgerService.getBalance(Config.ICP_LEDGER_CANISTER_ID, from);
  let fee = await LedgerService.getFee(Config.ICP_LEDGER_CANISTER_ID);
  if (balance <= fee) return #err("Nothing to sweep");

  // icrc1_transfer sends from the *caller's* subaccount, which for a canister
  // call is this canister -- so from_subaccount selects the revenue account.
  switch (await LedgerService.transfer(Config.ICP_LEDGER_CANISTER_ID, {
    from_subaccount = ?REVENUE_SUBACCOUNT;
    to = AccountHelper.defaultAccount(Principal.fromText(Config.TREASURY));
    amount = balance - fee : Nat;
    fee = ?fee;
    memo = null;
    created_at_time = null;
  })) {
    case (#Ok blockIndex) #ok(Nat64.fromNat(blockIndex));
    case (#Err e) #err(describeTransferError(e));
  };
};
```

Uses `LedgerService.transfer` and `getBalance`, both of which already exist.
`REVENUE_SUBACCOUNT` is a fixed 32-byte blob defined in `Config`.

---

## `api/v1/Token.mo`

Thin. Every read is a `query` — queries are not billed on the IC, so a symbol
check can fire as the user types.

```motoko
mixin (tokens: TokenService.TokenService, mwConfig: MiddlewareAuth.Config) {

  // The caller is resolved to a userId inside the service, matching
  // TransferService.resolveSender -- the API layer stays free of repository
  // access, which no api/v1 file has.
  public shared ({ caller }) func launchToken(p: TokenService.LaunchParams)
    : async Types.ApiResult<Types.Token> {
    await TokenService.launch(tokens, MiddlewareAuth.effectiveCaller(mwConfig, caller), p);
  };

  public shared query ({ caller }) func getMyTokens(): async [Types.Token] {
    TokenRepository.findByUser(tokens.tokens, MiddlewareAuth.effectiveCaller(mwConfig, caller));
  };

  // Goes through tokensByLedger. Only #active rows have a canister id, so a
  // pending or failed launch is correctly invisible here.
  public shared query func getToken(ledgerId: Text): async ?Types.Token {
    TokenRepository.findByLedgerId(tokens.tokens, ledgerId);
  };

  public shared query func isSymbolAvailable(symbol: Text): async Bool {
    not tokens.reservedSymbols.contains(TokenValidator.normalizeSymbol(symbol));
  };

  public shared query func getLaunchFee(): async Nat { Config.LAUNCH_FEE };

  // A shared call, not a query, for the reason Admin.listReservedUsernames
  // documents: a query is served by one node without consensus, so a malicious
  // replica could hide entries from an authorization-relevant list.
  public shared func listReservedSymbols(): async [Text] {
    Set.toArray(tokens.tokens.reservedSymbols);
  };

  public shared ({ caller }) func uploadTokenWasmChunk(chunk: Blob): async Types.ApiResult<Blob> {
    if (not Principal.isController(MiddlewareAuth.effectiveCaller(mwConfig, caller)))
      return #err("Not authorized");
    #ok(await TokenWasmService.uploadChunk(tokens.wasm, tokens.self, chunk));
  };

  public shared ({ caller }) func sealTokenWasm(expectedHash: Blob): async Types.ApiResult<()> {
    if (not Principal.isController(MiddlewareAuth.effectiveCaller(mwConfig, caller)))
      return #err("Not authorized");
    TokenWasmService.seal(tokens.wasm, expectedHash);
  };

  // Without this the revenue is stranded: it accrues in a subaccount only this
  // canister can spend from, and TREASURY is a plain principal we cannot push to
  // from anywhere else.
  public shared ({ caller }) func sweepRevenue(): async Types.ApiResult<Nat64> {
    if (not Principal.isController(MiddlewareAuth.effectiveCaller(mwConfig, caller)))
      return #err("Not authorized");
    await TokenService.sweepRevenue(tokens);
  };
};
```

---

## `main.mo`

```motoko
// Not transient: in a persistent actor `transient` opts out of orthogonal
// persistence, which would drop every launched token on upgrade.
let tokenStorage = TokenStorage.empty();
let tokenWasm = TokenWasmService.emptyStore();

transient let tokenService = TokenService.create(
  tokenStorage, tokenWasm, transferService, users, Principal.fromActor(self), nextUid,
);

include TokenApi(tokenService, mwConfig);
```

`nextUid` is the actor-level generator already passed to `TransferService`
(`main.mo:61`) — a monotonic counter appended to a UUID, because `Time.now()`
alone is constant for a whole round and two rows written back to back would
collide. Reusing it keeps one id space, not two.

---

## Migrations

**There is none, and that is deliberate.**

Phase 4 adds new stable variables. They start empty, so there is nothing to
migrate. M0170 fires only when a field is added to a record type that has already
been persisted — which is why `Token` declares `var poolId: ?Text` now, before
Phase 5 needs it.

Do not re-wire `StampLedgerId.mo` into `main.mo`. Its header says it is applied and
must stay unwired; re-adding it causes the exact M0170 it was written to fix.

---

## Tests

Style matches the existing 25 files: top-level statements, no framework.

```motoko
import Debug "mo:core/Debug";
import TokenValidator "../../src/validators/TokenValidator";

if (TokenValidator.validateLink(?"https://x.com/a") == null) {
  Debug.print("PASS: https link accepted");
} else { assert(false); Debug.print("FAIL: https link accepted") };

if (TokenValidator.validateLink(?"javascript:alert(1)") != null) {
  Debug.print("PASS: javascript: scheme rejected");
} else { assert(false); Debug.print("FAIL: javascript: scheme rejected") };

if (TokenValidator.validateLink(?"http://x.com") != null) {
  Debug.print("PASS: plain http rejected");
} else { assert(false); Debug.print("FAIL: plain http rejected") };

if (TokenValidator.validateSymbol("bt c") != null) {
  Debug.print("PASS: symbol with space rejected");
} else { assert(false); Debug.print("FAIL: symbol with space rejected") };

Debug.print("ALL TOKEN VALIDATOR TESTS PASSED");
```

CMC and management calls cannot run under `moc` in interpreter mode. Prove them on
a local replica during the spike and **write that fact into the test file** — an
untestable path silently omitted reads as covered.

---

## `services/token/launch.ts`

One call, mirroring `services/transfer/transfer.ts`.

```ts
export async function launchToken(params: LaunchParams): Promise<Token> {
  const actor = await getBackendActor();
  const result = await actor.launchToken({
    name: params.name,
    symbol: params.symbol.toUpperCase(),
    description: params.description,
    logo: params.logo ? [params.logo] : [],
    website: params.website ? [params.website] : [],
    telegram: params.telegram ? [params.telegram] : [],
    twitter: params.twitter ? [params.twitter] : [],
    decimals: 8,
    totalSupply: BigInt(params.totalSupply),
    immutable: params.immutable,
    initialBuyE8s: 0n,
  });
  if ("err" in result) throw new Error(result.err);
  return result.ok;
}
```

`?Text` crosses Candid as `[] | [string]`. The empty array is the absent case;
`[""]` is a present empty string and will fail validation.

### Client-side image handling

```ts
// The reference uploads to a CDN this project does not have, from a static
// export with no server. A 128px data URI needs neither.
async function toLogoDataUri(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, 128, 128);
  const uri = canvas.toDataURL("image/png");
  if (uri.length > 32_768) throw new Error("Image too detailed — try a simpler logo");
  return uri;
}
```

---

## `components/token/launch-form.tsx`

Layout from the SunPump screenshots, implementation from this codebase: shadcn
primitives, `@hugeicons/react` icons, Sonner for feedback. No raw `<input>` with
inline Tailwind, no `alert()`.

```
┌──────────────────────────────────────────────┐
│  ⚡ No presale   🛡 No team allocation        │
├──────────────────────────────────────────────┤
│ ┌────────┐  Token name *            0/20     │
│ │ drop   │  [                            ]   │
│ │ image  │                                   │
│ │ 128px  │  Symbol *                 0/10    │
│ └────────┘  [                            ]   │
│                                              │
│  Description *                      0/256    │
│  [                                      ]    │
│                                              │
│  ▸ Socials (optional)                        │
│      Website · Telegram · Twitter            │
│                                              │
│  Initial buy (ICP)              [disabled]   │
│  Arrives with trading                        │
│                                              │
│  ○ Immutable — nobody, including you, can    │
│    ever change this token's code or supply   │
│  ○ Upgradeable — you keep control and can    │
│    upgrade it later. ICPay will not list it  │
│    for sending.                              │
│                                              │
│  Creation fee               5 ICP            │
│  Network fee              0.0001 ICP         │
│  Total                    5.0001 ICP         │
│                                              │
│  [        Create token — 5.0001 ICP       ]  │
└──────────────────────────────────────────────┘
```

Three deviations from the screenshots, each deliberate:

- **The treasury is not displayed as a destination.** The reference prints it in
  the cost summary; a destination in client code is one an attacker can edit. The
  backend reads it from `Config`.
- **Immutability is two sentences, not a checkbox.** It is irreversible and it
  changes whether ICPay will list the token. "ICPay will not list it for sending"
  must not be buried.
- **Initial buy is rendered disabled with a reason**, not hidden. Hiding it makes
  the later arrival a surprise; disabling it sets the expectation.

One ledger fee, not two. The user makes a single transfer; the 2 ICP hop to the
CMC is paid out of the revenue side, so the platform absorbs that one.

All strings land in the 10 locale catalogs under `language/`; `check.mjs` verifies
sync. On-chain data (symbol, canister id) stays English.
