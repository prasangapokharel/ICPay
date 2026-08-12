#!/bin/bash

# Mainnet Swap Test Runner
# Tests real 1 ICP → ckBTC swap on production

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         MAINNET SWAP TEST - 1 ICP → ckBTC                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  WARNING: This will execute a REAL swap on mainnet"
echo "⚠️  Cost: ~1 ICP + gas fees + cycles"
echo ""
echo "This test will:"
echo "  1. Check your ICPay balance (need ≥1.0003 ICP)"
echo "  2. Get a swap quote from the pool"
echo "  3. Execute the swap on mainnet"
echo "  4. Verify final balances"
echo ""
read -p "Do you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Test cancelled."
    exit 0
fi

echo ""
echo "Getting your principal..."

# Get the caller's principal (Internet Identity)
# You need to be logged in with the identity that has ICP in ICPay
PRINCIPAL=$(dfx identity get-principal)

echo "Your principal: $PRINCIPAL"
echo ""
read -p "Is this correct? (yes/no): " PRINCIPAL_CONFIRM

if [ "$PRINCIPAL_CONFIRM" != "yes" ]; then
    echo "Please use 'dfx identity use <name>' to select the correct identity"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "Starting swap test..."
echo "════════════════════════════════════════════════════════════"
echo ""

# Export env var to suppress mainnet warning
export DFX_WARNING=-mainnet_plaintext_identity

# Call the test function on mainnet
dfx canister call icp_wallet_backend --network ic testMainnetSwap "(principal \"$PRINCIPAL\")" 2>&1 | tee /tmp/swap-test.log

# Extract result
RESULT=$?

echo ""
echo "════════════════════════════════════════════════════════════"
if [ $RESULT -eq 0 ]; then
    echo "✅ Test completed - check output above for results"
else
    echo "❌ Test failed - check output above for errors"
fi
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Full log saved to: /tmp/swap-test.log"
echo ""

exit $RESULT
