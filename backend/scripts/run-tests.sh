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
run_test "$ROOT/testing/utils/Memo.test.mo" "Memo"
run_test "$ROOT/testing/utils/BlobUtil.test.mo" "BlobUtil"

echo "--- Validator Tests ---"
run_test "$ROOT/testing/validators/PrincipalValidator.test.mo" "PrincipalValidator"
run_test "$ROOT/testing/validators/UsernameValidator.test.mo" "UsernameValidator"
run_test "$ROOT/testing/validators/AmountValidator.test.mo" "AmountValidator"
run_test "$ROOT/testing/validators/TransferValidator.test.mo" "TransferValidator"
run_test "$ROOT/testing/validators/AccountValidator.test.mo" "AccountValidator"
run_test "$ROOT/testing/validators/FileValidator.test.mo" "FileValidator"
run_test "$ROOT/testing/validators/TokenValidator.test.mo" "TokenValidator"

echo "--- Model Tests ---"
run_test "$ROOT/testing/models/User.test.mo" "UserModel"
run_test "$ROOT/testing/models/Transaction.test.mo" "TransactionModel"
run_test "$ROOT/testing/models/Settings.test.mo" "SettingsModel"
run_test "$ROOT/testing/models/Token.test.mo" "TokenModel"

echo "--- Storage Tests ---"
run_test "$ROOT/testing/storage/LedgerStorage.test.mo" "LedgerStorage"

echo "--- Treasury Tests ---"
run_test "$ROOT/testing/treasury/Revenue.test.mo" "Revenue"

echo "--- Repository Tests ---"
run_test "$ROOT/testing/repositories/UserRepository.test.mo" "UserRepository"
run_test "$ROOT/testing/repositories/TransactionRepository.test.mo" "TransactionRepository"
run_test "$ROOT/testing/repositories/SettingsRepository.test.mo" "SettingsRepository"
run_test "$ROOT/testing/repositories/TokenRepository.test.mo" "TokenRepository"

echo "--- Ledger Tests ---"
run_test "$ROOT/testing/ledger/Subaccount.test.mo" "Subaccount"
run_test "$ROOT/testing/ledger/Account.test.mo" "Account"
run_test "$ROOT/testing/ledger/Cmc.test.mo" "Cmc"

echo "--- Service Tests ---"
run_test "$ROOT/testing/services/AuthService.test.mo" "AuthService"
run_test "$ROOT/testing/services/UserService.test.mo" "UserService"
run_test "$ROOT/testing/services/AdminService.test.mo" "AdminService"
run_test "$ROOT/testing/services/TransactionService.test.mo" "TransactionService"
run_test "$ROOT/testing/services/SettingsService.test.mo" "SettingsService"
run_test "$ROOT/testing/services/TokenService.test.mo" "TokenService"
run_test "$ROOT/testing/services/BookmarkService.test.mo" "BookmarkService"
run_test "$ROOT/testing/services/SocialLinkService.test.mo" "SocialLinkService"
run_test "$ROOT/testing/services/SwapService.test.mo" "SwapService"

# Bucket e2e tests (Flow, HttpServe, HttpMime CDN matrix) are slow — run manually:
#   moc -r testing/bucket/HttpMime.test.mo --package core ~/.cache/mops/packages/core@*/src
# Fast suite: FileValidator.test.mo checks all 72 extensions → correct MIME at upload.

echo "--- Transfer Tests ---"
run_test "$ROOT/testing/transfer/TransferIndex.test.mo" "TransferIndex"

echo "--- Upgrade / Migration Tests ---"
run_test "$ROOT/testing/upgrade/StampLedgerId.test.mo" "StampLedgerId"
run_test "$ROOT/testing/upgrade/AddBucketApiKeys.test.mo" "AddBucketApiKeys"

echo "--- Security Tests ---"
run_test "$ROOT/testing/security/Security.test.mo" "Security"
run_test "$ROOT/testing/security/AuthMiddleware.test.mo" "AuthMiddleware"
run_test "$ROOT/testing/security/RateLimit.test.mo" "RateLimit"

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
