import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat64 "mo:core/Nat64";
import Option "mo:core/Option";
import Error "mo:core/Error";
import Cycles "mo:core/Cycles";
import Types "../types";
import Config "../config/Config";
import Cmc "../ledger/Cmc";
import Management "../ledger/Management";
import LedgerTypes "../ledger/Types";
import AccountHelper "../ledger/Account";
import TransferError "../ledger/TransferError";
import TokenStorage "../storage/TokenStorage";
import UserStorage "../storage/UserStorage";
import TokenRepo "../repositories/TokenRepository";
import UserRepo "../repositories/UserRepository";
import TokenModel "../models/Token";
import TokenValidator "../validators/TokenValidator";
import LedgerService "LedgerService";
import TransferService "TransferService";
import TokenWasmService "TokenWasmService";
import RateLimitService "RateLimitService";
import RateLimitStorage "../storage/RateLimitStorage";

module {
  public func create(
    tokens: TokenStorage.TokenMap,
    byLedger: TokenStorage.TokensByLedger,
    byUser: TokenStorage.TokensByUser,
    reservedSymbols: TokenStorage.ReservedSymbolSet,
    wasm: TokenWasmService.TokenWasmStore,
    transfers: TransferService.TransferService,
    ledger: LedgerService.LedgerService,
    users: UserStorage.UserMap,
    self: Principal,
    nextId: () -> Text,
    limits: RateLimitStorage.RateLimitMap,
  ): TokenService {
    {
      tokens; byLedger; byUser; reservedSymbols; wasm; transfers; ledger; users; self; nextId; limits;
      // Held only for the duration of one launch, so deliberately not persisted:
      // an upgrade landing mid-launch must not strand a symbol behind a lock
      // nobody will ever release.
      pending = Set.empty<Text>();
    };
  };

  public type TokenService = {
    tokens: TokenStorage.TokenMap;
    byLedger: TokenStorage.TokensByLedger;
    byUser: TokenStorage.TokensByUser;
    reservedSymbols: TokenStorage.ReservedSymbolSet;
    wasm: TokenWasmService.TokenWasmStore;
    transfers: TransferService.TransferService;
    ledger: LedgerService.LedgerService;
    users: UserStorage.UserMap;
    // This canister. Owner of the revenue account and, briefly, of every token
    // it is installing.
    self: Principal;
    // Same generator TransferService takes, for the same reason: the row needs a
    // key before the chain has assigned one.
    nextId: () -> Text;
    limits: RateLimitStorage.RateLimitMap;
    pending: Set.Set<Text>;
  };

  public func launch(
    service: TokenService,
    caller: Principal,
    p: TokenValidator.LaunchParams,
  ): async Types.ApiResult<Types.TokenPublic> {
    if (not RateLimitService.allow(service.limits, caller, Config.RATE_LAUNCH_TOKEN, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_LAUNCH_TOKEN));
    };
    let userId = switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?u) { u.id };
      case (null) { return #err("User not found") };
    };

    switch (TokenValidator.validate(p)) {
      case (?e) { return #err(e) };
      case (null) {};
    };

    let symbol = TokenValidator.normalizeSymbol(p.symbol);
    if (TokenRepo.isReservedSymbol(service.reservedSymbols, symbol)) {
      return #err("Symbol " # symbol # " is reserved");
    };
    if (TokenRepo.symbolTaken(service.tokens, service.reservedSymbols, symbol)) {
      return #err("Symbol " # symbol # " is already taken");
    };

    if (not TokenWasmService.isReady(service.wasm)) {
      return #err("Token creation is temporarily unavailable");
    };

    // A local read, not a call. The wallet's ability to move existing user funds
    // outranks any one launch, so a low balance refuses before charging anyone.
    if (Cycles.balance() < Config.MIN_CYCLE_RESERVE) {
      return #err("Token creation is temporarily unavailable");
    };

    // Guards the window between the payment and the #pending row: two launches
    // for one symbol both pass symbolTaken before either has written a row.
    if (service.pending.contains(symbol)) {
      return #err("A launch for this symbol is already in progress");
    };
    service.pending.add(symbol);

    // One debit, whole, before any canister work. Charging in two parts creates
    // a state where the token is live and the second debit failed.
    let revenue = AccountHelper.fixedAccount(service.self, Config.REVENUE_SUBACCOUNT);
    let payment = await TransferService.transferByAccountInternal(
      service.transfers,
      caller,
      Config.ICP_LEDGER_CANISTER_ID,
      revenue,
      Config.LAUNCH_FEE,
      ?("Launch " # symbol),
    );
    let blockIndex = switch (payment) {
      case (#err(e)) { service.pending.remove(symbol); return #err(e) };
      case (#ok(r)) { r.blockIndex };
    };

    // Written before the first canister call so a trap leaves evidence of the
    // payment. Keyed by an internal id -- the canister id does not exist yet.
    let token = TokenRepo.createPending(
      service.tokens, service.byUser, service.nextId(), userId, caller,
      p.name, symbol, p.description,
      p.logo, p.website, p.telegram, p.twitter,
      p.decimals, p.totalSupply, p.immutable, blockIndex, Time.now(),
    );

    try {
      let canisterId = await createCanister(service);
      // Recorded the moment it exists. A trap in either later step then leaves a
      // row naming a canister we still control, which is retryable -- without
      // this line the same trap orphans a live canister holding the user's
      // cycles with nothing pointing at it.
      TokenRepo.setLedgerId(service.byLedger, token, Principal.toText(canisterId));

      await installLedger(service, canisterId, caller, p, symbol);
      await handOffControl(canisterId, caller, p.immutable);

      TokenModel.markActive(
        token,
        Option.get(service.wasm.moduleHash, "" : Blob),
        Config.LAUNCH_CYCLE_ALLOCATION,
      );
      // A launched token is not SNS-deployed, so refreshLedgers will never find
      // it and the custodian would refuse every deposit and transfer of a token
      // it created itself. Only after markActive: a ledger that failed to
      // install must not widen the set of canisters this one is willing to call.
      ignore LedgerService.registerLedger(service.ledger, Principal.toText(canisterId));
      service.pending.remove(symbol);
      #ok(Types.tokenToPublic(token));
    } catch (e) {
      TokenModel.markFailed(token, Error.message(e));
      service.pending.remove(symbol);
      // Naming the block is what makes a refund traceable. This sequence is not
      // atomic and the error says so rather than pretending otherwise. Whether
      // the remedy is a refund or a retry depends on how far it got, which the
      // row's ledgerId now records.
      #err("Launch failed after payment. Block " # Nat64.toText(blockIndex) # " -- contact support.");
    };
  };

  // Cycles are bought from the CMC out of the fee, never taken from this
  // canister's own balance -- that balance is what keeps user funds reachable.
  // A flat 2 ICP, so there is no rate lookup and nothing to clamp: the child
  // gets whatever 2 ICP mints at that moment.
  func createCanister(service: TokenService): async Principal {
    // The CMC identifies the intended target by the destination subaccount and
    // only accepts the legacy `transfer`, which is why LedgerService pins that
    // path to the ICP ledger. Cmc.accountOf carries the NNS encoding -- it is
    // NOT the custodial one, see testing/ledger/Cmc.test.mo.
    let args: LedgerTypes.OldTransferArgs = {
      to = Cmc.accountOf(Principal.fromText(Config.CMC_CANISTER_ID), service.self);
      amount = { e8s = Nat64.fromNat(Config.LAUNCH_CYCLE_ALLOCATION) };
      // The legacy interface requires a real number rather than an opt, and the
      // ICP ledger's fee is fixed at 10_000 e8s.
      fee = { e8s = 10_000 };
      memo = Cmc.MEMO_CREATE_CANISTER;
      from_subaccount = ?Config.REVENUE_SUBACCOUNT;
      created_at_time = null;
    };
    let block = switch (await LedgerService.transferToAccountIdentifier(args)) {
      case (#Ok(b)) { b };
      case (#Err(e)) { throw Error.reject(TransferError.describeOld(e)) };
    };

    let cmc: Cmc.CmcService = actor (Config.CMC_CANISTER_ID);
    switch (await cmc.notify_create_canister({
      block_index = block;
      // Temporary. We must be controller long enough to install, and hand off
      // immediately after.
      controller = service.self;
      subnet_type = null;
      subnet_selection = ?#Subnet({ subnet = Principal.fromText(Config.OWN_SUBNET) });
      settings = null;
    })) {
      case (#Ok(id)) { id };
      case (#Err(e)) { throw Error.reject(describeNotifyError(e)) };
    };
  };

  // Installs from the chunk store. The bytes were uploaded once by a controller;
  // a launch references them by hash and sends none of them again.
  func installLedger(
    service: TokenService,
    canisterId: Principal,
    creator: Principal,
    p: TokenValidator.LaunchParams,
    symbol: Text,
  ): async () {
    let mgmt: Management.ManagementService = actor (Config.MANAGEMENT_CANISTER_ID);
    await mgmt.install_chunked_code({
      mode = #install;
      target_canister = canisterId;
      store_canister = ?service.self;
      chunk_hashes_list = TokenWasmService.chunkHashList(service.wasm);
      wasm_module_hash = Option.get(service.wasm.moduleHash, "" : Blob);
      // The ledger's entry point takes `variant { Init; Upgrade }`, not the
      // record bare. Encoding InitArgs directly decodes as neither and traps
      // the install -- after the fee is taken and the canister exists.
      arg = to_candid (#Init(ledgerInitArgs(creator, p, symbol)));
      sender_canister_version = null;
    });
  };

  // The whole supply goes to the creator, but the minting account is a
  // principal nothing can call as, so the supply can never grow past what is
  // issued here. The metadata is duplicated onto the child ledger on purpose:
  // our record is what ICPay lists from, the ledger's own metadata is what
  // makes the token legible to wallets that never heard of ICPay.
  // Public so a test can decode what install would actually send. The shape is
  // only exercised for real by a mainnet launch, which costs 5 ICP to discover
  // is wrong.
  public func ledgerInitArgs(
    creator: Principal,
    p: TokenValidator.LaunchParams,
    symbol: Text,
  ): LedgerInitArgs {
    let creatorAccount = { owner = creator; subaccount = null };
    let metadata = [
      ("icrc1:description", #Text(p.description)),
      ("icrc1:logo", #Text(Option.get(p.logo, ""))),
      ("icpay:website", #Text(Option.get(p.website, ""))),
      ("icpay:telegram", #Text(Option.get(p.telegram, ""))),
      ("icpay:twitter", #Text(Option.get(p.twitter, ""))),
    ];
    {
      token_name = p.name;
      token_symbol = symbol;
      decimals = ?p.decimals;
      transfer_fee = 10_000;
      minting_account = { owner = Principal.fromText(Config.TOKEN_MINTING_PRINCIPAL); subaccount = null };
      initial_balances = [(creatorAccount, p.totalSupply)];
      metadata;
      fee_collector_account = null;
      max_memo_length = null;
      index_principal = null;
      archive_options = {
        num_blocks_to_archive = 1_000;
        trigger_threshold = 2_000;
        controller_id = creator;
        // The ledger spawns its archive itself, paying out of its own balance,
        // so a zero here means the spawn fails once trigger_threshold is
        // crossed and the ledger keeps every block in its own memory instead.
        cycles_for_archive_creation = ?Config.ARCHIVE_CREATION_CYCLES;
        max_message_size_bytes = null;
        node_max_memory_size_bytes = null;
        max_transactions_per_response = null;
        more_controller_ids = null;
      };
      feature_flags = ?{ icrc2 = true };
    };
  };

  // Fields and order follow ledger.did from ledger-suite-icrc-2026-03-09. A
  // record that does not match it decodes as garbage on install, which is only
  // discoverable after the fee is spent -- so this type is pinned to a release,
  // not written from memory.
  public type LedgerInitArgs = {
    token_name: Text;
    token_symbol: Text;
    decimals: ?Nat8;
    transfer_fee: Nat;
    minting_account: LedgerTypes.Account;
    fee_collector_account: ?LedgerTypes.Account;
    initial_balances: [(LedgerTypes.Account, Nat)];
    metadata: [(Text, LedgerTypes.Value)];
    max_memo_length: ?Nat16;
    index_principal: ?Principal;
    archive_options: {
      num_blocks_to_archive: Nat64;
      max_transactions_per_response: ?Nat64;
      trigger_threshold: Nat64;
      max_message_size_bytes: ?Nat64;
      cycles_for_archive_creation: ?Nat64;
      node_max_memory_size_bytes: ?Nat64;
      controller_id: Principal;
      more_controller_ids: ?[Principal];
    };
    feature_flags: ?{ icrc2: Bool };
  };

  // Only the Init arm is declared. A variant with fewer cases is a Candid
  // subtype of the ledger's, so this decodes; carrying an Upgrade arm we never
  // send would mean keeping UpgradeArgs in sync for nothing.
  public type LedgerArg = { #Init: LedgerInitArgs };

  // The last call. ICPay is controller only long enough to install and never
  // again -- co-controlling every launched token would make one compromised key
  // reach all of them.
  func handOffControl(canisterId: Principal, creator: Principal, immutable: Bool): async () {
    let mgmt: Management.ManagementService = actor (Config.MANAGEMENT_CANISTER_ID);
    await mgmt.update_settings({
      canister_id = canisterId;
      settings = {
        controllers = ?(if (immutable) { [] } else { [creator] });
        compute_allocation = null;
        memory_allocation = null;
        // A year of recoverable frozen time instead of the ~30 day default. With
        // controllers = [] there is no reinstall after deletion, so this window
        // is the only thing between a forgotten token and permanent loss.
        freezing_threshold = ?Config.TOKEN_FREEZING_THRESHOLD;
      };
    });
  };

  // Revenue accrues in a subaccount only this canister can spend from, and
  // TREASURY is a plain principal, so nothing else can move it. Driven by a 24h
  // timer plus a controller-only endpoint, never by the launch itself: two ledger
  // calls on the hot path to move funds that are in no hurry is not worth it.
  public func sweepRevenue(service: TokenService): async Types.ApiResult<Nat64> {
    let from = AccountHelper.fixedAccount(service.self, Config.REVENUE_SUBACCOUNT);
    let balance = await LedgerService.getBalance(Config.ICP_LEDGER_CANISTER_ID, from);
    let fee = await LedgerService.getFee(Config.ICP_LEDGER_CANISTER_ID);
    if (balance <= fee) { return #err("Nothing to sweep") };

    // icrc1_transfer sends from the caller's own account, which for a canister
    // call is this canister, so from_subaccount is what selects the revenue
    // account rather than the canister's default one.
    switch (await LedgerService.transfer(Config.ICP_LEDGER_CANISTER_ID, {
      from_subaccount = ?Config.REVENUE_SUBACCOUNT;
      to = AccountHelper.defaultAccount(Principal.fromText(Config.TREASURY));
      amount = balance - fee : Nat;
      fee = ?fee;
      memo = null;
      created_at_time = null;
    })) {
      case (#Ok(blockIndex)) { #ok(Nat64.fromNat(blockIndex)) };
      case (#Err(e)) { #err(TransferError.describe(e)) };
    };
  };

  // A launch that dies between create and install leaves an empty canister this
  // canister still controls, holding the cycles the fee bought. Control is
  // handed to a principal that can delete it rather than deleting it here:
  // Management.mo declares no delete_canister on purpose, and adding one to
  // recover cycles would give every future bug a way to destroy a live token.
  //
  // Refuses any canister id recorded against a token that is not #failed, so an
  // active ledger can never be signed away by a mistyped argument.
  public func releaseFailedCanister(
    service: TokenService,
    canisterId: Text,
    to: Principal,
  ): async Types.ApiResult<()> {
    switch (TokenRepo.findByLedgerId(service.tokens, service.byLedger, canisterId)) {
      case (null) { return #err("No launch recorded for " # canisterId) };
      case (?t) {
        switch (t.status) {
          case (#failed(_)) {};
          case (_) { return #err("Token " # canisterId # " is not a failed launch") };
        };
      };
    };
    let mgmt: Management.ManagementService = actor (Config.MANAGEMENT_CANISTER_ID);
    await mgmt.update_settings({
      canister_id = Principal.fromText(canisterId);
      settings = {
        controllers = ?[to];
        compute_allocation = null;
        memory_allocation = null;
        freezing_threshold = null;
      };
    });
    #ok(());
  };

  // Rescues a frozen token. notify_top_up needs no controller rights, so this
  // works even for an immutable token that has no controller at all.
  public func topUpToken(service: TokenService, canisterId: Text, amount: Nat): async Types.ApiResult<Nat> {
    let target = switch (TokenRepo.findByLedgerId(service.tokens, service.byLedger, canisterId)) {
      case (?t) { t };
      case (null) { return #err("Unknown token: " # canisterId) };
    };
    let targetPrincipal = Principal.fromText(canisterId);
    let args: LedgerTypes.OldTransferArgs = {
      to = Cmc.accountOf(Principal.fromText(Config.CMC_CANISTER_ID), targetPrincipal);
      amount = { e8s = Nat64.fromNat(amount) };
      fee = { e8s = 10_000 };
      memo = Cmc.MEMO_TOP_UP_CANISTER;
      from_subaccount = ?Config.REVENUE_SUBACCOUNT;
      created_at_time = null;
    };
    let block = switch (await LedgerService.transferToAccountIdentifier(args)) {
      case (#Ok(b)) { b };
      case (#Err(e)) { return #err(TransferError.describeOld(e)) };
    };
    let cmc: Cmc.CmcService = actor (Config.CMC_CANISTER_ID);
    switch (await cmc.notify_top_up({ block_index = block; canister_id = targetPrincipal })) {
      case (#Ok(cycles)) {
        target.cyclesFunded := ?(Option.get(target.cyclesFunded, 0) + cycles);
        #ok(cycles);
      };
      case (#Err(e)) { #err(describeNotifyError(e)) };
    };
  };

  // Seeded at init so nobody can launch a token calling itself ICP or ckBTC.
  // Symbols of arbitrary SNS ledgers are deliberately not fetched: SNS-W returns
  // canister ids, not symbols, so covering them would cost one icrc1_symbol call
  // per allowlisted ledger on every launch attempt.
  public func seedReservedSymbols(service: TokenService, symbols: [Text]) {
    for (s in symbols.values()) {
      TokenRepo.reserveSymbol(service.reservedSymbols, s);
    };
  };

  public func getToken(service: TokenService, canisterId: Text): ?Types.TokenPublic {
    switch (TokenRepo.findByLedgerId(service.tokens, service.byLedger, canisterId)) {
      case (?t) { ?Types.tokenToPublic(t) };
      case (null) { null };
    };
  };

  public func getById(service: TokenService, id: Types.TokenId): ?Types.TokenPublic {
    switch (TokenRepo.getById(service.tokens, id)) {
      case (?t) { ?Types.tokenToPublic(t) };
      case (null) { null };
    };
  };

  public func listByUser(service: TokenService, caller: Principal, limit: Nat, offset: Nat): [Types.TokenPublic] {
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (null) { [] };
      case (?u) {
        let rows = TokenRepo.getByUser(service.tokens, service.byUser, u.id, limit, offset);
        Array.map<Types.Token, Types.TokenPublic>(rows, Types.tokenToPublic);
      };
    };
  };

  public func listActive(service: TokenService, limit: Nat, offset: Nat): [Types.TokenPublic] {
    let rows = TokenRepo.listActive(service.tokens, limit, offset);
    Array.map<Types.Token, Types.TokenPublic>(rows, Types.tokenToPublic);
  };

  // Backfill for tokens launched before the launch path registered its own
  // ledger. Takes no argument on purpose: the ids come from this canister's own
  // token rows, so it cannot be used to allowlist an arbitrary canister.
  public func registerLaunchedLedgers(service: TokenService): Nat {
    var added = 0;
    for (id in TokenRepo.activeLedgerIds(service.tokens).values()) {
      if (LedgerService.registerLedger(service.ledger, id)) { added += 1 };
    };
    added;
  };

  // Free to call, so the form can check as the user types: queries are not
  // billed on the IC.
  public func isSymbolAvailable(service: TokenService, symbol: Text): Bool {
    switch (TokenValidator.validateSymbol(symbol)) {
      case (?_) { false };
      case (null) {
        not TokenRepo.symbolTaken(service.tokens, service.reservedSymbols, symbol);
      };
    };
  };

  // Wasm administration goes through here rather than the api reaching into
  // service.wasm directly: an api file must not touch storage.
  public func uploadWasmChunk(service: TokenService, chunk: Blob): async Blob {
    await TokenWasmService.uploadChunk(service.wasm, service.self, chunk);
  };

  public func sealWasm(service: TokenService, moduleHash: Blob): Types.ApiResult<()> {
    TokenWasmService.seal(service.wasm, moduleHash);
  };

  public func resetWasm(service: TokenService): async () {
    await TokenWasmService.reset(service.wasm, service.self);
  };

  public func isLaunchReady(service: TokenService): Bool {
    TokenWasmService.isReady(service.wasm);
  };

  func describeNotifyError(e: Cmc.NotifyError): Text {
    switch (e) {
      case (#Refunded({ reason; block_index })) {
        switch (block_index) {
          case (?b) { "Cycles purchase refunded at block " # Nat64.toText(b) # ": " # reason };
          case (null) { "Cycles purchase refunded: " # reason };
        };
      };
      case (#InvalidTransaction(m)) { "Cycles minting rejected the payment: " # m };
      case (#Other({ error_message })) { error_message };
      case (#Processing) { "Cycles purchase is still processing, please retry" };
      case (#TransactionTooOld(_)) { "Payment expired before it reached the minter" };
    };
  };
};
