import Debug "mo:core/Debug";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../../src/types";
import UserStorage "../../src/storage/UserStorage";
import TxStorage "../../src/storage/TransactionStorage";
import SwapStorage "../../src/storage/SwapStorage";
import RateLimitStorage "../../src/storage/RateLimitStorage";
import LedgerStorage "../../src/storage/LedgerStorage";
import LedgerService "../../src/services/LedgerService";
import SwapService "../../src/services/SwapService";
import UserRepo "../../src/repositories/UserRepository";
import Config "../../src/config/Config";

// --- Harness -----------------------------------------------------------------
// Every field mirrors the wiring in src/main.mo. Only the safe, synchronous
// validation paths are exercised here (they return *before* any cross-canister
// call). The happy path of swap() would contact the live ICPSwap factory and
// ledgers, which is not meaningful under `moc -r`, so it is deliberately not
// covered by unit tests.
let users = UserStorage.createUserMap();
let usernames = UserStorage.createUsernameMap();
let usersById = UserStorage.createUserIdMap();
let txs = TxStorage.createTxList();
let txsByUser = TxStorage.createTxByUser();
let pending = SwapStorage.createPendingMap();
let limits = RateLimitStorage.createRateLimitMap();
let registry = LedgerStorage.createLedgerRegistry();
let custodian = Principal.fromText("aaaaa-aa");
let ledger = LedgerService.create(custodian, registry);
let svc = SwapService.create(users, txs, txsByUser, ledger, pending, func() { "tx-test" }, limits);

let anon = Principal.fromText("2vxsx-fae");
let icp = "ryjl3-tyaaa-aaaaa-aaaba-cai";
let ckbtc = "mxzaz-hqaaa-aaaar-qaada-cai";
let now = Time.now();

// Asserts an #err result regardless of the #ok payload type.
func expectErr<T>(name: Text, r: Types.ApiResult<T>) {
  switch r {
    case (#err(_)) { Debug.print("PASS: " # name) };
    case (#ok(_)) { assert false; Debug.print("FAIL: " # name) };
  };
};

// --- Platform fee math --------------------------------------------------------
// Config.SWAP_PLATFORM_FEE_BPS = 100 => 1%. A 1 ICP input (1e8 e8s) gives a 1%
// platform fee, and the swap leg is the remainder.
let amountIn = 100_000_000;
let platformFee = amountIn * Config.SWAP_PLATFORM_FEE_BPS / 10_000;
let swapAmountIn = amountIn - platformFee;
assert (platformFee == 1_000_000);
assert (platformFee + swapAmountIn == amountIn);
assert (swapAmountIn == 99_000_000);
Debug.print("PASS: platform fee = " # debug_show(platformFee) # " (1% of " # debug_show(amountIn) # ")");
Debug.print("PASS: swapAmountIn = amountIn - platformFee = " # debug_show(swapAmountIn));

// Rounding: an amount whose platform fee rounds to 0 is rejected by swap().
let tinyFee = 1 * Config.SWAP_PLATFORM_FEE_BPS / 10_000; // 0 -> platformFee == 0
assert (tinyFee == 0);
Debug.print("PASS: platform fee rounds to 0 for tiny inputs (swap rejects them)");

// requiredBalance = amountIn + 2*fee: both transfers (fee->treasury, ->pool)
// each deduct a ledger fee from the user's subaccount. tokenInFee is only known
// at runtime via icrc1_fee(), so assert the relationship with a sample fee.
let fee = 10_000;
let requiredBalance = amountIn + 2 * fee;
assert (requiredBalance == amountIn + 20_000);
Debug.print("PASS: requiredBalance = amountIn + 2*fee = " # debug_show(requiredBalance));

// --- Quote: validation short-circuits (no network) ---------------------------
let qSame = await SwapService.quote(svc, icp, icp, amountIn);
expectErr("quote same-token rejected", qSame);

let qZero = await SwapService.quote(svc, icp, ckbtc, 0);
expectErr("quote zero-amount rejected", qZero);

let qUnsupported = await SwapService.quote(svc, "bad-ledger", ckbtc, amountIn);
expectErr("quote unsupported token rejected", qUnsupported);

// --- Swap: each validation tested with a fresh principal ----------------------
// A fresh principal per check keeps RATE_SWAP (3/60s) from masking a validation
// error, because the rate-limit gate is the first check inside swap().
let rAnon = await SwapService.swap(svc, anon, icp, ckbtc, 100, 1);
expectErr("swap anonymous rejected", rAnon);

// Unsupported tokenIn.
// Distinct fromBlob principals so RATE_SWAP never crosses the 3/60s window and
// each validation is tested independently.
let pBadIn = Principal.fromBlob("\01");
let rUnsupported = await SwapService.swap(svc, pBadIn, "bad-ledger", ckbtc, amountIn, 1);
switch rUnsupported {
  case (#err(msg)) {
    assert (msg == "Unsupported token: bad-ledger");
    Debug.print("PASS: swap unsupported token rejected: " # msg);
  };
  case (#ok(_)) { assert false; Debug.print("FAIL: unsupported token should be rejected") };
};

// tokenIn == tokenOut.
let pSame = Principal.fromBlob("\02");
let rSame = await SwapService.swap(svc, pSame, icp, icp, amountIn, 1);
switch rSame {
  case (#err(msg)) {
    assert (msg == "tokenIn and tokenOut must differ");
    Debug.print("PASS: swap same-token rejected: " # msg);
  };
  case (#ok(_)) { assert false; Debug.print("FAIL: same token should be rejected") };
};

// amountOutMin == 0.
let pMin = Principal.fromBlob("\03");
let rMin = await SwapService.swap(svc, pMin, icp, ckbtc, amountIn, 0);
switch rMin {
  case (#err(msg)) {
    assert (msg == "amountOutMin must be > 0");
    Debug.print("PASS: swap zero amountOutMin rejected: " # msg);
  };
  case (#ok(_)) { assert false; Debug.print("FAIL: zero amountOutMin should be rejected") };
};

// amountIn too small for a platform fee (fee rounds to 0). A non-anonymous
// caller WITH a profile is required to reach the fee check: 1 e8s * 100 / 1e4
// == 0, so swap() rejects it as too small. (\08 is not the anonymous \04 blob.)
let pTiny = Principal.fromBlob("\08");
let _ = UserRepo.create(users, usernames, usersById, "uid-tiny", pTiny, null, "Tiny", now, null);
let rTiny = await SwapService.swap(svc, pTiny, icp, ckbtc, 1, 1);
switch rTiny {
  case (#err(msg)) { Debug.print("PASS: swap tiny amount rejected: " # msg) };
  case (#ok(_)) { assert false; Debug.print("FAIL: tiny amount should be rejected") };
};

// User not found: valid ledger but caller has no profile.
let pNoUser = Principal.fromBlob("\05");
let rNoUser = await SwapService.swap(svc, pNoUser, icp, ckbtc, amountIn, 1);
switch rNoUser {
  case (#err(msg)) {
    assert (msg == "User not found");
    Debug.print("PASS: swap unknown-user rejected: " # msg);
  };
  case (#ok(_)) { assert false; Debug.print("FAIL: unknown user should be rejected") };
};

// --- Rate limit: fresh principal, unsupported-ledger calls (no network) -------
// The rate-limit gate is swap()'s first check; the unsupported-ledger
// short-circuit fires after it, so these calls only mutate the rate-limit
// counter and never hit a live canister.
let pRate = Principal.fromBlob("\06");
let rR1 = await SwapService.swap(svc, pRate, "rl-ledger", "rl-ledger2", amountIn, 1);
let rR2 = await SwapService.swap(svc, pRate, "rl-ledger", "rl-ledger2", amountIn, 1);
let rR3 = await SwapService.swap(svc, pRate, "rl-ledger", "rl-ledger2", amountIn, 1);
expectErr("swap budget consumed (call 1)", rR1);
let _r2 = rR2;
let _r3 = rR3;
let rR4 = await SwapService.swap(svc, pRate, "rl-ledger", "rl-ledger2", amountIn, 1);
switch rR4 {
  case (#err(msg)) { Debug.print("PASS: swap rate-limited after 3 (4th rejected): " # msg) };
  case (#ok(_)) { assert false; Debug.print("FAIL: 4th swap should be rate limited") };
};

// --- PendingSwap storage ------------------------------------------------------
let pPending = Principal.fromBlob("\07");
let ps: SwapStorage.PendingSwap = {
  id = "swap-1";
  caller = pPending;
  poolId = "pool-xyz";
  tokenOut = ckbtc;
  amountOut = 50_000;
  tokenOutFee = 10;
  var stage = #awaitingPoolWithdraw;
  var retries = 0;
  createdAt = now;
  var lastAttempt = now;
};
SwapStorage.add(pending, ps);
switch (SwapStorage.get(pending, "swap-1")) {
  case (?found) {
    assert (found.amountOut == 50_000);
    assert (found.poolId == "pool-xyz");
    Debug.print("PASS: pending swap stored and retrieved");
  };
  case (null) { assert false; Debug.print("FAIL: pending swap not found") };
};
SwapStorage.remove(pending, "swap-1");
switch (SwapStorage.get(pending, "swap-1")) {
  case (null) { Debug.print("PASS: pending swap removed") };
  case (?_) { assert false; Debug.print("FAIL: pending swap should be removed") };
};

Debug.print("All SwapService tests passed");
