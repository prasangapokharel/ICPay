#!/bin/bash
# DSA performance benchmarks — run manually, not in CI default suite.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MOC="$(mops toolchain bin moc 2>/dev/null || echo "/home/prasanga/.cache/mops/moc/1.8.0/moc")"
CORE_PKG="$HOME/.cache/mops/packages/core@2.5.0/src"

run_bench() {
  local test_file="$1"
  local test_name="$2"
  echo "===== BENCH: $test_name ====="
  "$MOC" -r "$test_file" --package core "$CORE_PKG" 2>&1
  echo ""
}

echo "============================================"
echo "  ICPay DSA Benchmarks (before/after logic)"
echo "============================================"
echo ""

run_bench "$ROOT/testing/dsa/deposit-index/Perf.test.mo" "deposit-index"
run_bench "$ROOT/testing/dsa/principal-lookup/Perf.test.mo" "principal-lookup"
run_bench "$ROOT/testing/dsa/username-search/Perf.test.mo" "username-search"

echo "============================================"
echo "  ALL BENCHMARKS COMPLETE"
echo "============================================"
