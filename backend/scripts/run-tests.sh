#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MOC="$(mops toolchain bin moc 2>/dev/null || echo "/home/prasanga/.cache/mops/moc/1.8.0/moc")"
CORE_PKG="$HOME/.cache/mops/packages/core@2.5.0/src"

PASS=0
FAIL=0
FAILED_TESTS=""

if [ ! -f "$MOC" ]; then
  echo "ERROR: moc not found at $MOC"
  exit 1
fi

if [ ! -d "$CORE_PKG" ]; then
  echo "ERROR: core package not found at $CORE_PKG"
  exit 1
fi

run_test() {
  local test_file="$1"
  local test_name="$2"
  echo "===== RUNNING: $test_name ====="
  if "$MOC" -r "$test_file" --package core "$CORE_PKG" 2>&1; then
    echo "===== PASS: $test_name ====="
    PASS=$((PASS + 1))
  else
    echo "===== FAIL: $test_name ====="
    FAIL=$((FAIL + 1))
    FAILED_TESTS="$FAILED_TESTS $test_name"
  fi
  echo ""
}

echo "============================================"
echo "  ICP Wallet Backend Test Suite"
echo "============================================"
echo ""

echo "--- Config Tests ---"
run_test "$ROOT/testing/config/Config.test.mo" "Config"

echo "--- Utils Tests ---"
run_test "$ROOT/testing/utils/UUID.test.mo" "UUID"
run_test "$ROOT/testing/utils/DateTime.test.mo" "DateTime"

echo "--- Validator Tests ---"
run_test "$ROOT/testing/validators/PrincipalValidator.test.mo" "PrincipalValidator"
run_test "$ROOT/testing/validators/UsernameValidator.test.mo" "UsernameValidator"
run_test "$ROOT/testing/validators/AmountValidator.test.mo" "AmountValidator"
run_test "$ROOT/testing/validators/TransferValidator.test.mo" "TransferValidator"
run_test "$ROOT/testing/validators/AccountValidator.test.mo" "AccountValidator"

echo "--- Model Tests ---"
run_test "$ROOT/testing/models/User.test.mo" "UserModel"
run_test "$ROOT/testing/models/Transaction.test.mo" "TransactionModel"
run_test "$ROOT/testing/models/Settings.test.mo" "SettingsModel"

echo "--- Repository Tests ---"
run_test "$ROOT/testing/repositories/UserRepository.test.mo" "UserRepository"
run_test "$ROOT/testing/repositories/TransactionRepository.test.mo" "TransactionRepository"
run_test "$ROOT/testing/repositories/SettingsRepository.test.mo" "SettingsRepository"

echo "--- Ledger Tests ---"
run_test "$ROOT/testing/ledger/Subaccount.test.mo" "Subaccount"
run_test "$ROOT/testing/ledger/Account.test.mo" "Account"

echo "--- Service Tests ---"
run_test "$ROOT/testing/services/AuthService.test.mo" "AuthService"
run_test "$ROOT/testing/services/UserService.test.mo" "UserService"
run_test "$ROOT/testing/services/AdminService.test.mo" "AdminService"
run_test "$ROOT/testing/services/TransactionService.test.mo" "TransactionService"
run_test "$ROOT/testing/services/SettingsService.test.mo" "SettingsService"

echo "--- Security Tests ---"
run_test "$ROOT/testing/security/Security.test.mo" "Security"
run_test "$ROOT/testing/security/AuthMiddleware.test.mo" "AuthMiddleware"

echo "--- Integration Tests ---"
run_test "$ROOT/testing/integration/FullFlow.test.mo" "FullFlow"

echo "============================================"
echo "  RESULTS"
echo "============================================"
echo "Passed: $PASS"
echo "Failed: $FAIL"
if [ "$FAIL" -gt 0 ]; then
  echo "Failed tests:$FAILED_TESTS"
  echo ""
  echo "============================================"
  echo "  SOME TESTS FAILED"
  echo "============================================"
  exit 1
else
  echo ""
  echo "============================================"
  echo "  ALL TESTS PASSED"
  echo "============================================"
  exit 0
fi
