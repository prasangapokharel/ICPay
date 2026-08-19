# Commands reference

Everything runs from repo root: `npm run ci <command> [args]`

Mainnet by default. Local replica: `npm run ci <command> -- --local`

---

## Daily monitoring

| Command | What it does | Cycles |
|---|---|---|
| `cycles:balance [canister]` | Cycles left, idle burn, runway days | 0 |
| `canister:status` | Memory, controllers, module hash | 0 |
| `backend:hash` | Live module hash (version fingerprint) | 0 |
| `backend:logs` | Canister logs | 0 |
| `canister:list` | Owned canisters + mainnet IDs | 0 |
| `users:count` | Registered user count | 0 |

---

## Shipping

| Command | What it does | Cycles |
|---|---|---|
| `backend:test` | Full Motoko test suite | 0 |
| `backend:build` | Build wasm without deploying | 0 |
| `backend:deploy` | test → build → confirm → upgrade deploy | update |
| `frontend:build` | typecheck + next build | 0 |
| `frontend:deploy` | typecheck → confirm → asset canister | update |
| `backend:wasm` | Upload ICRC-1 ledger wasm (one-time) | update |

Deploys are **upgrade only**. No reinstall flag — reinstall wipes stable memory.

---

## Rollback

```bash
npm run ci backend:hash
npm run ci backend:rollback <git-ref> [expected-module-hash]
```

Rebuilds the old commit in a throwaway worktree, verifies wasm hash, then upgrades.
Your working tree is never touched.

---

## Cycles management

| Command | What it does |
|---|---|
| `cycles:address` | Ledger account to send ICP to |
| `cycles:convert <icp>` | Burn ICP → cycles on cycles ledger |
| `cycles:topup <cycles> [canister]` | Move cycles from ledger into canister |

Two-step top-up:

```bash
npm run ci cycles:address
npm run ci cycles:convert 1
npm run ci cycles:topup 1500000000000
```

See [cycles/README.md](../cycles/README.md) for economics.

---

## Canister inspection

| Command | What it does |
|---|---|
| `canister:id [name]` | Resolve canister id |
| `canister:info [canister]` | Full status dump |
| `canister:call <method> ['(args)']` | Query call (default) |
| `canister:call <method> ['(args)'] --update` | Update call (costs cycles) |

Example:

```bash
npm run ci canister:call Health ping
npm run ci canister:call Admin getStats -- --local
```

---

## Operator ledger (your ICP, not user funds)

| Command | What it does |
|---|---|
| `ledger:balance [account]` | Operator wallet balance |
| `ledger:transfer <account> <e8s>` | Send ICP (costs ICP + fee) |
| `ledger:history [principal] [n]` | Index canister transaction history |

---

## Adding commands

1. Create `ci/<group>/<name>.ts`
2. Register in `ci/cli.ts` → `COMMANDS`
3. Add row to this file

Template: [boilerplate/ci/command.example.ts](../boilerplate/ci/command.example.ts)
