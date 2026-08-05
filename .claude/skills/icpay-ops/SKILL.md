---
name: icpay-ops
description: Operating the ICPay canister — every npm run ci command, deploy and rollback, cycles top-up through the cycles ledger, and reading logs. Read before running anything against mainnet.
---

# ICPay ops

One entry point for everything: `npm run ci <group>:<command>`, dispatched by
`ci/cli.ts`. Adding a command means adding a file under `ci/<group>/` and one
line in `cli.ts`.

**Every command targets mainnet by default.** For a local replica:
`npm run ci <command> -- --local`. The bare `--` is required — npm swallows a
lone `--local` and the command silently hits mainnet. The banner always prints
which network it resolved.

Commands that write to mainnet ask for a typed `yes` first. They refuse to run
without a TTY, which is why CI can never trigger one.

## Commands

| Command | What it does |
|---|---|
| `backend:test` | `bash scripts/run-tests.sh` — the 24-file Motoko suite |
| `backend:build` | `dfx build icp_wallet_backend` |
| `backend:deploy` | test → build → print hash → **confirm** → `dfx deploy --yes` |
| `backend:rollback <ref> [hash]` | rebuild `<ref>` in a throwaway worktree, verify the hash, **confirm**, `dfx canister install --mode upgrade` |
| `backend:hash` | live module hash |
| `backend:logs` | canister logs |
| `frontend:build` | typecheck + `next build` |
| `frontend:deploy` | typecheck → **confirm** → upload to the asset canister |
| `canister:list` / `:status` / `:id` / `:info` / `:call` | inspection; `canister:call <method> ['(args)'] [--update]` |
| `cycles:balance` | balance, idle burn, runway in days |
| `cycles:address` | the ledger account to send ICP to |
| `cycles:convert <icp>` | burn ICP → mint cycles on the cycles ledger |
| `cycles:topup <cycles>` | move cycles from the cycles ledger into the canister |
| `ledger:balance` / `:transfer` / `:history` | operator's own ICP, not user funds |

## Cycles

At zero cycles the canister is **deleted**, taking every user record with it.
This is the number to watch.

```bash
npm run ci cycles:balance
```

Reports runway **above the freezing threshold**, not the raw balance. 30 days of
idle burn is reserved; once the balance falls into that reserve the canister
stops accepting update calls — the wallet goes read-only before it dies.

### Topping up is two steps

There is **no cycles wallet canister** for this identity, so
`dfx canister deposit-cycles` does not work. The cycles ledger is the path, and
minting is separate from depositing:

```bash
npm run ci cycles:address        # send ICP to the account ID it prints
npm run ci cycles:convert 1      # ICP -> cycles, onto the cycles ledger
npm run ci cycles:topup 1527800000000
```

Rate comes from the CMC (`rkp4c-7iaaa-aaaaa-aaaca-cai`,
`get_icp_xdr_conversion_rate`). `xdr_permyriad_per_icp` is ten-thousandths of an
XDR and 1 XDR = 1T cycles, so 15_278 means 1 ICP = 1.5278T cycles.

**Cycles cannot be converted back to ICP.** Convert what is needed, keep the
rest liquid.

### What actually costs cycles

**Queries are not billed.** Only update calls (~66.8M each) and idle burn.
A balance drifting down while nothing is happening is normal and expected —
idle burn dominates. At ~1.43B/day, idle costs more per year than a thousand
transfers a day would.

When reporting cycle numbers, always give **measured** before/after values with
the reduction percentage. Never project or estimate.

## Deploy

```bash
npm run ci backend:deploy
```

CI **never deploys the backend**. That is deliberate: the canister custodies
real ICP, and automating the upgrade would mean putting a key that can also
*delete* the canister into a GitHub secret. Shipping the backend is always a
human running that command.

CI **does** ship the frontend. Once both suites pass on `main`, a `deploy` job
fires a Vercel deploy hook held in the `VERCEL_DEPLOY_HOOK_URL` repo secret. It
only builds a commit already on `main` and cannot read or move funds, so it does
not carry the risk the controller key does. Rotate it from the Vercel project's
Git settings and re-set it with `gh secret set VERCEL_DEPLOY_HOOK_URL`.

**The hook is the only path to production.** Vercel's own GitHub integration
would otherwise deploy the same commit a second time, in parallel with the hook
and *without waiting for CI* — so a red build reached icpay.app anyway, which is
the whole reason the hook exists. `frontend/vercel.json` turns that off:

```json
"git": { "deploymentEnabled": { "main": false, "dev": false } }
```

`dev` is off for a different reason: it is the integration branch and every
push to it was spending a build on a URL nobody opens. Feature branches still
deploy, so a PR still gets its preview — that is where a change is actually
reviewed. Deploy hooks are unaffected by this setting; the one thing that
*would* block them is the deprecated `github.enabled: false`, which is why it is
not used here.

Because Vercel reads `vercel.json` from the commit being deployed, the merge
that first lands this setting still double-deploys. Every merge after it does
not.

So a merge to `main` ships the **frontend only**. A merged backend change is not
live until someone deploys it.

Record the module hash before deploying — it is what makes rollback possible:

```bash
npm run ci backend:hash
npm run ci backend:rollback f6f3c43 0xd8f923ac...
```

An upgrade preserves stable state; it does not rewrite existing rows. A change
to how records are *written* only affects rows written after the deploy.

## Raw dfx

The wrapper sets this itself; raw calls need it, because the controller identity
on this machine is stored in plaintext:

```bash
export DFX_WARNING=-mainnet_plaintext_identity
```

`dfx` must run from `backend/` — it reads `dfx.json` from the working directory,
and from the repo root it reports "Cannot find canister id."

## Standing constraints

- Cap any mainnet test loop at 10–30 calls. Update calls cost real money.
- Never stream full logs — `| tail -N`, report `EXIT=${PIPESTATUS[0]}`, surface
  errors only.
- The controller identity is the canister's **sole** controller, with an
  unencrypted on-disk key, while custodying real user ICP. Treat it accordingly.

## Reference

`docs/command/README.md` is the operations reference and is meant to stay true —
update it when a command changes. `docs/costing/here.md` holds cycle-cost
analysis.
