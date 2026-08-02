#!/usr/bin/env bash
# Ships the current frontend to the asset canister. Vercel redeploys itself on
# every push; the canister does not, which is how it drifted a release behind
# while the Transparency page was pointing users at it.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# dfx holds the controller key in plaintext; the warning is acknowledged, not
# silenced by accident.
export DFX_WARNING=-mainnet_plaintext_identity

# Baked into the export, not read at runtime: a static build has no server to
# read env from. Changing this value repoints every principal, so it is pinned
# here rather than left to whatever happens to be in the shell.
export NEXT_PUBLIC_DERIVATION_ORIGIN="https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://icpay.app}"

dfx deploy --network ic icp_wallet_frontend

echo
echo "Deployed. Verifying the canister actually serves the new build:"
base="https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io"
for path in /terms.html /privacy.html /transparency.html /.well-known/ii-alternative-origins; do
  printf '  %-40s %s\n' "$path" "$(curl -s -o /dev/null -w '%{http_code}' "$base$path")"
done

# A stale build still answers 200 on every path because the SPA fallback serves
# index.html, so the status code proves nothing on its own -- only the copy does.
echo
if curl -s "$base/terms.html" | grep -q "Terms of Service"; then
  echo "  OK: /terms.html contains the legal copy."
else
  echo "  STALE: /terms.html is the SPA fallback, not the terms page." >&2
  exit 1
fi
