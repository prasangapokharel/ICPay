# Motoko Deploy Guide

Build, install, verify, and upgrade Motoko canisters with **moc 1.7**, **enhanced migration**, and **mops**.

## Read in order

| # | Document | When to read |
|---|----------|--------------|
| 1 | [prerequisites.md](./prerequisites.md) | Tools, identities, build rule |
| 2 | [build.md](./build.md) | `build-lottery.sh`, tests, actor IDL |
| 3 | [local-deploy.md](./local-deploy.md) | Local replica + frontend env |
| 4 | [mainnet-fresh.md](./mainnet-fresh.md) | First install on IC |
| 5 | [mainnet-upgrade.md](./mainnet-upgrade.md) | Upgrade existing canister |
| 6 | [frontend-connection.md](./frontend-connection.md) | Env vars, agent v3, IDL sync |
| 7 | [scripts-reference.md](./scripts-reference.md) | All scripts in `scripts/` |
| 8 | [troubleshooting.md](./troubleshooting.md) | Errors and fixes |
| 9 | [release-checklist.md](./release-checklist.md) | Pre-ship checklist |

## Quick commands (WinCanister)

```bash
bash scripts/run-tests.sh          # local only — backend/ is gitignored
DFX_NETWORK=ic bash scripts/build-lottery.sh
bash scripts/deploy-mainnet.sh     # fresh install (controller required)
bash scripts/verify-mainnet.sh
```

## Related

- [../code-guide/README.md](../code-guide/README.md) — how to write code
- [../README.md](../README.md) — motok docs index
