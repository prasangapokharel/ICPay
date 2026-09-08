#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TRADE="$ROOT/rust/trade"

if ! command -v cargo >/dev/null 2>&1; then
  echo "ERROR: cargo not found — install Rust: https://rustup.rs"
  exit 1
fi

echo "============================================"
echo "  ICPay Trade (Rust) Test Suite"
echo "============================================"
echo ""

cd "$TRADE"
cargo test

echo ""
echo "============================================"
echo "  ALL TRADE TESTS PASSED"
echo "============================================"
