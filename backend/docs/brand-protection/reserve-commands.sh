#!/usr/bin/env bash
# Reserve ICPay feature page names to prevent username collision
# Run from backend/ directory

set -e

export DFX_WARNING=-mainnet_plaintext_identity

NETWORK="${1:-ic}"

# New ICPay product brands
echo "Reserving product brands..."
dfx canister call icp_wallet_backend reserveUsername '("icfalcon")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("icbucket")' --network "$NETWORK"

# New feature page names (route collision protection)
echo "Reserving feature pages..."
dfx canister call icp_wallet_backend reserveUsername '("admin")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("analytics")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("deposit")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("launch")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("live")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("profile")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("settings")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("transactions")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("transfer")' --network "$NETWORK"
dfx canister call icp_wallet_backend reserveUsername '("withdraw")' --network "$NETWORK"

echo ""
echo "Done. Verify with:"
echo "dfx canister call icp_wallet_backend listReservedUsernames --network $NETWORK"
