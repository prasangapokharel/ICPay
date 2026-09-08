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

- Route handlers / API routes (except routes Vercel keeps dynamic at deploy time)
- Server Actions
- `next/image` optimization (`images.unoptimized` is already set)
- Middleware, ISR, `revalidate`, dynamic `generateMetadata` at request time
- Anything reading a request header or cookie on the server

Every dynamic route must be enumerable at build time via `generateStaticParams`.
All data comes from the canister, in the browser, after hydration.

## Directory map

| Path | What lives there |
|---|---|
| `app/(app)/` | **Authenticated app** — wallet, transfer, channels composer, settings. Do not wrap these in the public shell. |
| `app/(auth)/` | Login |
| `app/(legal)/` | Public legal/info pages — uses `PublicLayout` |
| `app/(profile)/` | Public `@username` profile pages |
| `app/(community)/` | Public channel SEO routes |
| `app/(public)/` | Landing (`/`), blog, icbucket, icfalcon, products — `PublicLayout` wide |
| `components/public/` | `nav.tsx`, `footer.tsx`, `layout.tsx`, landing sections |
| `components/` | Domain UI + shadcn primitives |
| `services/` | Canister client layer — the only place that talks to the IC |
| `hooks/` | React hooks holding view logic |
| `lib/` | Pure helpers by module |
| `lib/public/site-links.ts` | Nav/footer link lists for public pages |
| `language/` | The 10 message catalogs plus `config.ts` |

## Public desktop shell

Use `PublicLayout` for every **marketing / legal / blog** page outside
`(app)`. Authenticated screens keep `AppShell` + `bottom-nav`.

```tsx
import { PublicLayout } from "@/components/public/layout"

// Legal, blog — centered reading column
<PublicLayout variant="content">{children}</PublicLayout>

// Product landings — full-width sections
<PublicLayout variant="wide">{children}</PublicLayout>
```

| Component | Role |
|---|---|
| `PublicNav` | Sticky top bar — logo, Blog / Channels / ICBucket / ICFalcon / About, Sign in |
| `PublicFooter` | Four-column footer — products, resources, legal, community |
| `LandingHero` | Binance-style hero with banner image + wallet video |
| `LandingProducts` | Product cards for Wallet, ICBucket, ICFalcon |
| `ProductOpenSourceBanner` | Optional CTA block above the footer on product pages |

Route groups already wired:

- `app/(public)/layout.tsx` — landing, blog, icbucket, icfalcon, products
- `app/(public)/blog/layout.tsx` — inner reading column
- `app/(legal)/layout.tsx`
- Authenticated home dashboard: `app/(app)/home` (`/home`)

Do **not** duplicate nav/footer markup in individual pages. Add links in
`lib/public/site-links.ts`.

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

Public marketing pages (legal, blog, products) are English-only for now.

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
