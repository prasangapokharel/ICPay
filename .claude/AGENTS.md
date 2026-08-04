# ICPay — agent map

Custodial ICP wallet. Motoko canister on the Internet Computer, Next.js
frontend. **It holds real user funds on mainnet**, which is why several things
here are stricter than they would be in an ordinary web app.

Read this file first. Then read the one skill below that matches your task —
not all of them.

## Skills

| Skill | Read it when |
|---|---|
| [`skills/icpay-backend/SKILL.md`](skills/icpay-backend/SKILL.md) | Touching any `.mo` file. Layering rules, the reserved-keyword traps, how to add an endpoint. |
| [`skills/icpay-frontend/SKILL.md`](skills/icpay-frontend/SKILL.md) | Touching `frontend/`. Static-export limits, actor/agent code, i18n, the lint baseline. |
| [`skills/icpay-ops/SKILL.md`](skills/icpay-ops/SKILL.md) | Deploying, cycles, rollback, reading logs. Every `npm run ci` command. |
| [`skills/icpay-git/SKILL.md`](skills/icpay-git/SKILL.md) | Committing, branching, opening a PR, cutting a release. |
| [`skills/icpay-roadmap/SKILL.md`](skills/icpay-roadmap/SKILL.md) | Asked to build a feature. What is done, what is next, what was refused and why. |

Two more files sit next to the code they describe. `frontend/AGENTS.md` warns
that this Next.js version differs from your training data. `backend/AGENTS.md`
is the original build spec — useful for *intent*, but written before the code
existed, so it names modules that were never built (`ProfileRepository`, a
`Profile` model, per-feature `api/v1/auth/` subdirectories). Where it disagrees
with the backend skill or the code, the code wins.

## Vendored reference material

Third-party documentation, checked in so it is available offline and pinned:

| Path | Contents |
|---|---|
| `backend/.agents/skills/motok/` | The Motoko language reference — fundamentals, types, actors, stable memory, error codes, plus ~150 runnable `.mo` examples. Also has focused guides on cycles-and-cost, ledger-integration, and internet-identity-auth. |
| `frontend/.agents/skills/` | SWR official docs, shadcn and Next.js notes, and a comment-style skill. |

Consult these for **language and library questions** — how orthogonal
persistence works, what an error code means, how an ICRC-1 call is shaped. The
five skills above are what is true about *this project*. When the two disagree
about ICPay specifically, the skills win.

## The system in one screen

```
Browser ──> Next.js static export ──> Vercel ──> icpay.app
                    │
                    │  @dfinity/agent, update + query calls
                    ▼
        icp_wallet_backend  6vbhm-nqaaa-aaaan-q6muq-cai
                    │
                    │  ICRC-1 / legacy transfer
                    ▼
              ICP Ledger canister
```

The canister is **custodian**: it owns one ledger account and gives each user a
subaccount derived from their principal. Users never hold a key to their funds —
the canister moves money on their behalf after Internet Identity proves who is
calling.

| | |
|---|---|
| Backend canister | `icp_wallet_backend` = `6vbhm-nqaaa-aaaan-q6muq-cai` |
| Frontend asset canister | `63dke-waaaa-aaaan-q6mvq-cai` |
| Production | https://icpay.app (Vercel, auto-deploys `main`) |
| Repo | `prasangapokharel/ICPay` |
| Auth | Internet Identity only |

## Rules that apply everywhere

**Never store private keys, seed phrases, or passwords.** Authentication is
Internet Identity and nothing else. If a task seems to need a stored secret, the
design is wrong — say so instead of implementing it.

**Do not run large call loops against mainnet.** Update calls cost real cycles.
Cap any test loop at 10–30 calls.

**Verify statically. Do not start a dev server.** No `npm run dev`, no starting
the local replica unless asked. Read the code and run typecheck/lint instead.

**Return minimal diffs.** Change what was asked, preserve surrounding
formatting, do not opportunistically refactor nearby code.

**Never stream full logs.** Pipe through `| tail -N` and report
`EXIT=${PIPESTATUS[0]}`. Surface errors, not output.

**dfx needs a warning suppressed** for every mainnet command, because the
controller identity on this machine is stored in plaintext:

```bash
export DFX_WARNING=-mainnet_plaintext_identity
```

The `npm run ci` wrapper sets this itself. Raw `dfx` calls need it manually.

## Comment style

Comments explain **why**, never what. One or two lines for almost all of them.
No restating the code, no commented-out code, no section banners. A comment that
would not surprise a competent reader should not be written at all. This repo's
existing comments are the reference — match them.

## Things that will burn you

**`.claude/` is gitignored.** So is `docs/*`, which then re-includes specific
paths with `!` lines. A new doc under `docs/` is silently ignored by git unless
you add its own negation line to `.gitignore`.

**`NEXT_PUBLIC_DERIVATION_ORIGIN` must never change.** It is permanently
`https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io`. Changing it invalidates every
existing user's Internet Identity principal — their funds become unreachable.

**Merging to `main` is a production deploy.** Vercel builds it automatically.
There is no "merge just to see."

**Merging to `main` does NOT deploy the canister.** That is always a human
running `npm run ci backend:deploy`. Frontend and backend ship separately, so a
merged backend change is not live until someone runs that command.
