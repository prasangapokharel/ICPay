// MainnetSwap.test.mo — Real mainnet swap test with 1 ICP
//
// This test performs a REAL swap on mainnet:
// - 1 ICP → ckBTC (or another available pair)
// - Verifies all phases execute correctly
// - Checks final balances
//
// ⚠️ WARNING: This costs real ICP and cycles. Only run when explicitly requested.

import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Result "mo:base/Result";

module {
  // Constants
  let ICP_LEDGER = "ryjl3-tyaaa-aaaaa-aaaba-cai";
  let CKBTC_LEDGER = "mxzaz-hqaaa-aaaar-qaada-cai";
  let ICP_FEE = 10_000; // 0.0001 ICP
  let CKBTC_FEE = 10; // 0.0000001 ckBTC
  let ICPAY_CANISTER = "6vbhm-nqaaa-aaaan-q6muq-cai";

  // Test amounts
  let SWAP_AMOUNT = 100_000_000; // 1.0 ICP
  let MIN_OUTPUT = 5_000; // ~0.00005 ckBTC (very conservative)

  public type SwapResult = {
    success: Bool;
    message: Text;
    amountIn: Nat;
    amountOut: Nat;
    phase: Text;
  };

  // ICRC-1 Ledger interface
  type ICRC1Ledger = actor {
    icrc1_balance_of : shared query { owner: Principal; subaccount: ?Blob } -> async Nat;
    icrc1_fee : shared query () -> async Nat;
    icrc1_transfer : shared {
      from_subaccount: ?Blob;
      to: { owner: Principal; subaccount: ?Blob };
      amount: Nat;
      fee: ?Nat;
      memo: ?Blob;
      created_at_time: ?Nat64;
    } -> async Result.Result<Nat, { #InsufficientFunds: { balance: Nat }; #BadFee: { expected_fee: Nat }; #TooOld; #CreatedInFuture: { ledger_time: Nat64 }; #Duplicate: { duplicate_of: Nat }; #TemporarilyUnavailable; #GenericError: { error_code: Nat; message: Text } }>;
  };

  // ICPay backend interface
  type ICPayBackend = actor {
    getSwapQuote : shared (Text, Text, Nat) -> async Result.Result<{
      amountOut: Nat;
      platformFee: Nat;
      poolFee: Nat;
      priceImpact: Text;
      poolId: Text;
    }, Text>;

    executeSwap : shared (Text, Text, Nat, Nat) -> async Result.Result<{
      amountOut: Nat;
      txId: Text;
    }, Text>;

    getUserBalance : shared query (Text) -> async Nat;
  };

  /// Test 1: Verify user has enough ICP balance
  public func testUserBalance(userPrincipal: Principal): async SwapResult {
    Debug.print("\n=== TEST 1: Check User Balance ===");

    let icpLedger: ICRC1Ledger = actor(ICP_LEDGER);
    let icpay: ICPayBackend = actor(ICPAY_CANISTER);

    // Check ICPay custodial balance
    let icpayBalance = await icpay.getUserBalance(ICP_LEDGER);
    Debug.print("User's ICPay ICP balance: " # Nat.toText(icpayBalance) # " e8s");
    Debug.print("Required for 1 ICP swap: " # Nat.toText(SWAP_AMOUNT + (3 * ICP_FEE)) # " e8s");

    if (icpayBalance < SWAP_AMOUNT + (3 * ICP_FEE)) {
      return {
        success = false;
        message = "Insufficient balance. Need at least " # Nat.toText(SWAP_AMOUNT + (3 * ICP_FEE)) # " e8s";
        amountIn = 0;
        amountOut = 0;
        phase = "balance_check";
      };
    };

    Debug.print("✅ User has sufficient balance");
    return {
      success = true;
      message = "Balance verified: " # Nat.toText(icpayBalance) # " e8s";
      amountIn = icpayBalance;
      amountOut = 0;
      phase = "balance_check";
    };
  };

  /// Test 2: Get swap quote
  public func testSwapQuote(): async SwapResult {
    Debug.print("\n=== TEST 2: Get Swap Quote ===");

    let icpay: ICPayBackend = actor(ICPAY_CANISTER);

    let quoteResult = await icpay.getSwapQuote(ICP_LEDGER, CKBTC_LEDGER, SWAP_AMOUNT);

    switch (quoteResult) {
      case (#err(e)) {
        Debug.print("❌ Quote failed: " # e);
        return {
          success = false;
          message = "Quote failed: " # e;
          amountIn = SWAP_AMOUNT;
          amountOut = 0;
          phase = "quote";
        };
      };
      case (#ok(quote)) {
        Debug.print("Quote received:");
        Debug.print("  Input: " # Nat.toText(SWAP_AMOUNT) # " e8s ICP");
        Debug.print("  Output: " # Nat.toText(quote.amountOut) # " sats ckBTC");
        Debug.print("  Platform fee: " # Nat.toText(quote.platformFee) # " e8s");
        Debug.print("  Pool fee: " # Nat.toText(quote.poolFee) # " e8s");
        Debug.print("  Price impact: " # quote.priceImpact);
        Debug.print("  Pool ID: " # quote.poolId);

        if (quote.amountOut < MIN_OUTPUT) {
          return {
            success = false;
            message = "Output too low: " # Nat.toText(quote.amountOut) # " < " # Nat.toText(MIN_OUTPUT);
            amountIn = SWAP_AMOUNT;
            amountOut = quote.amountOut;
            phase = "quote";
          };
        };

        Debug.print("✅ Quote looks good");
        return {
          success = true;
          message = "Quote: " # Nat.toText(SWAP_AMOUNT) # " ICP → " # Nat.toText(quote.amountOut) # " ckBTC";
          amountIn = SWAP_AMOUNT;
          amountOut = quote.amountOut;
          phase = "quote";
        };
      };
    };
  };

  /// Test 3: Execute real swap
  public func testExecuteSwap(expectedOutput: Nat): async SwapResult {
    Debug.print("\n=== TEST 3: Execute Swap ===");
    Debug.print("⚠️  EXECUTING REAL MAINNET SWAP");
    Debug.print("⚠️  This will spend real ICP and cost cycles");

    let icpay: ICPayBackend = actor(ICPAY_CANISTER);

    // Use 99% of quoted amount as minimum (1% slippage tolerance)
    let amountOutMin = (expectedOutput * 99) / 100;
    Debug.print("Slippage protection: minimum " # Nat.toText(amountOutMin) # " sats");

    let swapResult = await icpay.executeSwap(
      ICP_LEDGER,
      CKBTC_LEDGER,
      SWAP_AMOUNT,
      amountOutMin
    );

    switch (swapResult) {
      case (#err(e)) {
        Debug.print("❌ Swap failed: " # e);
        return {
          success = false;
          message = "Swap execution failed: " # e;
          amountIn = SWAP_AMOUNT;
          amountOut = 0;
          phase = "execution";
        };
      };
      case (#ok(result)) {
        Debug.print("✅ Swap executed successfully!");
        Debug.print("  Input: " # Nat.toText(SWAP_AMOUNT) # " e8s ICP");
        Debug.print("  Output: " # Nat.toText(result.amountOut) # " sats ckBTC");
        Debug.print("  Transaction ID: " # result.txId);

        if (result.amountOut < amountOutMin) {
          return {
            success = false;
            message = "Slippage exceeded: got " # Nat.toText(result.amountOut) # ", expected >= " # Nat.toText(amountOutMin);
            amountIn = SWAP_AMOUNT;
            amountOut = result.amountOut;
            phase = "execution";
          };
        };

        return {
          success = true;
          message = "Swap successful: " # Nat.toText(SWAP_AMOUNT) # " ICP → " # Nat.toText(result.amountOut) # " ckBTC";
          amountIn = SWAP_AMOUNT;
          amountOut = result.amountOut;
          phase = "execution";
        };
      };
    };
  };

  /// Test 4: Verify final balances
  public func testVerifyBalances(initialIcp: Nat, expectedCkbtc: Nat): async SwapResult {
    Debug.print("\n=== TEST 4: Verify Final Balances ===");

    let icpay: ICPayBackend = actor(ICPAY_CANISTER);

    let finalIcpBalance = await icpay.getUserBalance(ICP_LEDGER);
    let finalCkbtcBalance = await icpay.getUserBalance(CKBTC_LEDGER);

    Debug.print("Initial ICP balance: " # Nat.toText(initialIcp) # " e8s");
    Debug.print("Final ICP balance: " # Nat.toText(finalIcpBalance) # " e8s");
    Debug.print("ICP spent: " # Nat.toText(initialIcp - finalIcpBalance) # " e8s");
    Debug.print("");
    Debug.print("Final ckBTC balance: " # Nat.toText(finalCkbtcBalance) # " sats");
    Debug.print("Expected: ~" # Nat.toText(expectedCkbtc) # " sats");

    // Verify ICP was deducted (approximately SWAP_AMOUNT + fees)
    let icpSpent = initialIcp - finalIcpBalance;
    let expectedSpent = SWAP_AMOUNT + (3 * ICP_FEE); // Swap + platform fee + approve + transfer

    if (icpSpent < SWAP_AMOUNT or icpSpent > expectedSpent + (10 * ICP_FEE)) {
      return {
        success = false;
        message = "ICP balance change unexpected: " # Nat.toText(icpSpent);
        amountIn = icpSpent;
        amountOut = finalCkbtcBalance;
        phase = "verification";
      };
    };

    // Verify ckBTC was received (with some tolerance for fees)
    let minExpected = (expectedCkbtc * 95) / 100; // 5% tolerance for fees
    if (finalCkbtcBalance < minExpected) {
      return {
        success = false;
        message = "ckBTC balance too low: " # Nat.toText(finalCkbtcBalance) # " < " # Nat.toText(minExpected);
        amountIn = icpSpent;
        amountOut = finalCkbtcBalance;
        phase = "verification";
      };
    };

    Debug.print("✅ Balances verified correctly");
    return {
      success = true;
      message = "Swap verified: " # Nat.toText(icpSpent) # " ICP → " # Nat.toText(finalCkbtcBalance) # " ckBTC";
      amountIn = icpSpent;
      amountOut = finalCkbtcBalance;
      phase = "verification";
    };
  };

  /// Run complete swap test suite
  public func runCompleteSwapTest(userPrincipal: Principal): async Text {
    Debug.print("\n╔════════════════════════════════════════╗");
    Debug.print("║  MAINNET SWAP TEST - 1 ICP → ckBTC    ║");
    Debug.print("╚════════════════════════════════════════╝");

    // Test 1: Check balance
    let balanceResult = await testUserBalance(userPrincipal);
    if (not balanceResult.success) {
      return "❌ FAILED at phase: " # balanceResult.phase # " - " # balanceResult.message;
    };
    let initialBalance = balanceResult.amountIn;

    // Test 2: Get quote
    let quoteResult = await testSwapQuote();
    if (not quoteResult.success) {
      return "❌ FAILED at phase: " # quoteResult.phase # " - " # quoteResult.message;
    };
    let expectedOutput = quoteResult.amountOut;

    // Test 3: Execute swap
    let swapResult = await testExecuteSwap(expectedOutput);
    if (not swapResult.success) {
      return "❌ FAILED at phase: " # swapResult.phase # " - " # swapResult.message;
    };
    let actualOutput = swapResult.amountOut;

    // Test 4: Verify balances
    let verifyResult = await testVerifyBalances(initialBalance, actualOutput);
    if (not verifyResult.success) {
      return "❌ FAILED at phase: " # verifyResult.phase # " - " # verifyResult.message;
    };

    Debug.print("\n╔════════════════════════════════════════╗");
    Debug.print("║  ✅ ALL TESTS PASSED                   ║");
    Debug.print("╚════════════════════════════════════════╝");

    return "✅ SUCCESS: Swapped " # Nat.toText(SWAP_AMOUNT) # " ICP → " # Nat.toText(actualOutput) # " ckBTC";
  };
};
