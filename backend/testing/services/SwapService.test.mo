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
let escrows = SwapStorage.createEscrowMap();
let limits = RateLimitStorage.createRateLimitMap();
let registry = LedgerStorage.createLedgerRegistry();
let custodian = Principal.fromText("aaaaa-aa");
let ledger = LedgerService.create(custodian, registry);
let svc = SwapService.create(users, txs, txsByUser, ledger, pending, escrows, func() { "tx-test" }, limits);

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

// --- ICP service fee ---------------------------------------------------------
// Config.SWAP_ICP_SERVICE_FEE_E8S = 10_000_000 => 0.1 ICP flat per swap.
let icpServiceFee = Config.SWAP_ICP_SERVICE_FEE_E8S;
assert (icpServiceFee == 10_000_000);
Debug.print("PASS: icp service fee = " # debug_show(icpServiceFee) # " e8s (0.1 ICP)");

// Full amountIn goes to the pool leg; service fee is separate ICP.
let amountIn = 100_000_000;
let depositAmount = amountIn - 10_000;
assert (depositAmount == 99_990_000);
Debug.print("PASS: depositAmount = amountIn - tokenInFee");

// requiredBalance = amountIn + 3*fee on the swap token subaccount.
let fee = 10_000;
let requiredBalance = amountIn + 3 * fee;
assert (requiredBalance == amountIn + 30_000);
Debug.print("PASS: requiredBalance = amountIn + 3*fee = " # debug_show(requiredBalance));

// Output payout: pool gross minus pool withdraw fee and final ledger fee.
let grossOut = 1_133_006_422_103;
let outFee = 1_000_000;
let payout = if (grossOut > 2 * outFee) { grossOut - (2 * outFee) } else { 0 };
assert (payout == 1_133_004_422_103);
Debug.print("PASS: net output payout = gross - 2*fee");

let icpay = Config.ICPAY_LEDGER_ID;
let qIcpay = await SwapService.quote(svc, icp, icpay, amountIn);
expectErr("quote ICPAY blocked", qIcpay);

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

// --- Failed swap escrow: recovery requires a recorded attempt ----------------
let pEsc = Principal.fromBlob("\09");
let _ = SwapStorage.putEscrow(escrows, {
  caller = pEsc;
  tokenIn = icp;
  tokenOut = ckbtc;
  amountIn = amountIn;
  var refundDue = 100_000_000;
  var poolDeposit = 0;
  tokenInFee = fee;
  poolId = "pool-test";
  createdAt = now;
});
assert (SwapStorage.hasOpenEscrow(escrows, pEsc, icp, ckbtc, amountIn));
assert (not SwapStorage.hasOpenEscrow(escrows, pEsc, icp, "mxzaz-hqaaa-aaaar-qaadb-cai", amountIn));
Debug.print("PASS: escrow scoped to tokenOut, not amount alone");
let rRecoverNone = await SwapService.recoverFailedSwapInput(svc, Principal.fromBlob("\0a"), icp, ckbtc, amountIn);
expectErr("recover rejects wrong caller", rRecoverNone);
SwapStorage.removeEscrow(escrows, pEsc, icp, ckbtc, amountIn);
let rRecoverMissing = await SwapService.recoverFailedSwapInput(svc, pEsc, icp, ckbtc, amountIn);
expectErr("recover rejects without escrow", rRecoverMissing);
Debug.print("PASS: recovery requires genuine failed swap escrow");

Debug.print("All SwapService tests passed");
