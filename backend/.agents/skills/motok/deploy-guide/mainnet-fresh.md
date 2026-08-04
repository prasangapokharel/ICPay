# Mainnet — Fresh Install

## Phase A — Canister on IC

1. Create canister via [wallet.ic0.app](https://wallet.ic0.app) or `dfx ledger create-canister`
2. Fund with cycles (install + upgrades + timers)
3. Note canister ID
4. Update everywhere:
   - `dfx.json` → `remote.id.ic`
   - `scripts/deploy-mainnet.sh` → `CANISTER_ID`
   - `scripts/verify-mainnet.sh`
   - `frontend/.env.example` + Vercel env vars

WinCanister mainnet ID: `ulahq-iyaaa-aaaao-bbcoq-cai`

## Phase B — Controller

```bash
dfx identity get-principal
dfx canister info ulahq-iyaaa-aaaao-bbcoq-cai --network ic
```

If not a controller → wallet.ic0.app → Add Controller → paste principal.

## Phase C — Install

```bash
bash scripts/deploy-mainnet.sh
```

Script steps:

1. `bash scripts/build-lottery.sh`
2. Verify caller is controller
3. `dfx canister install <id> --network ic --wasm .mops/.build/lottery.wasm --mode install`
4. `dfx canister call <id> initialize`
5. Smoke: `health`, `getConfig`, `getCurrentRound`

## Phase D — Verify

```bash
bash scripts/verify-mainnet.sh
```

Expected:

- `Module hash:` is not `None`
- `health` → `{ status = "healthy"; ... }`
- Queries respond without trap

## Manual install (alternative)

```bash
DFX_NETWORK=ic bash scripts/build-lottery.sh

dfx canister install ulahq-iyaaa-aaaao-bbcoq-cai \
  --network ic \
  --wasm .mops/.build/lottery.wasm \
  --mode install \
  --argument '()'

dfx canister call ulahq-iyaaa-aaaao-bbcoq-cai initialize --network ic
dfx canister call ulahq-iyaaa-aaaao-bbcoq-cai processIncomingDeposits --network ic
```
