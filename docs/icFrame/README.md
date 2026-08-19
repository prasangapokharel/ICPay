# icFrame — Internet Computer App Framework

A reusable project skeleton for building production IC apps: Motoko backend,
Next.js static frontend, and a single operations CLI. Derived from patterns used
in custodial-wallet projects; copy the layout, rename domains, wire your canisters.

**Not a code generator.** This folder is documentation + boilerplate examples.
Clone the tree, paste the stubs, fill in your domain.

---

## What you get

| Layer | Stack | Role |
|---|---|---|
| `backend/` | Motoko, dfx, mops | On-chain canister — business logic, stable memory |
| `frontend/` | Next.js App Router, static export | UI — Vercel or asset canister |
| `ci/` | TypeScript CLI | One entry point for test, deploy, cycles, ledger |
| `.github/workflows/` | GitHub Actions | Backend tests + frontend typecheck/build |
| `.agents/` | Skills + Cursor rules | AI-assisted coding standards per layer |

---

## Request flow

```
Browser
  └─► frontend/app/(app)/<route>/page.tsx
        └─► components/<domain>/
              └─► hooks/<domain>/use*.ts        (SWR)
                    └─► services/<domain>/*.ts  (actor calls)
                          └─► lib/<domain>/*.ts   (pure helpers)

Canister
  └─► api/v1/<Domain>.mo          (thin — auth + delegate)
        └─► services/<Domain>Service.mo
              └─► repositories/<Domain>Repository.mo
                    └─► storage/<Domain>Storage.mo
              └─► validators/, ledger/, utils/
```

**Rule:** data flows down layers only. No business logic in `api/` or
`repositories/`. No canister calls in `lib/`.

---

## Directory index

| Doc | Contents |
|---|---|
| [structure/root.md](structure/root.md) | Repo root layout, scripts, git branches |
| [structure/backend.md](structure/backend.md) | Motoko layers, naming, migrations, tests |
| [structure/frontend.md](structure/frontend.md) | Routes, components, services, hooks, lib |
| [structure/ci.md](structure/ci.md) | `npm run ci` command map + adding commands |
| [structure/agents.md](structure/agents.md) | Skills and Cursor rules layout |
| [tree/full-tree.md](tree/full-tree.md) | Complete ASCII directory tree |
| [commands/README.md](commands/README.md) | Full command reference |
| [cycles/README.md](cycles/README.md) | Cycles ledger, top-up, cost table |
| [boilerplate/](boilerplate/) | Copy-paste starter files |

---

## Quick start (new project)

```bash
# 1. Scaffold from this tree
mkdir -p my-ic-app/{backend/src/{api/v1,services,repositories,storage,ledger,validators,models,migrations,config,middleware,utils},frontend/{app,components,services,hooks,lib},ci/{backend,frontend,canister,cycles,ledger},.github/workflows}

# 2. Copy boilerplate stubs (see boilerplate/)
cp docs/icFrame/boilerplate/backend/*.example my-ic-app/backend/src/...

# 3. Wire root package.json
echo '{"scripts":{"ci":"tsx ci/cli.ts"}}' > my-ic-app/package.json

# 4. Daily ops
npm run ci cycles:balance
npm run ci backend:test
npm run ci backend:deploy      # mainnet — requires TTY confirm
```

Local replica: append `-- --local` to any command (the bare `--` is required).

---

## Naming cheatsheet

| Location | Convention | Example |
|---|---|---|
| Backend modules | PascalCase `.mo` | `TransferService.mo` |
| Backend pkg utils | lowercase/path | `pkg/http/mime.mo` |
| API endpoints | Domain noun | `api/v1/Transfer.mo` |
| Migrations | `Add*` / `Stamp*` | `AddSwapTxTypes.mo` |
| Tests | `<Module>.test.mo` | `services/TransferService.test.mo` |
| Frontend routes | Route groups | `(app)/transfer/page.tsx` |
| Components | kebab-case | `transfer-form.tsx` |
| Services / hooks / lib | camelCase in domain folder | `hooks/wallet/useWalletData.ts` |
| CI commands | `group:command` | `backend:deploy` → `ci/backend/deploy.ts` |

---

## Safety defaults (keep these)

- **Upgrade only** — never `--mode=reinstall` on mainnet; it wipes stable memory.
- **Mainnet writes need confirm()** — CI has no TTY, so deploy never runs in CI.
- **Never commit** `.env`, `*.pem`, `identity.json`, `.config/dfx/`.
- **Queries are free** on the IC; only update calls and idle burn cost cycles.
- **Rollback by module hash** — sha256 of wasm is the version fingerprint.
