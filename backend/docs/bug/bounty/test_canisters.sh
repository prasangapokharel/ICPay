#!/bin/bash
# ICP Mainnet Canister Security Audit Script
set -e

export DFX_WARNING=-mainnet_plaintext_identity
NETWORK="ic"
REPORT_DIR="/home/prasanga/Desktop/icppay/backend/bounty/results"
mkdir -p "$REPORT_DIR"

CANISTERS=(
  "22255-zqaaa-aaaas-qf6uq-cai"
  "2225w-rqaaa-aaaai-qtqca-cai"
  "2226h-fiaaa-aaaaa-qck3a-cai"
  "2226x-viaaa-aaaaj-aab3q-cai"
  "2227b-baaaa-aaaao-abd6a-cai"
  "2227r-raaaa-aaaah-qdi6q-cai"
  "222ai-oaaaa-aaaao-qj6ra-cai"
  "222ay-6aaaa-aaaah-alvrq-cai"
  "222b6-2iaaa-aaaaj-qi4uq-cai"
  "222bw-hyaaa-aaaar-bdsna-cai"
  "222ew-7aaaa-aaaar-akaia-cai"
  "222h4-tyaaa-aaaak-qp7ha-cai"
  "222if-yiaaa-aaaad-abtlq-cai"
  "222iv-iiaaa-aaaak-qdyla-cai"
  "222jd-4aaaa-aaaan-qc2oq-cai"
  "222jt-maaaa-aaaae-aaroa-cai"
  "222l7-eqaaa-aaaar-aghea-cai"
  "222lu-mqaaa-aaaal-aqjsq-cai"
  "222n5-naaaa-aaaas-abexq-cai"
  "222nw-faaaa-aaaai-axkba-cai"
)

echo "=== ICP Mainnet Canister Security Audit ==="
echo "Date: $(date)"
echo ""

for canister in "${CANISTERS[@]}"; do
  echo "=========================================="
  echo "Testing: $canister"
  echo "=========================================="

  REPORT="$REPORT_DIR/${canister}.txt"
  echo "Canister: $canister" > "$REPORT"
  echo "Date: $(date)" >> "$REPORT"
  echo "---" >> "$REPORT"

  # Step 1: Get canister info
  echo ">> Getting canister info..." | tee -a "$REPORT"
  dfx canister --network $NETWORK info "$canister" 2>&1 | tee -a "$REPORT"

  # Step 2: Try to get Candid interface
  echo "" | tee -a "$REPORT"
  echo ">> Getting Candid interface..." | tee -a "$REPORT"
  CANDID=$(dfx canister --network $NETWORK call "$canister" __get_candid_interface_tmp_hack 2>&1)
  echo "$CANDID" | tee -a "$REPORT"

  # Step 3: Check for common ICP/ICRC endpoints
  echo "" | tee -a "$REPORT"
  echo ">> Probing ICRC-1 endpoints..." | tee -a "$REPORT"

  # icrc1_name
  NAME=$(dfx canister --network $NETWORK call "$canister" icrc1_name 2>&1 || echo "FAILED")
  echo "icrc1_name: $NAME" | tee -a "$REPORT"

  # icrc1_symbol
  SYMBOL=$(dfx canister --network $NETWORK call "$canister" icrc1_symbol 2>&1 || echo "FAILED")
  echo "icrc1_symbol: $SYMBOL" | tee -a "$REPORT"

  # icrc1_decimals
  DECIMALS=$(dfx canister --network $NETWORK call "$canister" icrc1_decimals 2>&1 || echo "FAILED")
  echo "icrc1_decimals: $DECIMALS" | tee -a "$REPORT"

  # icrc1_fee
  FEE=$(dfx canister --network $NETWORK call "$canister" icrc1_fee 2>&1 || echo "FAILED")
  echo "icrc1_fee: $FEE" | tee -a "$REPORT"

  # icrc1_total_supply
  SUPPLY=$(dfx canister --network $NETWORK call "$canister" icrc1_total_supply 2>&1 || echo "FAILED")
  echo "icrc1_total_supply: $SUPPLY" | tee -a "$REPORT"

  # icrc1_minting_account
  MINTER=$(dfx canister --network $NETWORK call "$canister" icrc1_minting_account 2>&1 || echo "FAILED")
  echo "icrc1_minting_account: $MINTER" | tee -a "$REPORT"

  # icrc1_supported_standards
  STANDARDS=$(dfx canister --network $NETWORK call "$canister" icrc1_supported_standards 2>&1 || echo "FAILED")
  echo "icrc1_supported_standards: $STANDARDS" | tee -a "$REPORT"

  # Step 4: Check ICRC-2 endpoints
  echo "" | tee -a "$REPORT"
  echo ">> Probing ICRC-2 endpoints..." | tee -a "$REPORT"

  # Check if icrc2_approve exists
  APPROVE=$(dfx canister --network $NETWORK call "$canister" icrc2_approve '(record { spender = record { owner = principal "2vxsx-fae"; subaccount = null }; amount = 0 : nat; memo = null; from_subaccount = null; created_at_time = null; expected_allowance = null; expires_at = null; fee = null })' 2>&1 || echo "FAILED")
  echo "icrc2_approve: $APPROVE" | tee -a "$REPORT"

  # Step 5: Check old ICP Ledger endpoints
  echo "" | tee -a "$REPORT"
  echo ">> Probing old ICP Ledger endpoints..." | tee -a "$REPORT"

  # name
  NAME_OLD=$(dfx canister --network $NETWORK call "$canister" name 2>&1 || echo "FAILED")
  echo "name (old): $NAME_OLD" | tee -a "$REPORT"

  # symbol
  SYMBOL_OLD=$(dfx canister --network $NETWORK call "$canister" symbol 2>&1 || echo "FAILED")
  echo "symbol (old): $SYMBOL_OLD" | tee -a "$REPORT"

  # decimals
  DECIMALS_OLD=$(dfx canister --network $NETWORK call "$canister" decimals 2>&1 || echo "FAILED")
  echo "decimals (old): $DECIMALS_OLD" | tee -a "$REPORT"

  echo "" | tee -a "$REPORT"
  echo "---" >> "$REPORT"
  echo ""
done

echo "=== Audit Complete ==="
echo "Results saved to $REPORT_DIR"
