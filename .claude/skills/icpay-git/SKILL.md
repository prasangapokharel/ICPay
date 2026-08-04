---
name: icpay-git
description: Branch workflow, commit style, PRs and releases for ICPay — main is protected and auto-deploys to production, dev is the integration branch. Read before committing, branching, or merging.
---

# ICPay git workflow

```
main ──────────────── production, auto-deploys to icpay.app
 └── dev ──────────── integration, test here first
      ├── feature/*
      ├── fix/*
      └── chore/*
```

**`main` is protected.** No direct pushes, no force-push, no deletion. Every
change reaches it through a PR with both CI jobs green. This has been verified
by attempting a direct push and having GitHub reject it.

**Merging to `main` is a production deploy.** Vercel builds it automatically —
there is no separate deploy step, and no way to merge "just to see."

## Daily work

```bash
git checkout dev && git pull origin dev
git checkout -b feature/fiat-rates
# ... work ...
git push -u origin feature/fiat-rates
gh pr create --base dev --fill
```

`dev` allows direct pushes — it is the integration branch, and requiring a PR to
reach it as well would double the ceremony for no safety gain. Branch off it for
anything non-trivial.

## Release

```bash
gh pr create --base main --head dev --title "release: v1.5.0"
# merge, then:
git checkout main && git pull origin main
git tag v1.5.0 && git push origin v1.5.0
```

Patch for fixes, minor for features, major for breaking changes. Tags are cut on
`main` after merge, never on `dev`.

**Merging does not ship the backend.** Run `npm run ci backend:deploy` as well,
or the UI is talking to the old canister.

## Hotfix

Branch from `main`, not `dev`, so the fix does not drag along untested work:

```bash
git checkout main && git pull origin main
git checkout -b hotfix/login
```

PR into `main`, then merge `main` back into `dev` so the two do not drift.

## Branch protection specifics

Rulesets (not legacy branch protection), created via
`gh api repos/prasangapokharel/ICPay/rulesets`.

| Rule | `main` | `dev` |
|---|---|---|
| deletion / force-push | blocked | blocked |
| required checks | `backend`, `frontend` | `backend`, `frontend` |
| pull request required | yes | no |
| required approvals | **0** | — |

**0 approvals is deliberate, not an oversight.** This is a solo repo and GitHub
forbids self-approval, so requiring 1 would make every PR unmergeable. Green CI
is the real gate — it cannot be self-approved away. `enforce_admins` is off, to
leave an escape hatch for a genuine production emergency.

## Commit style

Conventional Commits. The subject says *what changed*; the body says *why*.

```
fix(ci): top up cycles through the cycles ledger, not a wallet

cycles:topup wrapped `dfx canister deposit-cycles`, which needs a cycles
wallet canister -- this identity has none, so the command could never have
worked. The cycles ledger is the wallet-free path.
```

Never `update`, `changes`, `fix`, `final`. Types in use: `feat`, `fix`, `docs`,
`refactor`, `perf`, `chore`.

## Before committing

- **Only commit when asked.** Do not commit proactively.
- Stage files by name. Never `git add -A` or `git add .` — this repo has
  plaintext credentials in the environment and a `docs/` tree with unusual
  ignore rules.
- Never commit `.env`, `*.pem`, `*.key`, `identity.json`, or anything under
  `.config/dfx/`. The dfx identity **is** the key to the canister.
- Create new commits. Do not amend, do not rewrite history, do not force-push.
- Never use `--no-verify`.

## The `docs/` ignore trap

`.gitignore` has `docs/*` followed by explicit `!` re-includes. A new file under
`docs/` is **silently ignored** unless you add its own negation line. Check with
`git status --short` — if a new doc does not appear, that is why.

`.claude/` is gitignored entirely.

## CI

`.github/workflows/ci.yml`, two jobs: `backend` (the 24-test Motoko suite) and
`frontend` (typecheck, eslint-against-baseline, build). Runs on pushes to `main`
and `dev`, and on every PR.

CI **never deploys** — see the ops skill for why.
