---
name: icpay-frontend
description: Next.js frontend for ICPay — static-export constraints, the ICP agent/actor layer, page-based i18n across 10 locales, and the eslint baseline that CI enforces. Read before editing anything under frontend/.
---

# ICPay frontend — Next.js App Router

`frontend/`. Next.js 16.2.6, App Router, TypeScript, Tailwind + shadcn/ui.
Deployed by Vercel to icpay.app on every push to `main`.

**Read `frontend/AGENTS.md` first.** This Next.js version has breaking changes
from what is in your training data; the real docs ship at
`node_modules/next/dist/docs/`.

## Static export changes what is possible

`next.config.ts` sets `output: "export"` for production builds. There is **no
server at runtime**. That rules out:

- Route handlers / API routes
- Server Actions
- `next/image` optimization (`images.unoptimized` is already set)
- Middleware, ISR, `revalidate`, dynamic `generateMetadata` at request time
- Anything reading a request header or cookie on the server

Every dynamic route must be enumerable at build time via `generateStaticParams`.
All data comes from the canister, in the browser, after hydration.

## Directory map

| Path | What lives there |
|---|---|
| `app/` | Routes. Groups: `(auth)` login, `(app)` authenticated screens, `(legal)` public pages, `(profile)` public `@handle` pages. |
| `components/` | Shared UI. `auth/`, `i18n/`, `fiat/`, `theme-provider`, plus shadcn primitives. |
| `services/` | Canister client layer — this is the only place that talks to the IC. |
| `hooks/` | React hooks holding view logic. |
| `lib/` | Pure helpers by module — see [`lib-standard/SKILL.md`](../../.agents/skills/lib-standard/SKILL.md) |
| `language/` | The 10 message catalogs plus `config.ts`. |

## Talking to the canister

Everything goes through `services/`. Do not create an `HttpAgent` or `Actor`
anywhere else.

- `services/icp.ts` — agent creation, `WALLET_CANISTER_ID`, `ALTERNATIVE_ORIGINS`
- `services/wallet.ts` — the IDL and `getWalletActor()`, which caches the actor
- `services/client.ts` — generic call/query helpers
- domain folders (`auth/`, `wallet/`, `transfer/`, …) — one per backend area

**Queries are free, update calls are not.** A query returns in ~200ms and costs
nothing; an update call takes a consensus round (~2s) and burns cycles. Never
put an update call in a polling loop or a `useEffect` that reruns on keystroke.

### Two files that must stay identical

`frontend/public/.well-known/ii-alternative-origins` and `ALTERNATIVE_ORIGINS`
in `frontend/services/icp.ts`. If they drift, Internet Identity login breaks on
one of the origins.

### Never change `NEXT_PUBLIC_DERIVATION_ORIGIN`

Permanently `https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io`. It is what makes a
user's principal stable across origins. Change it and every existing user gets a
*different* principal — pointing at a different subaccount, with their funds
unreachable.

## i18n

**Page-based, not route-based.** There are no `/en/…` URLs and no locale
segment. `components/i18n/locale-provider.tsx` reads the locale from
localStorage (`icpay:locale`) via `useSyncExternalStore` and hydrates without a
flash.

10 locales: `en hi zh ja ko es fr de pt ru`. Catalogs are
`language/<code>/common.json`, all statically imported into the bundle.

Adding a language means appending to `LOCALES` in `language/config.ts` and
creating `language/<code>/common.json`. Nothing else — see
`docs/language/add/readme.md`.

**Adding a key means adding it to all 10 files.** `language/check.mjs` verifies
catalogs are in sync; run it after touching any of them.

User-facing strings go through `t()`. The exception is on-chain data — a memo is
read by the recipient from the ledger, not rendered from a catalog, so it stays
English in every locale (see the tip-memo prefix in `components/icpverse/tip-drawer.tsx`).

## Verification

From `frontend/`:

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/eslint services hooks components app lib --ext .ts,.tsx
```

**The eslint baseline is exactly 5 errors** — known set-state-in-effect cases.
CI fails only if the count *rises*, so a bare `eslint` call looking red is
expected. Do not "fix" the baseline as a side quest, and do not let it grow.

**Do not start a dev server.** Verify statically with the two commands above.

**Do not modify `frontend/package.json`.**

## CI gotcha

The lockfile is written by npm 11, but node 22 bundles npm 10, which resolves
`@swc/core`'s optional peer `@swc/helpers` differently and rejects the lockfile
as out of sync. CI installs npm 11 first. If `npm ci` fails in CI, that is the
cause — the lockfile is correct; do not regenerate it.
