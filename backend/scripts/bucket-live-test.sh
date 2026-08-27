#!/usr/bin/env bash
# Live bucket API smoke test against mainnet — MANUAL ONLY.
# Writes and deletes real files on the blob canister. Never run in CI.
# Usage: BUCKET_LIVE_TEST=1 BUCKET_API_KEY=icp_cloud_… bash scripts/bucket-live-test.sh
set -euo pipefail

if [[ "${BUCKET_LIVE_TEST:-}" != "1" ]]; then
  echo "Refusing to run: set BUCKET_LIVE_TEST=1 to hit mainnet (writes real blob bytes)."
  exit 1
fi

KEY="${BUCKET_API_KEY:?Set BUCKET_API_KEY}"
BUCKET="${BUCKET_NAME:-icp}"
CANISTER="${BUCKET_CANISTER:-6vbhm-nqaaa-aaaan-q6muq-cai}"
NETWORK="${DFX_NETWORK:-ic}"
export DFX_WARNING=-mainnet_plaintext_identity

Q=(dfx canister --network "$NETWORK" call "$CANISTER")
U=(dfx canister --network "$NETWORK" call "$CANISTER")
CDN="https://${CANISTER}.raw.icp0.io/cloud/${BUCKET}"

pass=0
fail=0

ok() { echo "  PASS  $1"; pass=$((pass + 1)); }
bad() { echo "  FAIL  $1"; fail=$((fail + 1)); }

assert_ok() {
  local label="$1" out="$2"
  if echo "$out" | grep -q ' err = '; then
    bad "$label — $(echo "$out" | tr '\n' ' ')"
  elif echo "$out" | grep -qE 'ok =|ok;)'; then
    ok "$label"
  else
    bad "$label — unexpected: $(echo "$out" | tr '\n' ' ' | head -c 120)"
  fi
}

assert_http() {
  local label="$1" url="$2" code="$3"
  local got
  got=$(curl -sS -o /dev/null -w '%{http_code}' "$url")
  if [[ "$got" == "$code" ]]; then ok "$label ($got)"; else bad "$label (got $got, want $code)"; fi
}

echo "Bucket live test — ${BUCKET} @ ${CANISTER}"
echo

echo "Read / query"
assert_http "CDN hello.txt" "${CDN}/hello.txt" "200"
assert_ok "listFiles" "$("${Q[@]}" listFiles "(\"${BUCKET}\", 0: nat, 20: nat, opt \"${KEY}\")" --query)"
assert_ok "getFile" "$("${Q[@]}" getFile "(\"${BUCKET}\", \"/hello.txt\", opt \"${KEY}\")" --query)"
assert_ok "fileExists (true)" "$("${Q[@]}" fileExists "(\"${BUCKET}\", \"/hello.txt\", opt \"${KEY}\")" --query)"
assert_ok "downloadFile" "$("${U[@]}" downloadFile "(\"${BUCKET}\", \"/hello.txt\", opt \"${KEY}\")")"
assert_ok "searchFiles" "$("${Q[@]}" searchFiles "(\"${BUCKET}\", \"hello\", 0: nat, 20: nat, opt \"${KEY}\")" --query)"
assert_ok "listFolder" "$("${Q[@]}" listFolder "(\"${BUCKET}\", \"/\", 0: nat, 20: nat, opt \"${KEY}\")" --query)"
assert_ok "getFileMetadata" "$("${Q[@]}" getFileMetadata "(\"${BUCKET}\", \"/hello.txt\", opt \"${KEY}\")" --query)"
assert_ok "getPublicFileUrl" "$("${Q[@]}" getPublicFileUrl "(\"${BUCKET}\", \"/hello.txt\")" --query)"
assert_ok "getBucketCloudStats" "$("${Q[@]}" getBucketCloudStats '()' --query)"
assert_ok "getBucketCycleStatus" "$("${Q[@]}" getBucketCycleStatus '()' --query)"

echo
echo "Write / mutate (creates and removes api-live-test.txt)"
DATA='vec { 105; 99; 112; 97; 121; 32; 108; 105; 118; 101; 10 }'
assert_ok "uploadFile" "$("${U[@]}" uploadFile "(\"${BUCKET}\", \"/api-live-test.txt\", ${DATA}, \"text/plain\", opt \"${KEY}\")")"
assert_http "CDN upload" "${CDN}/api-live-test.txt" "200"
assert_ok "setFileTags" "$("${U[@]}" setFileTags "(\"${BUCKET}\", \"/api-live-test.txt\", vec { \"live\" }, opt \"${KEY}\")")"
assert_ok "setFileMetadata" "$("${U[@]}" setFileMetadata "(\"${BUCKET}\", \"/api-live-test.txt\", \"{}\", opt \"${KEY}\")")"
assert_ok "copyFile" "$("${U[@]}" copyFile "(\"${BUCKET}\", \"/api-live-test.txt\", \"/api-live-test-copy.txt\", opt \"${KEY}\")")"
assert_ok "moveFile" "$("${U[@]}" moveFile "(\"${BUCKET}\", \"/api-live-test-copy.txt\", \"/api-live-test-moved.txt\", opt \"${KEY}\")")"
assert_ok "bulkDeleteFiles" "$("${U[@]}" bulkDeleteFiles "(\"${BUCKET}\", vec { \"/api-live-test.txt\"; \"/api-live-test-moved.txt\" }, opt \"${KEY}\")")"

echo
echo "Result: ${pass} passed, ${fail} failed"
[[ "$fail" -eq 0 ]]
