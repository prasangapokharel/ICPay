#!/usr/bin/env bash
# dfx refuses asset sources outside its workspace root (the directory holding
# dfx.json), so the Next export is staged into backend/dist rather than
# referenced in place at frontend/out.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
frontend="$root/../frontend"
api_dir="$frontend/app/api"
stash_dir="$frontend/.api-stash"

restore_api() {
  if [ -d "$stash_dir" ]; then
    mkdir -p "$(dirname "$api_dir")"
    rm -rf "$api_dir"
    mv "$stash_dir" "$api_dir"
  fi
}

# API routes (cloud proxy, avatar generator) are Vercel/server-only;
# stash them outside app/ so static export for the asset canister skips them.
if [ -d "$api_dir" ]; then
  rm -rf "$stash_dir"
  mv "$api_dir" "$stash_dir"
fi
trap 'restore_api' EXIT

export ICP_STATIC_EXPORT=1
rm -rf "$frontend/.next" "$frontend/out"
npm --prefix "$frontend" run build

rm -rf "$root/dist"
# -a preserves the dotfiles: .well-known/ii-alternative-origins is what lets
# Internet Identity treat the Vercel domain as the same principal, and
# .ic-assets.json5 is what makes the asset canister serve it certified.
cp -a "$frontend/out" "$root/dist"
