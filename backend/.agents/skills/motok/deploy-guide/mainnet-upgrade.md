# Mainnet — Upgrade

Use when canister ID stays the same but code changes.

## Before upgrade

1. Add migration in `src/migrations/` if persistent fields changed
2. `bash scripts/run-tests.sh`
3. `DFX_NETWORK=ic bash scripts/build-lottery.sh`
4. `mops check --fix` (recommended)

## Upgrade command

```bash
dfx canister install ulahq-iyaaa-aaaao-bbcoq-cai \
  --network ic \
  --wasm .mops/.build/lottery.wasm \
  --mode upgrade \
  --wasm-memory-persistence keep
```

`--wasm-memory-persistence keep` is required for enhanced migration actors.

Only **new** migration files run since last deploy.

## After upgrade

```bash
bash scripts/verify-mainnet.sh
dfx canister call ulahq-iyaaa-aaaao-bbcoq-cai processIncomingDeposits --network ic
```

Manually test: deposit credit, round timer, draw, payout.

## If migration traps

- Canister stays on **previous wasm**
- Fix migration input/output types
- Rebuild and retry upgrade
- Never change stable types in place without a safe migration path

## Decision tree

```text
Code changed?
├── Persistent fields changed? → Add migration file
├── Logic only? → Rebuild
└── bash scripts/run-tests.sh → bash scripts/build-lottery.sh
         ├── Fresh canister (no module hash) → --mode install + initialize()
         └── Existing canister → --mode upgrade --wasm-memory-persistence keep
```
