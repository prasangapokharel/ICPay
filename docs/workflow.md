# Branch workflow

```
main ──────────────── production, auto-deploys to icpay.app
 └── dev ──────────── integration, test here first
      ├── feature/*
      ├── fix/*
      └── chore/*
```

`main` is protected: no direct pushes, no force-push, no deletion. Every change
reaches it through a pull request with both CI jobs green.

## Start work

```bash
git checkout dev
git pull origin dev
git checkout -b feature/fiat-rates
```

Commit as normal, then:

```bash
git push -u origin feature/fiat-rates
gh pr create --base dev --fill
```

CI runs on the PR. Merge once it is green.

## Release

```bash
gh pr create --base main --head dev --title "release: v1.5.0"
```

Merging this deploys to production. Then tag it:

```bash
git checkout main && git pull origin main
git tag v1.5.0 && git push origin v1.5.0
```

Versioning: patch for fixes, minor for features, major for breaking changes.

## Hotfix

Branch from `main`, not `dev`, so the fix does not drag along untested work:

```bash
git checkout main && git pull origin main
git checkout -b hotfix/login
```

PR into `main`, then merge `main` back into `dev` so the two do not drift.

## Two things that surprise people

**Vercel deploys `main` by itself.** Merging a PR into `main` is a production
deploy — there is no separate deploy step to forget, and no way to merge
"just to see."

**The canister never deploys itself.** CI deliberately has no deploy step: the
backend custodies real ICP, and automating the upgrade would mean putting a key
that can also *delete* the canister into a GitHub secret. Shipping backend
changes is still a human running:

```bash
npm run ci backend:deploy
```

So a merge to `main` ships the frontend only. Backend changes need that command
too, or the UI will be talking to the old canister.
