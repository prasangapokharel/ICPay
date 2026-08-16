import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Option "mo:core/Option";
import Error "mo:core/Error";
import Cycles "mo:core/Cycles";
import Set "mo:core/Set";
import Types "../../types";
import Config "../../config/Config";
import Cmc "../../ledger/Cmc";
import Management "../../ledger/Management";
import LedgerTypes "../../ledger/Types";
import AccountHelper "../../ledger/Account";
import TransferError "../../ledger/TransferError";
import TokenRepo "../../repositories/TokenRepository";
import UserRepo "../../repositories/UserRepository";
import TokenModel "../../models/Token";
import TokenValidator "../../validators/TokenValidator";
import LedgerService "../LedgerService";
import TransferService "../TransferService";
import TokenWasmService "../TokenWasmService";
import RateLimitService "../RateLimitService";
import Context "Context";
import TypesModule "Types";
import Notify "Notify";

module {
  public func ledgerInitArgs(
    creator: Principal,
    p: TokenValidator.LaunchParams,
    symbol: Text,
  ): TypesModule.LedgerInitArgs {
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
        cycles_for_archive_creation = ?Config.ARCHIVE_CREATION_CYCLES;
        max_message_size_bytes = null;
        node_max_memory_size_bytes = null;
        max_transactions_per_response = null;
        more_controller_ids = null;
      };
      feature_flags = ?{ icrc2 = true };
    };
  };

  func createCanister(service: Context.TokenService): async Principal {
    let args: LedgerTypes.OldTransferArgs = {
      to = Cmc.accountOf(Principal.fromText(Config.CMC_CANISTER_ID), service.self);
      amount = { e8s = Nat64.fromNat(Config.LAUNCH_CYCLE_ALLOCATION) };
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
      controller = service.self;
      subnet_type = null;
      subnet_selection = ?#Subnet({ subnet = Principal.fromText(Config.OWN_SUBNET) });
      settings = null;
    })) {
      case (#Ok(id)) { id };
      case (#Err(e)) { throw Error.reject(Notify.describeNotifyError(e)) };
    };
  };

  func installLedger(
    service: Context.TokenService,
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
      arg = to_candid (#Init(ledgerInitArgs(creator, p, symbol)));
      sender_canister_version = null;
    });
  };

  func handOffControl(canisterId: Principal, creator: Principal, immutable: Bool): async () {
    let mgmt: Management.ManagementService = actor (Config.MANAGEMENT_CANISTER_ID);
    await mgmt.update_settings({
      canister_id = canisterId;
      settings = {
        controllers = ?(if (immutable) { [] } else { [creator] });
        compute_allocation = null;
        memory_allocation = null;
        freezing_threshold = ?Config.TOKEN_FREEZING_THRESHOLD;
      };
    });
  };

  public func launch(
    service: Context.TokenService,
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

    if (Cycles.balance() < Config.MIN_CYCLE_RESERVE) {
      return #err("Token creation is temporarily unavailable");
    };

    if (service.pending.contains(symbol)) {
      return #err("A launch for this symbol is already in progress");
    };
    service.pending.add(symbol);

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

    let token = TokenRepo.createPending(
      service.tokens, service.byUser, service.nextId(), userId, caller,
      p.name, symbol, p.description,
      p.logo, p.website, p.telegram, p.twitter,
      p.decimals, p.totalSupply, p.immutable, blockIndex, Time.now(),
    );

    try {
      let canisterId = await createCanister(service);
      TokenRepo.setLedgerId(service.byLedger, token, Principal.toText(canisterId));

      await installLedger(service, canisterId, caller, p, symbol);
      await handOffControl(canisterId, caller, p.immutable);

      TokenModel.markActive(
        token,
        Option.get(service.wasm.moduleHash, "" : Blob),
        Config.LAUNCH_CYCLE_ALLOCATION,
      );
      ignore LedgerService.registerLedger(service.ledger, Principal.toText(canisterId));
      service.pending.remove(symbol);
      #ok(Types.tokenToPublic(token));
    } catch (e) {
      TokenModel.markFailed(token, Error.message(e));
      service.pending.remove(symbol);
      #err("Launch failed after payment. Block " # Nat64.toText(blockIndex) # " -- contact support.");
    };
  };
};
