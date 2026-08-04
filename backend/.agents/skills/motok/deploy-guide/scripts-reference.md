# Scripts Reference

| Script | Purpose |
|--------|---------|
| `scripts/build-lottery.sh` | moc 1.7 wasm + candid |
| `scripts/run-tests.sh` | All `backend/testing/**/*.test.mo` |
| `scripts/deploy-mainnet.sh` | Install + initialize on IC |
| `scripts/verify-mainnet.sh` | Post-deploy health queries |
| `scripts/packtool.sh` | mops sources for moc `-p` flags |

## build-lottery.sh

- Output: `.mops/.build/lottery.wasm`
- `DFX_NETWORK=ic` (default) or `local`
- Fetches ledger DID if missing
- Actor aliases: `icrc1_ledger`, `icp_index`

## run-tests.sh

- Uses moc 1.7 + `packtool.sh`
- Finds all `backend/testing/**/*.test.mo`
- Exit code 1 if any test fails

## deploy-mainnet.sh

- `CANISTER_ID=ulahq-iyaaa-aaaao-bbcoq-cai`
- Checks dfx identity is controller
- `--mode install` (fresh only — use upgrade doc for updates)

## verify-mainnet.sh

- Module hash, health, core queries

## New project customization

1. Rename `lottery` → your canister in build output
2. Set `CANISTER_ID` in deploy/verify scripts
3. Update smoke-test calls in deploy script
4. Update `mops.toml` actor aliases
