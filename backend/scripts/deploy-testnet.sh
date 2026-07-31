#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== BUILDING CANISTER ==="
mops build

echo ""
echo "=== DEPLOYING TO ICP TESTNET ==="
dfx build --network ic
dfx canister install icp_wallet_backend --network ic --mode=reinstall 2>/dev/null || \
dfx deploy --network ic

echo ""
echo "=== DEPLOYMENT COMPLETE ==="
echo "Canister ID on Testnet:"
dfx canister id icp_wallet_backend --network ic 2>/dev/null || echo "(unknown - check dfx output above)"

echo ""
echo "=== DEV MODE ACTIVE ==="
echo "Using dev principal: ni5n2-efxui-dyqdu-2mnpr-atclq-d6snc-zdq5q-u6ibz-ibpkq-brjpj-gqe"
echo "All API calls will authenticate as this principal."
echo ""
echo "To switch to production, change middleware/Auth.mo:"
echo "  main.mo:  MiddlewareAuth.devConfig()  →  MiddlewareAuth.prodConfig()"
