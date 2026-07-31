#!/usr/bin/env bash
# dfx refuses asset sources outside its workspace root (the directory holding
# dfx.json), so the Next export is staged into backend/dist rather than
# referenced in place at frontend/out.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

npm --prefix "$root/../frontend" run build

rm -rf "$root/dist"
# -a preserves the dotfiles: .well-known/ii-alternative-origins is what lets
# Internet Identity treat the Vercel domain as the same principal, and
# .ic-assets.json5 is what makes the asset canister serve it certified.
cp -a "$root/../frontend/out" "$root/dist"
