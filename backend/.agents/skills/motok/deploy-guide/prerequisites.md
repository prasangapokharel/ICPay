# Prerequisites

| Requirement | Check |
|-------------|-------|
| `dfx` | `dfx --version` (≥ 0.24) |
| mops + moc 1.7 | `mops toolchain bin moc` |
| Node.js 20+ | For frontend |
| ICP balance (mainnet) | `dfx ledger balance --network ic` |
| Controller access | `dfx canister info <id> --network ic` |

## Critical build rule

**Do not use `dfx build` for production wasm** when enhanced migration is enabled. Bundled dfx moc may be too old.

Always use:

```bash
DFX_NETWORK=ic bash scripts/build-lottery.sh
```

Output: `.mops/.build/lottery.wasm`

## Toolchain (this repo)

| Tool | Version |
|------|---------|
| Motoko | 1.7.0 via mops |
| mo:core | 2.5.0 |
| mo:test | 2.1.1 |
| Persistence | Enhanced migration + `--default-persistent-actors` |

## Identity

```bash
dfx identity get-principal
dfx canister info ulahq-iyaaa-aaaao-bbcoq-cai --network ic
```

Your principal must appear under **Controllers** to install or upgrade.

Add controller: [wallet.ic0.app](https://wallet.ic0.app) → Canister → Add Controller.
