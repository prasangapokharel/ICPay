# Root layout

```
my-ic-app/
├── package.json              # "ci" → tsx ci/cli.ts
├── package-lock.json         # root lock (CI runner only)
├── README.md
├── CONTRIBUTING.md           # layering + fund-access rules
├── SECURITY.md
├── LICENSE
├── .gitignore
│
├── ci/                       # operations CLI (see structure/ci.md)
├── backend/                  # Motoko canister (see structure/backend.md)
├── frontend/                 # Next.js static export (see structure/frontend.md)
├── docs/
│   ├── command/README.md     # tracked — full ci reference
│   ├── demo/                 # tracked — README screenshots
│   └── icFrame/              # this framework (tracked)
│
├── .github/
│   └── workflows/
│       └── ci.yml            # backend test + frontend build; deploy hook on main
│
├── .claude/skills/           # cross-cutting agent skills (optional, tracked)
│   ├── ic-backend/SKILL.md
│   ├── ic-frontend/SKILL.md
│   ├── ic-ops/SKILL.md
│   └── ic-git/SKILL.md
│
└── AGENTS.md                 # project map (local or tracked — your choice)
```

---

## Root `package.json`

```json
{
  "name": "my-ic-app",
  "private": true,
  "type": "module",
  "scripts": {
    "ci": "tsx ci/cli.ts"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

Every ops command: `npm run ci <group>:<command> [args]`

---

## Git branches

```
main ──────────────── production (protected, auto-deploy frontend)
 └── dev ──────────── integration (direct push OK)
      ├── feature/*
      ├── fix/*
      └── chore/*
```

| Branch | Deploy | PR required |
|---|---|---|
| `main` | Yes — Vercel rebuilds on merge | Yes + green CI |
| `dev` | No | No |
| `feature/*` | Preview URL only | Into `dev` |

Backend canister deploy is **always manual**: `npm run ci backend:deploy`.
CI never holds the controller key.

---

## Commit style

Conventional Commits. Subject = what; body = why.

```
feat(transfer): add memo field to transferByUsername

Users need an optional note on outgoing transfers for bookkeeping.
```

Types: `feat`, `fix`, `docs`, `refactor`, `perf`, `chore`. Never `update`,
`changes`, `fix`, `final`.

Stage files by name — never `git add -A`.

---

## CI workflow (`.github/workflows/ci.yml`)

Three jobs:

| Job | Runs on | Steps |
|---|---|---|
| `backend` | push/PR to `main`, `dev` | `mops install` → `bash scripts/run-tests.sh` |
| `frontend` | push/PR to `main`, `dev` | `npm ci` → `tsc --noEmit` → eslint → `build` |
| `deploy` | push to `main` only | Vercel deploy hook (frontend only) |

Backend is never deployed from CI.

---

## `docs/` ignore pattern

If you gitignore `docs/*` with selective re-includes, every new tracked subfolder
needs its own negation line:

```gitignore
docs/*
!docs/demo/
!docs/command/
!docs/icFrame/
```

New files under `docs/` are silently ignored until you add `!docs/your-folder/`.
