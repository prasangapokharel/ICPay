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
| `npm run ci backend:test` | The 31-test suite. |
| `npm run ci backend:build` | Build the wasm without deploying. |
| `npm run ci backend:deploy` | tests → build → confirm → deploy. Prints the rollback command afterwards. |
| `npm run ci frontend:build` | Typecheck and build. |
| `npm run ci frontend:deploy` | Typecheck → confirm → ship to the asset canister. |
| `npm run ci backend:wasm` | Upload the ICRC-1 ledger wasm token launches install. Run once. |

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
| `npm run ci cycles:balance [canister]` | Cycles remaining, idle burn, and runway in days. |
| `npm run ci cycles:address` | The ledger account to send ICP to, and its balance. |
| `npm run ci cycles:convert <icp>` | Burn ICP into cycles on the cycles ledger. |
| `npm run ci cycles:topup <cycles> [canister]` | Move cycles from the cycles ledger into the canister. |

Topping up is two steps because minting and depositing are separate:

```bash
npm run ci cycles:address        # send ICP here
npm run ci cycles:convert 1      # ICP -> cycles, on the cycles ledger
npm run ci cycles:topup 1500000000000
```

There is no cycles wallet canister for this identity, so `dfx canister
deposit-cycles` does not work — the cycles ledger is the path.

Queries are **not billed** on the IC. Only update calls and idle burn
(~45k cycles/second) cost anything, so a balance that drifts down while nothing
is happening is normal.

`cycles:balance` reports runway above the **freezing threshold**, not the raw
balance: 30 days of idle burn is reserved, and the canister stops accepting
update calls once it falls into that reserve.

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

## Revenue

Launch fees and username sales accrue in a subaccount of the canister. Nothing
sweeps automatically.

```bash
npm run ci backend:sweep
```

Moves the whole balance, less the ledger fee, to `Config.TREASURY`. The
destination is **not an argument** — it is compiled in, so a mistyped or
compromised call cannot redirect the money. Paying it somewhere else means
editing `Config.TREASURY` and redeploying, which redirects all future revenue.

To read the balance without moving it:

```bash
dfx ledger account-id --of-principal 6vbhm-nqaaa-aaaan-q6muq-cai --subaccount \
  0100000000000000000000000000000000000000000000000000000000000000
dfx ledger balance <that-account-id> --network ic
```

## Token launches

A launch costs the creator 5 ICP: 2 buys the new canister's cycles from the CMC,
the rest is revenue. **The fee is taken before the canister exists**, so any
failure after that point has already charged them — the error carries a ledger
block index so the payment stays traceable.

### Uploading the ledger wasm

```bash
npm run ci backend:wasm
```

`isTokenLaunchReady` is false until this has run, and every launch is refused
while it is. The command downloads the pinned release, **verifies its sha256
before uploading anything**, sends it to the chunk store in chunks, and seals it
against the expected module hash.

Run it once. The bytes are stored once and every launch references them by hash,
and the record survives canister upgrades — a `backend:deploy` does not require
re-running it.

### Allowlisting an already-launched token

```bash
npm run ci backend:register
```

The custodian only calls ledgers on an allowlist, and a launch registers its own
ledger. Tokens launched before that existed are unspendable inside ICPay until
this runs — deposit, transfer and withdraw all refuse them.

It takes no argument on purpose: the ids come from ICPay's own token rows, so it
cannot be used to point the custodian at a canister ICPay did not create. Safe to
re-run; it reports how many were newly added, and zero on a second run.

### Recovering a failed launch

A launch that dies between creating the canister and installing the wasm leaves
an empty canister holding the cycles, controlled by ICPay rather than by you.

```bash
npm run ci backend:reclaim <canister-id>
```

ICPay signs it over, then dfx stops and deletes it. The cycles land on the
**cycles ledger** — `cycles:topup` sends them on to the canister.

This recovers the cycles only. The 5 ICP fee is already in the revenue account,
which is your own, so nothing is lost — but it is claimed with `backend:sweep`,
not with this. The symbol is released too, so it can be launched again.

The canister will not delete a canister that has code installed, and
`releaseFailedCanister` refuses any id whose row is not `#failed`. A live token
holding real balances can never be signed away by a mistyped argument.

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
