#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WASM="$ROOT/target/wasm32-unknown-unknown/release/icpay_trade.wasm"
DID="$ROOT/rust/trade/icpay_trade.did"

cd "$ROOT"
cargo build --target wasm32-unknown-unknown --release -p icpay_trade --locked

if command -v candid-extractor >/dev/null 2>&1; then
  candid-extractor "$WASM" > "$DID"
elif [[ -x "$HOME/.cargo/bin/candid-extractor" ]]; then
  "$HOME/.cargo/bin/candid-extractor" "$WASM" > "$DID"
else
  echo "ERROR: candid-extractor not found. Run: cargo install candid-extractor"
  exit 1
fi
