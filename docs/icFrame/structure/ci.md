# CI structure

Single CLI at repo root. Every command is a file — no registry that can drift.

```
ci/
├── cli.ts              # dispatch + COMMANDS map
├── ascii.ts            # network banner (stderr)
├── lib.ts              # run(), dfx(), confirm(), CANISTER id
│
├── backend/
│   ├── test.ts         # backend:test
│   ├── build.ts        # backend:build
│   ├── deploy.ts       # backend:deploy
│   ├── rollback.ts     # backend:rollback
│   ├── hash.ts         # backend:hash
│   ├── logs.ts         # backend:logs
│   └── wasm.ts         # backend:wasm
│
├── frontend/
│   ├── build.ts        # frontend:build
│   └── deploy.ts       # frontend:deploy
│
├── canister/
│   ├── list.ts         # canister:list
│   ├── status.ts       # canister:status
│   ├── id.ts           # canister:id
│   ├── call.ts         # canister:call (default --query)
│   └── info.ts         # canister:info
│
├── cycles/
│   ├── balance.ts      # cycles:balance
│   ├── address.ts      # cycles:address
│   ├── convert.ts      # cycles:convert
│   └── topup.ts        # cycles:topup
│
├── ledger/
│   ├── balance.ts      # ledger:balance
│   ├── transfer.ts     # ledger:transfer
│   └── history.ts      # ledger:history
│
└── users/
    └── count.ts        # users:count
```

---

## Usage

```bash
npm run ci                       # list commands
npm run ci backend:test
npm run ci cycles:balance
npm run ci canister:call Health ping -- --local
```

Mainnet is default. Local replica: `npm run ci <cmd> -- --local`.

Every run prints a banner naming the resolved network.

---

## Command registry (`ci/cli.ts`)

```typescript
const COMMANDS: Record<string, string> = {
  "backend:test": "backend/test.ts",
  "backend:deploy": "backend/deploy.ts",
  "cycles:balance": "cycles/balance.ts",
  // add one line per command
}
```

Adding a command = add file + one line in `COMMANDS`.

---

## Shared helpers (`ci/lib.ts`)

| Export | Role |
|---|---|
| `dfx(args)` | Run dfx with correct network + env |
| `dfxOut(args)` | Capture stdout |
| `confirm(msg)` | TTY prompt — blocks mainnet writes in CI |
| `CANISTER` | Default backend canister id |
| `requireArg(n, usage)` | CLI arg validation |
| `step(label)` | Progress marker |

---

## Safety properties

1. **Every mainnet write calls `confirm()`** — CI has no TTY, deploy never runs there
2. **Upgrade only** — no `--mode=reinstall` flag exists
3. **`canister:call` defaults to query** — pass `--update` explicitly to mutate
4. **Rollback verifies module hash** — rebuilds old commit in temp worktree

---

## Cost table

| Cost | Commands |
|---|---|
| **0 (query / local build)** | `users:count`, `canister:status`, `canister:call`, `backend:hash`, `backend:logs`, `cycles:balance`, `backend:build`, `backend:test`, `frontend:build` |
| **Canister update (~tens of M cycles)** | `backend:deploy`, `frontend:deploy`, `canister:call … --update` |
| **ICP from operator wallet** | `cycles:convert`, `ledger:transfer` |
| **Cycles ledger → canister** | `cycles:topup` |

Full reference: [commands/README.md](../commands/README.md)

---

## Adding a new command

1. Create `ci/<group>/<name>.ts`
2. Add `"<group>:<name>": "<group>/<name>.ts"` to `COMMANDS` in `cli.ts`
3. Document in `docs/icFrame/commands/README.md`

See [boilerplate/ci/command.example.ts](../boilerplate/ci/command.example.ts).

---

## Deploy flow

```
backend:deploy
  → backend:test
  → backend:build
  → confirm("upgrade mainnet?")
  → dfx deploy --mode=upgrade
  → print rollback command with current hash

frontend:deploy
  → tsc --noEmit
  → confirm
  → scripts/deploy-frontend.sh (asset canister)
```

Vercel frontend deploy is separate — triggered by push to `main`, not this CLI.
