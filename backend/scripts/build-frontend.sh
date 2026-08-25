#!/usr/bin/env bash
# dfx refuses asset sources outside its workspace root (the directory holding
# dfx.json), so the Next export is staged into backend/dist rather than
# referenced in place at frontend/out.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
frontend="$root/../frontend"
proxy_dir="$frontend/app/api/cloud"
stash_dir="$frontend/.cdn-proxy-stash"

restore_proxy() {
  if [ -d "$stash_dir" ]; then
    mkdir -p "$(dirname "$proxy_dir")"
    rm -rf "$proxy_dir"
    mv "$stash_dir" "$proxy_dir"
  fi
}

restore_metadata() {
  git -C "$frontend" checkout -- app/manifest.ts app/robots.ts app/sitemap.ts 2>/dev/null || true
}

patch_metadata() {
  for f in manifest.ts robots.ts sitemap.ts; do
    path="$frontend/app/$f"
    grep -q 'force-static' "$path" && continue
    awk 'BEGIN{done=0} /^import /{print; next} /^$/ && !done {print; print "export const dynamic = \"force-static\""; print ""; done=1; next} {print}' \
      "$path" > "$path.tmp"
    mv "$path.tmp" "$path"
  done
}

# CDN proxy is Vercel-only; stash it outside app/ so static export skips it.
if [ -d "$proxy_dir" ]; then
  rm -rf "$stash_dir"
  mv "$proxy_dir" "$stash_dir"
fi
trap 'restore_proxy; restore_metadata' EXIT

patch_metadata
export ICP_STATIC_EXPORT=1
npm --prefix "$frontend" run build

rm -rf "$root/dist"
# -a preserves the dotfiles: .well-known/ii-alternative-origins is what lets
# Internet Identity treat the Vercel domain as the same principal, and
# .ic-assets.json5 is what makes the asset canister serve it certified.
cp -a "$frontend/out" "$root/dist"
