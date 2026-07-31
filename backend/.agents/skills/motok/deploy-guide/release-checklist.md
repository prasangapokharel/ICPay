# Release Checklist

## Before every deploy

```text
[ ] bash scripts/run-tests.sh          (local backend/testing/)
[ ] DFX_NETWORK=ic bash scripts/build-lottery.sh
[ ] mops check --fix                     (if toolchain initialized)
[ ] New migration if persistent fields changed
[ ] No business logic added to main.mo / controllers
[ ] IDL synced to frontend if API changed
```

## Mainnet install (fresh)

```text
[ ] Controller principal confirmed
[ ] Cycles sufficient on canister
[ ] bash scripts/deploy-mainnet.sh
[ ] bash scripts/verify-mainnet.sh
[ ] processIncomingDeposits works
[ ] Frontend env points to canister
[ ] Remove temporary deploy controllers
```

## Mainnet upgrade

```text
[ ] Migration chain tested
[ ] bash scripts/run-tests.sh
[ ] DFX_NETWORK=ic bash scripts/build-lottery.sh
[ ] dfx canister install <id> --mode upgrade --wasm-memory-persistence keep
[ ] bash scripts/verify-mainnet.sh
[ ] Critical flows tested (deposit, draw, payout)
[ ] Vercel redeploy if frontend changed
```

## Typical session

```bash
cd /path/to/WinCanister

bash scripts/run-tests.sh
DFX_NETWORK=ic bash scripts/build-lottery.sh

dfx identity get-principal
dfx canister info ulahq-iyaaa-aaaao-bbcoq-cai --network ic

dfx canister install ulahq-iyaaa-aaaao-bbcoq-cai \
  --network ic \
  --wasm .mops/.build/lottery.wasm \
  --mode upgrade \
  --wasm-memory-persistence keep

bash scripts/verify-mainnet.sh
```

## Security after deploy

1. Remove temporary deploy controllers
2. Keep one primary controller (Internet Identity)
3. Never commit `.env.local` or pem files
4. Verify treasury/admin in `getConfig`
5. Monitor cycles weekly
