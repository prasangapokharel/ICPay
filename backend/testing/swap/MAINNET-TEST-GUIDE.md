# Mainnet Swap Testing Guide

## Overview

Real mainnet swap test suite for verifying the complete swap flow with actual ICP on production.

**Test:** 1 ICP → ckBTC swap on mainnet  
**Cost:** ~1 ICP + gas fees (~0.0003 ICP) + cycles  
**Duration:** ~30-60 seconds

---

## Prerequisites

### 1. **Sufficient Balance**
You need at least **1.0003 ICP** in your ICPay account:
- 1.0 ICP for the swap
- 0.0003 ICP for gas fees (platform fee, approve, transfers)

### 2. **dfx Identity**
Make sure you're using the correct identity:
```bash
dfx identity whoami
dfx identity get-principal
```

If needed, switch identity:
```bash
dfx identity use <name>
```

### 3. **Network Access**
Ensure you can connect to mainnet:
```bash
dfx ping ic
```

---

## Running the Test

### Option 1: Automated Script (Recommended)

```bash
cd testing/swap
./run-mainnet-test.sh
```

The script will:
1. Confirm your principal
2. Ask for confirmation before spending ICP
3. Run all 4 test phases
4. Save log to `/tmp/swap-test.log`

### Option 2: Manual dfx Call

```bash
export DFX_WARNING=-mainnet_plaintext_identity

# Get your principal
PRINCIPAL=$(dfx identity get-principal)

# Run test
dfx canister call icp_wallet_backend testMainnetSwap \
  "(principal \"$PRINCIPAL\")" \
  --network ic
```

---

## Test Phases

### Phase 1: Balance Check
Verifies you have sufficient ICP in your ICPay account.

**Expected output:**
```
User's ICPay ICP balance: 100000000 e8s
Required for 1 ICP swap: 100030000 e8s
✅ User has sufficient balance
```

**If it fails:**
- Deposit more ICP to your ICPay account
- Check you're using the correct identity

---

### Phase 2: Get Quote
Queries ICPSwap pool for expected output amount.

**Expected output:**
```
Quote received:
  Input: 100000000 e8s ICP
  Output: 18739493224 sats ckBTC
  Platform fee: 200000 e8s
  Pool fee: 3000 e8s
  Price impact: 0.01%
  Pool ID: xmiu5-jqaaa-aaaag-qbz7q-cai
✅ Quote looks good
```

**If it fails:**
- Pool might not exist for this pair
- Network connectivity issues
- ICPSwap factory might be down

---

### Phase 3: Execute Swap
Performs the actual swap on mainnet.

**What happens:**
1. Platform fee transfer (0.2% to treasury)
2. Transfer remaining ICP to canister main account
3. Approve pool to spend from main account
4. Pool pulls tokens via depositFrom
5. Swap execution in pool
6. Withdraw ckBTC from pool
7. Transfer ckBTC to your ICPay subaccount

**Expected output:**
```
⚠️  EXECUTING REAL MAINNET SWAP
⚠️  This will spend real ICP and cost cycles
Slippage protection: minimum 18552158252 sats
✅ Swap executed successfully!
  Input: 100000000 e8s ICP
  Output: 18739493224 sats ckBTC
  Transaction ID: <txId>
```

**If it fails at different phases:**
- **"Insufficient funds for approve"**: Balance check was wrong, refresh and retry
- **"#InsufficientAllowance"**: This was the bug we fixed - should not happen now
- **"Swap failed: #InsufficientFunds"**: Pool doesn't have enough liquidity
- **"Slippage exceeded"**: Price moved too much, increase slippage tolerance
- **"Withdraw from pool failed"**: Pool issue, funds are recoverable via retry

---

### Phase 4: Verify Balances
Confirms ICP was deducted and ckBTC was received.

**Expected output:**
```
Initial ICP balance: 100000000 e8s
Final ICP balance: 30000 e8s
ICP spent: 99970000 e8s

Final ckBTC balance: 18739493224 sats
Expected: ~18739493224 sats
✅ Balances verified correctly
```

**Verification checks:**
- ICP spent = ~1 ICP + fees (should be 1.0002-1.0003 ICP)
- ckBTC received >= 95% of quote (accounts for fees)

---

## Success Criteria

All 4 phases must pass:

```
╔════════════════════════════════════════╗
║  ✅ ALL TESTS PASSED                   ║
╚════════════════════════════════════════╝

✅ SUCCESS: Swapped 100000000 ICP → 18739493224 ckBTC
```

---

## Troubleshooting

### Error: "Insufficient balance"
**Solution:** Deposit more ICP to your ICPay account first:
```bash
# Check your current balance
dfx canister call icp_wallet_backend getUserBalance \
  '("ryjl3-tyaaa-aaaaa-aaaba-cai")' \
  --network ic
```

### Error: "#InsufficientAllowance"
**This was the critical bug we fixed.** If you see this:
1. Verify you deployed the latest code with the fix
2. Check `SwapService.mo` has Phase C+D+E changes
3. Confirm approve is from `from_subaccount = null`

### Error: "Pool not found"
**Solution:** The ICP/ckBTC pool might not exist or use different fee tier:
- Default: tries 500, 3000, 10000 fee tiers
- Check ICPSwap UI for available pools

### Error: "Rate limit exceeded"
**Solution:** SwapService has 3 swaps per 60s rate limit:
- Wait 60 seconds
- Or temporarily increase limit in Config.mo for testing

---

## Cost Breakdown

For 1 ICP swap:

| Item | Cost |
|------|------|
| Swap amount | 1.0 ICP |
| Platform fee (0.2%) | 0.002 ICP |
| Approve fee | 0.0001 ICP |
| Transfer fees (3x) | 0.0003 ICP |
| **Total** | **~1.0024 ICP** |

Plus:
- **Cycles**: ~300M cycles for update calls
- **Pool fee**: 0.3% deducted from output (ckBTC)

---

## After Testing

### Successful Test
- You now have ~0.00018 ckBTC in your ICPay account
- You can verify on the ICPay dashboard
- Transaction is recorded in your history

### Clean Up
No cleanup needed - the ckBTC is yours to keep or swap back.

### Swap Back to ICP (Optional)
```bash
# Use the ICPay UI or reverse the test:
# ckBTC → ICP swap
```

---

## Important Notes

⚠️ **This spends real money** - Only run when explicitly requested  
⚠️ **Mainnet only** - Test suite doesn't work on local replica  
⚠️ **Rate limited** - Max 3 swaps per 60 seconds  
⚠️ **Slippage** - Quote might differ from actual output by ~1%  
⚠️ **Gas fees** - Always have extra 0.001 ICP for fees  

---

## Expected Performance

With the optimizations:
- **Time:** 7-8 RTTs = ~7-16 seconds
- **Cycles:** ~300M for cold call, ~250M warm
- **Success rate:** Should be ~99% (1% for pool liquidity issues)

---

## What This Verifies

✅ All 8 phases execute correctly  
✅ ICRC-2 approve from main account works  
✅ Pool.depositFrom uses allowance correctly  
✅ Fee handling is correct (no double-deduction bugs)  
✅ Final balances match expectations  
✅ No "#InsufficientAllowance" error  
✅ No "Illegal deposit balance" error  
✅ Transaction completes end-to-end  

---

## Files

- `MainnetSwap.test.mo` - Test module with all phases
- `run-mainnet-test.sh` - CLI runner script
- `MAINNET-TEST-GUIDE.md` - This guide

---

## Questions?

If the test fails at any phase, check:
1. The phase name in the error message
2. The specific error text
3. Your account balances
4. Network connectivity

The test suite provides detailed logging at each phase to help diagnose issues.
