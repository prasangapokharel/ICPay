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
    escrows:  SwapStorage.EscrowMap;
    nextId:   () -> Text;
    limits:   RateLimitStorage.RateLimitMap;
    // Transient pool cache: sorted pair key -> pool metadata. Rebuilt each session.
    poolCache: Map.Map<Text, CachedPool>;
    // One in-flight swap per caller — blocks parallel executeSwap before escrow opens.
    activeSwaps: Map.Map<Principal, Bool>;
  };

  public func create(
    users:   UserStorage.UserMap,
    txs:     TxStorage.TxList,
    byUser:  TxStorage.TxByUser,
    ledger:  LedgerService.LedgerService,
    pending: SwapStorage.PendingMap,
    escrows: SwapStorage.EscrowMap,
    nextId:  () -> Text,
    limits:  RateLimitStorage.RateLimitMap,
  ): SwapService {
    { users; txs; byUser; ledger; pending; escrows; nextId; limits; poolCache = Map.empty<Text, CachedPool>(); activeSwaps = Map.empty<Principal, Bool>() };
  };

  func acquireSwapLock(service: SwapService, caller: Principal): ?Text {
    switch (service.activeSwaps.get(caller)) {
      case (?true) { ?"A swap is already in progress — wait for it to finish" };
      case (?false) {
        service.activeSwaps.add(caller, true);
        null;
      };
      case (null) {
        service.activeSwaps.add(caller, true);
        null;
      };
    };
  };

  func releaseSwapLock(service: SwapService, caller: Principal) {
    service.activeSwaps.remove(caller);
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
  func isSwapBlocked(ledgerId: Text): Bool {
    ledgerId == Config.ICPAY_LEDGER_ID
  };

  public func quote(
    service:  SwapService,
    tokenIn:  Text,
    tokenOut: Text,
    amountIn: Nat,
  ): async Types.ApiResult<Types.SwapQuoteResult> {
    if (isSwapBlocked(tokenIn) or isSwapBlocked(tokenOut)) {
      return #err("ICPAY cannot be swapped on ICPay");
    };
    if (not LedgerService.isAllowed(service.ledger, tokenIn))  return #err("Unsupported token: " # tokenIn);
    if (not LedgerService.isAllowed(service.ledger, tokenOut)) return #err("Unsupported token: " # tokenOut);
    if (tokenIn == tokenOut) return #err("tokenIn and tokenOut must differ");
    if (amountIn == 0) return #err("amountIn must be > 0");

    let icpServiceFee = Config.SWAP_ICP_SERVICE_FEE_E8S;

    let futureTokenInFee  = LedgerService.getFee(tokenIn);
    let futureTokenOutFee = LedgerService.getFee(tokenOut);
    let futurePool        = getPool(service, tokenIn, tokenOut);

    let tokenInFee  = await futureTokenInFee;
    let tokenOutFee = await futureTokenOutFee;
    let poolResult  = await futurePool;
    switch poolResult {
      case (#err(e)) { return #err(e) };
      case (#ok({ poolId; zeroForOne; fee; token0 = _ })) {
        let pool: ICPSwapPool = actor(poolId);
        let quoteAmountIn = (amountIn - tokenInFee : Nat);
        if (quoteAmountIn == 0) return #err("amountIn too small after ledger fee");
        switch (await pool.quote({ zeroForOne; amountIn = Nat.toText(quoteAmountIn); amountOutMinimum = "0" })) {
          case (#err(e)) { return #err("Quote failed: " # icpSwapErrorToText(e)) };
          case (#ok(amountOut)) {
            if (amountOut == 0) {
              return #err("No pool liquidity for this swap direction");
            };
            let swapFee = quoteAmountIn * fee / 1_000_000;
            let netOut = if (amountOut > 2 * tokenOutFee) {
              (amountOut - (2 * tokenOutFee) : Nat)
            } else { 0 };
            #ok({
              amountOut = netOut;
              amountOutRaw = amountOut;
              icpServiceFee;
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
    if (isSwapBlocked(tokenIn) or isSwapBlocked(tokenOut)) {
      return #err("ICPAY cannot be swapped on ICPay");
    };
    if (not LedgerService.isAllowed(service.ledger, tokenIn))  return #err("Unsupported token: " # tokenIn);
    if (not LedgerService.isAllowed(service.ledger, tokenOut)) return #err("Unsupported token: " # tokenOut);
    if (tokenIn == tokenOut) return #err("tokenIn and tokenOut must differ");
    if (amountOutMin == 0) return #err("amountOutMin must be > 0");

    if (SwapStorage.hasOpenEscrow(service.escrows, caller, tokenIn, tokenOut, amountIn)) {
      return #err("Recover your previous failed swap for this amount before trying again");
    };

    switch (acquireSwapLock(service, caller)) {
      case (?msg) { return #err(msg) };
      case (null) {};
    };

    let user = switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?u) { u };
      case (null) {
        releaseSwapLock(service, caller);
        return #err("User not found");
      };
    };

    let icpServiceFee = Config.SWAP_ICP_SERVICE_FEE_E8S;
    let icpLedger = Config.ICP_LEDGER_CANISTER_ID;
    let treasury = Principal.fromText(Config.TREASURY);
    let sourceAccount = LedgerService.depositAccount(service.ledger, caller);

    let futureTokenInFee  = LedgerService.getFee(tokenIn);
    let futureTokenOutFee = LedgerService.getFee(tokenOut);
    let futureIcpFee      = LedgerService.getFee(icpLedger);
    let futureUserBalance = LedgerService.getBalance(tokenIn, sourceAccount);
    let futureIcpBalance  = if (tokenIn == icpLedger) { null } else {
      ?LedgerService.getBalance(icpLedger, sourceAccount)
    };
    let futurePool        = getPool(service, tokenIn, tokenOut);

    let tokenInFee  = await futureTokenInFee;
    let tokenOutFee = await futureTokenOutFee;
    let icpFee      = await futureIcpFee;
    let poolResult  = await futurePool;

    let tokenRequired = amountIn + (3 * tokenInFee);
    let icpRequired = icpServiceFee + icpFee;

    let (poolId, zeroForOne) = switch poolResult {
      case (#err(e)) {
        releaseSwapLock(service, caller);
        return #err(e);
      };
      case (#ok(r)) { (r.poolId, r.zeroForOne) };
    };
    let pool: ICPSwapPool = actor(poolId);
    let depositAmount = (amountIn - tokenInFee : Nat);
    if (depositAmount == 0) {
      releaseSwapLock(service, caller);
      return #err("amountIn too small after ledger fee");
    };

    let futureQuote = pool.quote({ zeroForOne; amountIn = Nat.toText(depositAmount); amountOutMinimum = "0" });
    let userBalance = await futureUserBalance;
    let icpBalance = switch (futureIcpBalance) {
      case (null) { userBalance };
      case (?f) { await f };
    };

    if (tokenIn == icpLedger) {
      let required = amountIn + (3 * tokenInFee) + icpServiceFee + icpFee;
      if (userBalance < required) {
        releaseSwapLock(service, caller);
        return #err("Insufficient ICP. Need " # Nat.toText(required) # " (swap + service fee + ledger fees), have " # Nat.toText(userBalance))
      };
    } else {
      if (userBalance < tokenRequired) {
        releaseSwapLock(service, caller);
        return #err("Insufficient balance. Need " # Nat.toText(tokenRequired) # " (including fees), have " # Nat.toText(userBalance))
      };
      if (icpBalance < icpRequired) {
        releaseSwapLock(service, caller);
        return #err("Insufficient ICP for service fee. Need " # Nat.toText(icpRequired) # " e8s, have " # Nat.toText(icpBalance))
      };
    };

    switch (await futureQuote) {
      case (#err(e)) {
        releaseSwapLock(service, caller);
        return #err("Quote failed: " # icpSwapErrorToText(e));
      };
      case (#ok(out)) {
        if (out == 0) {
          releaseSwapLock(service, caller);
          return #err("No pool liquidity for this swap direction");
        };
        if (out < amountOutMin) {
          releaseSwapLock(service, caller);
          return #err("Slippage exceeded: quoted " # Nat.toText(out) # ", minimum " # Nat.toText(amountOutMin));
        };
      };
    };

    let poolPrincipal = Principal.fromText(poolId);

    // Service fee in ICP — replaces the old tokenIn platform-fee skim.
    switch (await LedgerService.transfer(icpLedger, {
      from_subaccount = sourceAccount.subaccount;
      to = AccountHelper.defaultAccount(treasury);
      amount = icpServiceFee;
      fee = null;
      memo = null;
      created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
    })) {
      case (#Err(e)) {
        releaseSwapLock(service, caller);
        return #err("ICP service fee transfer failed: " # TransferError.describe(e));
      };
      case (#Ok(_)) {};
    };

    let mainAccount = AccountHelper.defaultAccount(service.ledger.custodian);
    let transferToMainAmount = amountIn + tokenInFee;

    switch (await LedgerService.transfer(tokenIn, {
      from_subaccount = sourceAccount.subaccount;
      to = mainAccount;
      amount = transferToMainAmount;
      fee = null;
      memo = null;
      created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
    })) {
      case (#Err(e)) {
        releaseSwapLock(service, caller);
        return #err("Transfer to main account failed: " # TransferError.describe(e));
      };
      case (#Ok(_)) {};
    };

    openEscrow(service, caller, tokenIn, tokenOut, amountIn, tokenInFee, poolId, transferToMainAmount);

    let ledger: ICRC2Ledger = actor(tokenIn);
    switch (await ledger.icrc2_approve({
      from_subaccount = null;
      spender = { owner = poolPrincipal; subaccount = null };
      amount = amountIn;
      expected_allowance = null;
      expires_at = null;
      fee = ?tokenInFee;
      memo = null;
      created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
    })) {
      case (#Err(e)) {
        let errMsg = switch(e) {
          case (#InsufficientFunds({ balance })) { "Insufficient funds for approve: " # Nat.toText(balance) };
          case (#BadFee({ expected_fee })) { "Bad fee for approve: expected " # Nat.toText(expected_fee) };
          case (#GenericError({ message; error_code })) { "Approve error " # Nat.toText(error_code) # ": " # message };
          case _ { "Approve failed" };
        };
        let refunded = await returnToUser(service, caller, tokenIn, tokenInFee, transferToMainAmount);
        if (refunded) { closeEscrow(service, caller, tokenIn, tokenOut, amountIn) };
        releaseSwapLock(service, caller);
        return swapAbort(errMsg, refunded);
      };
      case (#Ok(_)) {
        setEscrowMain(service, caller, tokenIn, tokenOut, amountIn, amountIn);
      };
    };

    // Phase E — DepositFrom: pool icrc2_transfer_from pulls amount + fee.
    let depositResult = await pool.depositFrom({
      token = tokenIn;
      amount = depositAmount;
      fee = tokenInFee
    });
    switch depositResult {
      case (#err(e)) {
        return await failAndRefund(service, caller, tokenIn, tokenOut, amountIn, tokenInFee, pool, "DepositFrom to pool failed: " # icpSwapErrorToText(e));
      };
      case (#ok(_)) {
        setEscrowPool(service, caller, tokenIn, tokenOut, amountIn, depositAmount);
      };
    };

    // Phase F — Swap exactly what was deposited (depositAmount).
    let swapResult = await pool.swap({
      zeroForOne;
      amountIn = Nat.toText(depositAmount);
      amountOutMinimum = Nat.toText(amountOutMin);
    });
    let amountOut = switch swapResult {
      case (#err(e)) {
        return await failAndRefund(service, caller, tokenIn, tokenOut, amountIn, tokenInFee, pool, "Swap failed: " # icpSwapErrorToText(e));
      };
      case (#ok(n)) { n };
    };

    // Slippage protection
    if (amountOut < amountOutMin) {
      return await failAndRefund(
        service, caller, tokenIn, tokenOut, amountIn, tokenInFee, pool,
        "Slippage exceeded: got " # Nat.toText(amountOut) # ", minimum " # Nat.toText(amountOutMin),
      );
    };

    // Phase F — Withdraw from pool to canister main account
    // pool.withdraw deducts fee internally, so net amount arriving = amountOut - fee
    if (amountOut <= tokenOutFee) {
      releaseSwapLock(service, caller);
      return #err("amountOut too small to cover ledger fee");
    };

    let withdrawResult = await pool.withdraw({ token = tokenOut; fee = tokenOutFee; amount = amountOut });
    switch withdrawResult {
      case (#err(e)) {
        // Output still in pool — input was already swapped; record pending for retry.
        releaseSwapLock(service, caller);
        return #err("Withdraw from pool failed: " # icpSwapErrorToText(e));
      };
      case (#ok(_)) {};
    };

    // Phase G — Transfer to user's subaccount.
    // pool.withdraw leaves (amountOut - fee) on main; icrc1_transfer debits amount + fee.
    let userSub = LedgerService.depositAccount(service.ledger, caller);
    let payout = if (amountOut > 2 * tokenOutFee) {
      (amountOut - (2 * tokenOutFee) : Nat)
    } else { 0 };

    if (payout == 0) {
      releaseSwapLock(service, caller);
      return #err("amountOut too small to cover output ledger fees");
    };

    let finalTransfer = await LedgerService.transfer(tokenOut, {
      from_subaccount = null;
      to = userSub;
      amount = payout;
      fee = null;
      memo = null;
      created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
    });
    let blockIndex = switch finalTransfer {
      case (#Err(e)) {
        ignore returnToUser(service, caller, tokenOut, tokenOutFee, payout);
        releaseSwapLock(service, caller);
        return #err("Transfer to user failed: " # TransferError.describe(e));
      };
      case (#Ok(n)) { Nat64.fromNat(n) };
    };

    let actualReceived = payout;

    let now = Time.now();
    let txOutId = service.nextId();
    let txOut = TxRepo.create(
      service.txs, service.byUser, txOutId, user.id, #swapOut, tokenIn, amountIn, icpServiceFee,
      tokenIn, tokenOut, null, now,
    );
    TxModel.complete(txOut, blockIndex, now);
    let txInId = service.nextId();
    let txIn = TxRepo.create(
      service.txs, service.byUser, txInId, user.id, #swapIn, tokenOut, actualReceived, tokenOutFee,
      tokenIn, tokenOut, null, now,
    );
    TxModel.complete(txIn, blockIndex, now);

    closeEscrow(service, caller, tokenIn, tokenOut, amountIn);

    releaseSwapLock(service, caller);
    #ok({ blockIndex; amountIn; amountOut = actualReceived; icpServiceFee; txId = txInId });
  };

  // Only succeeds when a failed swap escrow exists for this caller + pair + amount.
  public func recoverFailedSwapInput(
    service: SwapService,
    caller:   Principal,
    tokenIn:  Text,
    tokenOut: Text,
    amountIn: Nat,
  ): async Types.ApiResult<Nat> {
    if (Principal.isAnonymous(caller)) return #err("Not authenticated");
    if (not LedgerService.isAllowed(service.ledger, tokenIn)) {
      return #err("Unsupported token: " # tokenIn);
    };
    if (amountIn == 0) return #err("amountIn must be > 0");
    switch (UserRepo.getByPrincipal(service.users, caller)) {
      case (?_) {};
      case (null) { return #err("User not found") };
    };

    switch (SwapStorage.getEscrow(service.escrows, caller, tokenIn, tokenOut, amountIn)) {
      case (null) {
        return #err("No failed swap found — only a genuine failed swap can be recovered");
      };
      case (?e) {
        if (e.refundDue == 0 and e.poolDeposit == 0) {
          return #err("This swap was already recovered");
        };
        var refunded = true;
        var returned = 0;
        if (e.refundDue > 0) {
          refunded := await returnToUser(service, caller, tokenIn, e.tokenInFee, e.refundDue);
          if (refunded) {
            returned += (e.refundDue - e.tokenInFee : Nat);
          };
        };
        if (refunded and e.poolDeposit > 0) {
          let pool: ICPSwapPool = actor(e.poolId);
          refunded := await returnPoolDeposit(service, caller, pool, tokenIn, e.tokenInFee, e.poolDeposit);
          if (refunded) {
            returned += (e.poolDeposit - e.tokenInFee : Nat);
          };
        };
        if (not refunded) {
          return #err("Recovery transfer failed — try again or contact support");
        };
        closeEscrow(service, caller, tokenIn, tokenOut, amountIn);
        #ok(returned);
      };
    };
  };

  // Controller-only: release a swap leg stuck on main from before escrow existed.
  public func adminReleaseStuckSwapLeg(
    service: SwapService,
    admin:   Principal,
    user:    Principal,
    tokenIn: Text,
    amountIn: Nat,
  ): async Types.ApiResult<Nat> {
    if (not Principal.isController(admin)) return #err("Not authorized");
    if (not LedgerService.isAllowed(service.ledger, tokenIn)) {
      return #err("Unsupported token: " # tokenIn);
    };
    if (amountIn == 0) return #err("amountIn must be > 0");
    switch (UserRepo.getByPrincipal(service.users, user)) {
      case (?_) {};
      case (null) { return #err("User not found") };
    };
    let fee = await LedgerService.getFee(tokenIn);
    let ok = await returnToUser(service, user, tokenIn, fee, amountIn);
    if (not ok) return #err("Nothing to release or transfer failed");
    for (e in SwapStorage.getAllEscrows(service.escrows).vals()) {
      if (Principal.equal(e.caller, user) and e.tokenIn == tokenIn and e.amountIn == amountIn) {
        closeEscrow(service, user, tokenIn, e.tokenOut, amountIn);
      };
    };
    #ok((amountIn - fee : Nat));
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
            let payout = if (p.amountOut > 2 * p.tokenOutFee) {
              (p.amountOut - (2 * p.tokenOutFee) : Nat)
            } else { 0 };
            if (payout == 0) {
              p.retries += 1;
              p.lastAttempt := Time.now();
            } else {
            let r = await LedgerService.transfer(p.tokenOut, {
              from_subaccount = null;
              to = userSub;
              amount = payout;
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
  };

  public func getPending(service: SwapService): [SwapStorage.PendingSwap] {
    SwapStorage.getAll(service.pending)
  };

  // ---------------------------------------------------------------------------
  // Pool lookup helpers
  // ---------------------------------------------------------------------------
  type PoolRef = { poolId: Text; zeroForOne: Bool; fee: Nat; token0: Text };

  // Main is shared across swaps — only return the leg this attempt moved, capped
  // by what is actually on main, so one user's refund never touches another's.
  func returnToUser(
    service: SwapService,
    caller: Principal,
    tokenIn: Text,
    tokenInFee: Nat,
    maxAmount: Nat,
  ): async Bool {
    if (maxAmount == 0) { return true };
    let main = AccountHelper.defaultAccount(service.ledger.custodian);
    let userSub = LedgerService.depositAccount(service.ledger, caller);
    let mainBal = await LedgerService.getBalance(tokenIn, main);
    let cap = if (maxAmount < mainBal) { maxAmount } else { mainBal };
    if (cap > tokenInFee) {
      let payout = Nat.sub(cap, tokenInFee);
      switch (await LedgerService.transfer(tokenIn, {
        from_subaccount = null;
        to = userSub;
        amount = payout;
        fee = null;
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
      })) {
        case (#Ok(_)) { true };
        case (#Err(_)) { false };
      }
    } else {
      cap == 0
    };
  };

  func returnPoolDeposit(
    service: SwapService,
    caller: Principal,
    pool: ICPSwapPool,
    tokenIn: Text,
    tokenInFee: Nat,
    depositAmount: Nat,
  ): async Bool {
    if (depositAmount == 0) { return true };
    switch (await pool.withdraw({ token = tokenIn; fee = tokenInFee; amount = depositAmount })) {
      case (#err(_)) { false };
      case (#ok(_)) { await returnToUser(service, caller, tokenIn, tokenInFee, depositAmount) };
    };
  };

  func swapAbort(msg: Text, refunded: Bool): Types.ApiResult<Types.SwapResult> {
    if (refunded) {
      #err(msg # ". Your swap amount was returned to your wallet.")
    } else {
      #err(msg # ". Refund failed — use Recover on the swap page or contact support.")
    };
  };

  func openEscrow(
    service: SwapService,
    caller: Principal,
    tokenIn: Text,
    tokenOut: Text,
    amountIn: Nat,
    tokenInFee: Nat,
    poolId: Text,
    refundDue: Nat,
  ) {
    ignore SwapStorage.putEscrow(service.escrows, {
      caller;
      tokenIn;
      tokenOut;
      amountIn;
      var refundDue = refundDue;
      var poolDeposit = 0;
      tokenInFee;
      poolId;
      createdAt = Time.now();
    });
  };

  func setEscrowMain(
    service: SwapService,
    caller: Principal,
    tokenIn: Text,
    tokenOut: Text,
    amountIn: Nat,
    refundDue: Nat,
  ) {
    switch (SwapStorage.getEscrow(service.escrows, caller, tokenIn, tokenOut, amountIn)) {
      case (?e) { e.refundDue := refundDue };
      case (null) {};
    };
  };

  func setEscrowPool(
    service: SwapService,
    caller: Principal,
    tokenIn: Text,
    tokenOut: Text,
    amountIn: Nat,
    poolDeposit: Nat,
  ) {
    switch (SwapStorage.getEscrow(service.escrows, caller, tokenIn, tokenOut, amountIn)) {
      case (?e) {
        e.refundDue := 0;
        e.poolDeposit := poolDeposit;
      };
      case (null) {};
    };
  };

  func closeEscrow(
    service: SwapService,
    caller: Principal,
    tokenIn: Text,
    tokenOut: Text,
    amountIn: Nat,
  ) {
    SwapStorage.removeEscrow(service.escrows, caller, tokenIn, tokenOut, amountIn);
  };

  func failAndRefund(
    service: SwapService,
    caller: Principal,
    tokenIn: Text,
    tokenOut: Text,
    amountIn: Nat,
    tokenInFee: Nat,
    pool: ICPSwapPool,
    msg: Text,
  ): async Types.ApiResult<Types.SwapResult> {
    switch (SwapStorage.getEscrow(service.escrows, caller, tokenIn, tokenOut, amountIn)) {
      case (?e) {
        var refunded = true;
        if (e.refundDue > 0) {
          refunded := await returnToUser(service, caller, tokenIn, tokenInFee, e.refundDue);
        };
        if (refunded and e.poolDeposit > 0) {
          refunded := await returnPoolDeposit(service, caller, pool, tokenIn, tokenInFee, e.poolDeposit);
        };
        if (refunded) { closeEscrow(service, caller, tokenIn, tokenOut, amountIn) };
        releaseSwapLock(service, caller);
        swapAbort(msg, refunded);
      };
      case (null) {
        releaseSwapLock(service, caller);
        swapAbort(msg, false);
      };
    };
  };

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
          token0 = cached.token0;
        });
      };
      case (null) {};
    };
    let factory: ICPSwapFactory = actor(Config.ICPSWAP_FACTORY);
    let (t0, t1) = if (tokenIn < tokenOut) { (tokenIn, tokenOut) } else { (tokenOut, tokenIn) };
    let token0 = { address = t0; standard = tokenStandard(t0) };
    let token1 = { address = t1; standard = tokenStandard(t1) };
    // All three fee tiers in flight — same pattern as the frontend quote path.
    let future500 = factory.getPool({ token0; token1; fee = 500 });
    let future3000 = factory.getPool({ token0; token1; fee = 3000 });
    let future10000 = factory.getPool({ token0; token1; fee = 10000 });
    let hits = [await future500, await future3000, await future10000];
    for (result in hits.vals()) {
      switch result {
        case (#ok(pool)) {
          let pid = Principal.toText(pool.canisterId);
          service.poolCache.add(cacheKey, { poolId = pid; token0 = pool.token0.address; fee = pool.fee });
          return #ok({
            poolId = pid;
            zeroForOne = tokenIn == pool.token0.address;
            fee = pool.fee;
            token0 = pool.token0.address;
          });
        };
        case (#err(_)) {};
      };
    };
    #err("No pool found for " # tokenIn # " / " # tokenOut);
  };
};
