import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Nat8 "mo:core/Nat8";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Types "../types";
import Config "../config/Config";
import LedgerService "LedgerService";
import LedgerTypes "../ledger/Types";
import TransferError "../ledger/TransferError";
import AccountHelper "../ledger/Account";
import UserRepo "../repositories/UserRepository";
import TxRepo "../repositories/TransactionRepository";
import TxModel "../models/Transaction";
import UserStorage "../storage/UserStorage";
import TxStorage "../storage/TransactionStorage";
import SwapStorage "../storage/SwapStorage";
import RateLimitService "RateLimitService";
import RateLimitStorage "../storage/RateLimitStorage";
import Subaccount "../ledger/Subaccount";

module {
  // ICPSwap v3 error type (matches deployed canisters)
  type ICPSwapError = {
    #CommonError;
    #InternalError: Text;
    #UnsupportedToken: Text;
    #InsufficientFunds;
  };

  // ICPSwap v3 actor interfaces — inline, no separate file needed.
  type ICPSwapFactory = actor {
    getPool : shared query { token0: { address: Text; standard: Text }; token1: { address: Text; standard: Text }; fee: Nat } -> async { #ok: PoolData; #err: ICPSwapError };
  };

  type ICPSwapPool = actor {
    quote        : shared query { zeroForOne: Bool; amountIn: Text; amountOutMinimum: Text } -> async { #ok: Nat; #err: ICPSwapError };
    deposit      : shared { token: Text; amount: Nat; fee: Nat }                             -> async { #ok: Nat; #err: ICPSwapError };
    depositFrom  : shared { token: Text; amount: Nat; fee: Nat }                             -> async { #ok: Nat; #err: ICPSwapError };
    swap         : shared { zeroForOne: Bool; amountIn: Text; amountOutMinimum: Text }       -> async { #ok: Nat; #err: ICPSwapError };
    withdraw     : shared { token: Text; fee: Nat; amount: Nat }                             -> async { #ok: Nat; #err: ICPSwapError };
    getUserUnusedBalance : shared query Principal -> async { #ok: { balance0: Nat; balance1: Nat }; #err: ICPSwapError };
  };

  // ICRC-2 approve — only method we need from it.
  type ICRC2Ledger = actor {
    icrc2_approve : shared {
      from_subaccount: ?Blob;
      spender: { owner: Principal; subaccount: ?Blob };
      amount: Nat;
      expected_allowance: ?Nat;
      expires_at: ?Nat64;
      fee: ?Nat;
      memo: ?Blob;
      created_at_time: ?Nat64;
    } -> async { #Ok: Nat; #Err: { #AllowanceChanged: { current_allowance: Nat }; #BadFee: { expected_fee: Nat }; #CreatedInFuture: { ledger_time: Nat64 }; #Duplicate: { duplicate_of: Nat }; #Expired: { ledger_time: Nat64 }; #GenericError: { error_code: Nat; message: Text }; #InsufficientFunds: { balance: Nat }; #TooOld } };
  };

  type PoolData = {
    key: Text;
    token0: { address: Text; standard: Text };
    token1: { address: Text; standard: Text };
    fee: Nat;
    tickSpacing: Int;
    canisterId: Principal;
  };

  type CachedPool = {
    poolId: Text;
    token0: Text;
    fee: Nat;
  };

  public type SwapService = {
    users:    UserStorage.UserMap;
    txs:      TxStorage.TxList;
    byUser:   TxStorage.TxByUser;
    ledger:   LedgerService.LedgerService;
    pending:  SwapStorage.PendingMap;
    nextId:   () -> Text;
    limits:   RateLimitStorage.RateLimitMap;
    // Transient pool cache: sorted pair key -> pool metadata. Rebuilt each session.
    poolCache: Map.Map<Text, CachedPool>;
  };

  public func create(
    users:   UserStorage.UserMap,
    txs:     TxStorage.TxList,
    byUser:  TxStorage.TxByUser,
    ledger:  LedgerService.LedgerService,
    pending: SwapStorage.PendingMap,
    nextId:  () -> Text,
    limits:  RateLimitStorage.RateLimitMap,
  ): SwapService {
    { users; txs; byUser; ledger; pending; nextId; limits; poolCache = Map.empty<Text, CachedPool>() };
  };

  // Helper to convert ICPSwapError variant to Text
  func icpSwapErrorToText(e: ICPSwapError): Text {
    switch (e) {
      case (#CommonError) { "Common error" };
      case (#InternalError(msg)) { "Internal error: " # msg };
      case (#UnsupportedToken(msg)) { "Unsupported token: " # msg };
      case (#InsufficientFunds) { "Insufficient funds" };
    };
  };

  // ---------------------------------------------------------------------------
  // Quote — pure query path, no state changes
  // ---------------------------------------------------------------------------
  public func quote(
    service:  SwapService,
    tokenIn:  Text,
    tokenOut: Text,
    amountIn: Nat,
  ): async Types.ApiResult<Types.SwapQuoteResult> {
    if (not LedgerService.isAllowed(service.ledger, tokenIn))  return #err("Unsupported token: " # tokenIn);
    if (not LedgerService.isAllowed(service.ledger, tokenOut)) return #err("Unsupported token: " # tokenOut);
    if (tokenIn == tokenOut) return #err("tokenIn and tokenOut must differ");
    if (amountIn == 0) return #err("amountIn must be > 0");

    let platformFee = amountIn * Config.SWAP_PLATFORM_FEE_BPS / 10_000;
    let swapAmountIn = (amountIn - platformFee : Nat);
    if (swapAmountIn == 0) return #err("amountIn too small after platform fee");

    // The executed swap (SwapService.swap) inputs the post-fee amount
    // (swapAmountIn - tokenInFee, matching what is actually deposited). Quote
    // with the same amount so the fee display and slippage math stay aligned.
    let tokenInFee = await LedgerService.getFee(tokenIn);

    let poolResult = await getPool(service, tokenIn, tokenOut);
    switch poolResult {
      case (#err(e)) { return #err(e) };
      case (#ok({ poolId; zeroForOne; fee })) {
        let pool: ICPSwapPool = actor(poolId);
        let quoteAmountIn = (swapAmountIn - tokenInFee : Nat);
        if (quoteAmountIn == 0) return #err("amountIn too small after ledger fee");
        switch (await pool.quote({ zeroForOne; amountIn = Nat.toText(quoteAmountIn); amountOutMinimum = "0" })) {
          case (#err(e)) { return #err("Quote failed: " # icpSwapErrorToText(e)) };
          case (#ok(amountOut)) {
            if (amountOut == 0) {
              return #err("No pool liquidity for this swap direction");
            };
            // ICPSwap fee tiers are 500/3000/10000 micro-bps (fee / 1_000_000).
            let swapFee = quoteAmountIn * fee / 1_000_000;
            #ok({
              amountOut;
              amountOutRaw = amountOut;
              platformFee;
              swapFee;
              priceImpact = "";
              poolId;
            });
          };
        };
      };
    };
  };

  // ---------------------------------------------------------------------------
  // Swap — full execution
  // ---------------------------------------------------------------------------
  public func swap(
    service:      SwapService,
    caller:       Principal,
    tokenIn:      Text,
    tokenOut:     Text,
    amountIn:     Nat,
    amountOutMin: Nat,
  ): async Types.ApiResult<Types.SwapResult> {
    if (not RateLimitService.allow(service.limits, caller, Config.RATE_SWAP, Time.now())) {
      return #err(RateLimitService.message(Config.RATE_SWAP));
    };
    if (Principal.isAnonymous(caller)) return #err("Not authenticated");
    if (not LedgerService.isAllowed(service.ledger, tokenIn))  return #err("Unsupported token: " # tokenIn);
    if (not LedgerService.isAllowed(service.ledger, tokenOut)) return #err("Unsupported token: " # tokenOut);
    if (tokenIn == tokenOut) return #err("tokenIn and tokenOut must differ");
    if (amountOutMin == 0) return #err("amountOutMin must be > 0");

    let user = switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?u) { u };
      case (null) { return #err("User not found") };
    };

    // Calculate amounts
    let platformFee = amountIn * Config.SWAP_PLATFORM_FEE_BPS / 10_000;
    if (platformFee == 0) return #err("amountIn too small - minimum swap amount not met");
    let swapAmountIn = (amountIn - platformFee : Nat);
    if (swapAmountIn == 0) return #err("amountIn too small for swap");

    let treasury = Principal.fromText(Config.TREASURY);
    let sourceAccount = LedgerService.depositAccount(service.ledger, caller);

    // Read phase — dispatch all four independent calls before awaiting any, so
    // the IC runs them concurrently: 4 sequential round-trips overlap and cost
    // roughly 1 instead of 4 (futures are first-class; evaluating a call without
    // `await` sends the request immediately).
    let futureTokenInFee  = LedgerService.getFee(tokenIn);
    let futureTokenOutFee = LedgerService.getFee(tokenOut);
    let futureUserBalance = LedgerService.getBalance(tokenIn, sourceAccount);
    let futurePool        = getPool(service, tokenIn, tokenOut);

    let tokenInFee  = await futureTokenInFee;
    let tokenOutFee = await futureTokenOutFee;
    let userBalance = await futureUserBalance;
    let poolResult  = await futurePool;

    // Verify balance: need amountIn + 2 fees (platform fee transfer + pool transfer)
    let requiredBalance = amountIn + (2 * tokenInFee);
    if (userBalance < requiredBalance) {
      return #err("Insufficient balance. Need " # Nat.toText(requiredBalance) # " (including fees), have " # Nat.toText(userBalance))
    };

    // Phase A — Resolve pool and confirm the direction has liquidity before moving funds.
    let (poolId, zeroForOne) = switch poolResult {
      case (#err(e)) { return #err(e) };
      case (#ok(r)) { (r.poolId, r.zeroForOne) };
    };
    let poolPrincipal = Principal.fromText(poolId);
    let pool: ICPSwapPool = actor(poolId);
    let depositAmount = (swapAmountIn - tokenInFee : Nat);
    if (depositAmount == 0) return #err("amountIn too small after ledger fee");
    switch (await pool.quote({ zeroForOne; amountIn = Nat.toText(depositAmount); amountOutMinimum = "0" })) {
      case (#err(e)) { return #err("Quote failed: " # icpSwapErrorToText(e)) };
      case (#ok(out)) {
        if (out == 0) return #err("No pool liquidity for this swap direction");
        if (out < amountOutMin) {
          return #err("Slippage exceeded: quoted " # Nat.toText(out) # ", minimum " # Nat.toText(amountOutMin));
        };
      };
    };

    // Phase B — Platform fee (take it first, before pool operations)
    let feeTransfer = await LedgerService.transfer(tokenIn, {
      from_subaccount = sourceAccount.subaccount;
      to = AccountHelper.defaultAccount(treasury);
      amount = platformFee;
      fee = null;
      memo = null;
      created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
    });
    switch feeTransfer {
      case (#Err(e)) { return #err("Platform fee transfer failed: " # TransferError.describe(e)) };
      case (#Ok(_)) {};
    };

    // Phase C — Transfer to canister main account, then approve pool from there
    // ICPSwap's depositFrom only works when approving from main account (subaccount = null)
    let mainAccount = AccountHelper.defaultAccount(service.ledger.custodian);

    let transferToMain = await LedgerService.transfer(tokenIn, {
      from_subaccount = sourceAccount.subaccount;
      to = mainAccount;
      amount = swapAmountIn;
      fee = null;
      memo = null;
      created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
    });
    switch transferToMain {
      case (#Err(e)) { return #err("Transfer to main account failed: " # TransferError.describe(e)) };
      case (#Ok(_)) {};
    };

    // Phase D — ICRC-2 Approve: Allow pool to spend from canister's main account
    // After Phase C transfer, main account has: swapAmountIn
    // The approve call will deduct another fee, leaving: swapAmountIn - tokenInFee
    // So we approve for: swapAmountIn - tokenInFee (what we'll have after approve fee)
    let approveAmount = (swapAmountIn - tokenInFee : Nat);

    let ledger: ICRC2Ledger = actor(tokenIn);
    let approveResult = await ledger.icrc2_approve({
      from_subaccount = null;  // Approve from main account (no subaccount)
      spender = { owner = poolPrincipal; subaccount = null };
      amount = approveAmount;  // What we'll have after approve fee deduction
      expected_allowance = null;
      expires_at = null;
      fee = ?tokenInFee;
      memo = null;
      created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
    });
    switch approveResult {
      case (#Err(e)) {
        let errMsg = switch(e) {
          case (#InsufficientFunds({ balance })) { "Insufficient funds for approve: " # Nat.toText(balance) };
          case (#BadFee({ expected_fee })) { "Bad fee for approve: expected " # Nat.toText(expected_fee) };
          case (#GenericError({ message; error_code })) { "Approve error " # Nat.toText(error_code) # ": " # message };
          case _ { "Approve failed" };
        };
        return #err(errMsg);
      };
      case (#Ok(_)) {};
    };

    // Phase E — DepositFrom: Pool pulls tokens from main account using the approval
    let depositResult = await pool.depositFrom({
      token = tokenIn;
      amount = approveAmount;  // Same as what we approved
      fee = tokenInFee
    });
    switch depositResult {
      case (#err(e)) { return #err("DepositFrom to pool failed: " # icpSwapErrorToText(e)) };
      case (#ok(_)) {};
    };

    // Phase E — Swap
    // swapAmountIn was reduced by the approve fee (Phase D) before hitting the
    // ledger, so the pool only credits us with approveAmount. Ask it to swap
    // exactly what we deposited, otherwise the pool traps with
    // "Illegal deposit balance in pool".
    let swapResult = await pool.swap({
      zeroForOne;
      amountIn = Nat.toText(approveAmount);
      amountOutMinimum = Nat.toText(amountOutMin);
    });
    let amountOut = switch swapResult {
      case (#err(e)) { return #err("Swap failed: " # icpSwapErrorToText(e)) };
      case (#ok(n)) { n };
    };

    // Slippage protection
    if (amountOut < amountOutMin) {
      return #err("Slippage exceeded: got " # Nat.toText(amountOut) # ", minimum " # Nat.toText(amountOutMin));
    };

    // Phase F — Withdraw from pool to canister main account
    // pool.withdraw deducts fee internally, so net amount arriving = amountOut - fee
    if (amountOut <= tokenOutFee) return #err("amountOut too small to cover ledger fee");

    let withdrawResult = await pool.withdraw({ token = tokenOut; fee = tokenOutFee; amount = amountOut });
    switch withdrawResult {
      case (#err(e)) { return #err("Withdraw from pool failed: " # icpSwapErrorToText(e)) };
      case (#ok(_)) {};
    };

    // Phase G — Transfer to user's subaccount
    // Pool already deducted fee, so we have (amountOut - tokenOutFee) in main account
    // Transfer that amount; ledger will deduct fee again, so user receives (amountOut - 2*tokenOutFee)
    let userSub = LedgerService.depositAccount(service.ledger, caller);
    let transferAmount = (amountOut - tokenOutFee : Nat);

    if (transferAmount <= tokenOutFee) {
      return #err("amountOut too small to cover final transfer fee");
    };

    let finalTransfer = await LedgerService.transfer(tokenOut, {
      from_subaccount = null;
      to = userSub;
      amount = transferAmount;
      fee = null;
      memo = null;
      created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
    });
    let blockIndex = switch finalTransfer {
      case (#Err(e)) { return #err("Transfer to user failed: " # TransferError.describe(e)) };
      case (#Ok(n)) { Nat64.fromNat(n) };
    };

    // User actually receives transferAmount - tokenOutFee after ledger deducts fee
    let actualReceived = (transferAmount - tokenOutFee : Nat);

    let now = Time.now();
    let txOutId = service.nextId();
    let txOut = TxRepo.create(
      service.txs, service.byUser, txOutId, user.id, #swapOut, tokenIn, amountIn, platformFee,
      tokenIn, tokenOut, null, now,
    );
    TxModel.complete(txOut, blockIndex, now);
    let txInId = service.nextId();
    let txIn = TxRepo.create(
      service.txs, service.byUser, txInId, user.id, #swapIn, tokenOut, actualReceived, tokenOutFee,
      tokenIn, tokenOut, null, now,
    );
    TxModel.complete(txIn, blockIndex, now);

    #ok({ blockIndex; amountIn = swapAmountIn; amountOut = actualReceived; platformFee; txId = txInId });
  };

  // ---------------------------------------------------------------------------
  // Pending swap retry — called by recurring timer
  // ---------------------------------------------------------------------------
  public func retryPending(service: SwapService): async () {
    for (p in SwapStorage.getAll(service.pending).vals()) {
      if (p.retries >= Config.MAX_SWAP_RETRIES) {
        // Exhausted — mark failed, keep row for admin visibility
        ignore TxRepo.failTx(service.txs, p.id, Time.now());
        SwapStorage.remove(service.pending, p.id);
      } else {
        switch (p.stage) {
          case (#awaitingPoolWithdraw) {
            let pool: ICPSwapPool = actor(p.poolId);
            // Check if funds already left the pool (idempotency guard)
            let bal = await pool.getUserUnusedBalance(p.caller);
            let alreadyGone = switch bal {
              case (#ok({ balance0; balance1 })) { balance0 == 0 and balance1 == 0 };
              case (#err(_)) { false };
            };
            if (alreadyGone) {
              p.stage := #awaitingUserTransfer;
              p.lastAttempt := Time.now();
            } else {
              let r = await pool.withdraw({ token = p.tokenOut; fee = p.tokenOutFee; amount = p.amountOut });
              switch r {
                case (#ok(_)) {
                  p.stage := #awaitingUserTransfer;
                  p.retries := 0;
                  p.lastAttempt := Time.now();
                };
                case (#err(_)) {
                  p.retries += 1;
                  p.lastAttempt := Time.now();
                };
              };
            };
          };
          case (#awaitingUserTransfer) {
            let userSub = LedgerService.depositAccount(service.ledger, p.caller);
            let now64 = Nat64.fromNat(Int.abs(Time.now()));
            // Use correct amount: pool already deducted fee, transfer will deduct again
            let transferAmount = (p.amountOut - p.tokenOutFee : Nat);
            let r = await LedgerService.transfer(p.tokenOut, {
              from_subaccount = null;
              to = userSub;
              amount = transferAmount;
              fee = null;
              memo = null;
              created_at_time = ?now64;
            });
            switch r {
              case (#Ok(n)) {
                ignore TxRepo.completeTx(service.txs, p.id, Nat64.fromNat(n), Time.now());
                SwapStorage.remove(service.pending, p.id);
              };
              case (#Err(_)) {
                p.retries += 1;
                p.lastAttempt := Time.now();
              };
            };
          };
        };
      };
    };
  };

  public func getPending(service: SwapService): [SwapStorage.PendingSwap] {
    SwapStorage.getAll(service.pending)
  };

  // ---------------------------------------------------------------------------
  // Pool lookup helpers
  // ---------------------------------------------------------------------------
  type PoolRef = { poolId: Text; zeroForOne: Bool; fee: Nat };

  func pairCacheKey(a: Text, b: Text): Text {
    if (a < b) { a # "#" # b } else { b # "#" # a };
  };

  // ICPSwap expects per-token standards: ICP, ICRC2 (chain-key), ICRC1 (SNS/other).
  func tokenStandard(ledgerId: Text): Text {
    if (ledgerId == Config.ICP_LEDGER_CANISTER_ID) { "ICP" }
    else if (Array.contains<Text>(Config.CHAIN_KEY_LEDGERS, func(x, y) { x == y }, ledgerId)) {
      "ICRC2"
    } else { "ICRC1" };
  };

  func getPool(service: SwapService, tokenIn: Text, tokenOut: Text): async { #ok: PoolRef; #err: Text } {
    let cacheKey = pairCacheKey(tokenIn, tokenOut);
    switch (service.poolCache.get(cacheKey)) {
      case (?cached) {
        return #ok({
          poolId = cached.poolId;
          zeroForOne = tokenIn == cached.token0;
          fee = cached.fee;
        });
      };
      case (null) {};
    };
    let factory: ICPSwapFactory = actor(Config.ICPSWAP_FACTORY);
    let (t0, t1) = if (tokenIn < tokenOut) { (tokenIn, tokenOut) } else { (tokenOut, tokenIn) };
    // Try fee tiers lowest first: 500 (0.05%), 3000 (0.3%), 10000 (1%)
    for (fee in [500, 3000, 10000].vals()) {
      let result = await factory.getPool({
        token0 = { address = t0; standard = tokenStandard(t0) };
        token1 = { address = t1; standard = tokenStandard(t1) };
        fee;
      });
      switch result {
        case (#ok(pool)) {
          let pid = Principal.toText(pool.canisterId);
          service.poolCache.add(cacheKey, { poolId = pid; token0 = pool.token0.address; fee = pool.fee });
          return #ok({
            poolId = pid;
            zeroForOne = tokenIn == pool.token0.address;
            fee = pool.fee;
          });
        };
        case (#err(_)) {};
      };
    };
    #err("No pool found for " # tokenIn # " / " # tokenOut);
  };
};
