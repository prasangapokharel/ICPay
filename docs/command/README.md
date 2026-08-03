# Commands

Everything runs from the repo root with `npm run ci <command>`.

Every command targets **mainnet**. For a local replica, append `-- --local`.
The bare `--` is required — npm eats a lone `--local` as its own flag and the
command would quietly hit mainnet instead. Every run prints a banner naming the
network it actually resolved, so you can always see which one you got.

```bash
npm run ci                       # list every command
npm run ci cycles:balance        # mainnet
npm run ci cycles:balance -- --local
```

---

## Daily

| Command | What it does |
|---|---|
| `npm run ci cycles:balance` | Cycles left. **Watch this one** — at zero the canister is deleted, taking every user record with it. |
| `npm run ci canister:status` | Cycles, memory, controllers, module hash. |
| `npm run ci backend:hash` | The live module hash. This is the version marker, and the argument you pass to a rollback. |
| `npm run ci backend:logs` | Canister logs. |
| `npm run ci canister:list` | The two canisters this project owns, with their mainnet IDs. |

`backend:hash` prints only the hash on stdout, so it pipes:

```bash
npm run ci backend:rollback <commit> $(npm run ci backend:hash --silent)
```

## Shipping

| Command | What it does |
|---|---|
| `npm run ci backend:test` | The 24-test suite. |
| `npm run ci backend:build` | Build the wasm without deploying. |
| `npm run ci backend:deploy` | tests → build → confirm → deploy. Prints the rollback command afterwards. |
| `npm run ci frontend:build` | Typecheck and build. |
| `npm run ci frontend:deploy` | Typecheck → confirm → ship to the asset canister. |

Vercel is **not** deployed from here — it rebuilds itself on every push to
`main`. `frontend:deploy` only updates the on-chain asset canister.

Deploys are **upgrade only**. `--mode=reinstall` would erase every user, balance
record and transaction, so there is deliberately no flag for it.

## Rollback

```bash
npm run ci backend:rollback <git-ref> [expected-module-hash]
```

Run with no arguments to see recent backend commits.

A canister's module hash is exactly the sha256 of its wasm. Passing the hash you
are rolling back **to** makes this verifiable: it rebuilds that commit in a
throwaway git worktree, hashes the result, and refuses to deploy on a mismatch.
Without the hash it still works, but the artifact is unverified.

The IC keeps no archive of past wasms — a module hash is a fingerprint, not an
artifact — which is why the wasm has to be rebuilt from its commit rather than
downloaded.

Your working tree is never touched; the build happens in a temporary worktree
that is removed afterwards, uncommitted changes included.

```bash
# read the current hash first, so you can come back to it
npm run ci backend:hash
npm run ci backend:rollback f6f3c43 0xd8f923ac...
```

## Cycles

| Command | What it does |
|---|---|
| `npm run ci cycles:balance [canister]` | Cycles remaining. |
| `npm run ci cycles:topup <amount> [canister]` | Deposit cycles. Spends real cycles from your identity's wallet. |

Queries are **not billed** on the IC. Only update calls and idle burn
(~45k cycles/second) cost anything, so a balance that drifts down while nothing
is happening is normal.

## Inspecting the canister

| Command | What it does |
|---|---|
| `npm run ci canister:id [name]` | Canister ID. |
| `npm run ci canister:info [name]` | Controllers and module hash. |
| `npm run ci canister:call <method> ['(args)'] [--update]` | Call a method. |

`canister:call` defaults to a **query**, so a typo cannot mutate state or cost a
consensus round. Pass `--update` for methods that write.

```bash
npm run ci canister:call health
npm run ci canister:call getUsernamePrice '("btc")'
```

## Ledger

These move the **operator's own ICP** — the identity you are signed in as. User
funds are not reachable this way: they live in canister subaccounts, and only
the owning principal can move them.

| Command | What it does |
|---|---|
| `npm run ci ledger:balance [account-id]` | Your own ICP balance. |
| `npm run ci ledger:transfer <account-id> <e8s>` | Send ICP. Asks to confirm. |
| `npm run ci ledger:history [principal] [count]` | Transaction history. |

Amounts are in **e8s**: 1 ICP = 100_000_000 e8s. The ledger fee is 10_000 e8s.

`ledger:history` reads the NNS index canister, not the ledger — the ledger only
answers "what is the balance now", the index is what keeps the per-account log.

---

## Safety

Three properties, all deliberate:

- **Every mainnet write asks first**, and refuses to run without an interactive
  terminal. CI has no TTY and runs no deploy commands at all.
- **Upgrade only, never reinstall.** Reinstall erases all state.
- **Rollback is verifiable** against the module hash before anything is
  installed.

CI (`.github/workflows/ci.yml`) runs tests, typecheck and build. It never
deploys — that would mean putting the canister's controller key in a GitHub
secret, and that key can also delete the canister. Shipping stays a local
command run by a human.

## If something goes wrong

| Symptom | Cause |
|---|---|
| Command hit mainnet when you wanted local | You wrote `--local` instead of `-- --local`. Check the banner. |
| `Refusing to ... without an interactive terminal` | A write command inside a pipe or script. Run it directly. |
| Deploy says "module hash unchanged" | The build produced identical wasm — nothing needed deploying. |
| Rollback says "Hash mismatch" | That commit does not rebuild to the wasm you asked for. Working as intended; it stopped before touching mainnet. |
