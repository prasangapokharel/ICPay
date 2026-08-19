# Frontend structure

Next.js App Router, **static export** (`output: "export"`), Tailwind + shadcn.
Data fetching via SWR in `hooks/`. Canister calls in `services/`. Pure logic in
`lib/`.

```
frontend/
├── package.json
├── tsconfig.json
├── next.config.ts            # output: "export"
├── components.json           # shadcn config
├── postcss.config.mjs
│
├── app/                      # routes only — thin pages
│   ├── layout.tsx
│   ├── globals.css
│   ├── manifest.ts
│   ├── robots.ts
│   ├── sitemap.ts
│   │
│   ├── (app)/                # auth-guarded shell
│   │   ├── layout.tsx        # redirects anonymous → /login
│   │   ├── page.tsx          # dashboard
│   │   ├── transfer/page.tsx
│   │   ├── deposit/page.tsx
│   │   ├── withdraw/page.tsx
│   │   ├── wallet/page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── profile/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   └── login/page.tsx
│   │
│   ├── (legal)/              # public, crawlable
│   │   ├── layout.tsx
│   │   ├── about/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── terms/page.tsx
│   │   └── privacy/page.tsx
│   │
│   └── (profile)/
│       └── [username]/page.tsx
│
├── components/               # JSX by domain (kebab-case files)
│   ├── ui/                   # shadcn primitives (~button, dialog, sheet…)
│   ├── layout/
│   │   ├── app-header.tsx
│   │   └── bottom-nav.tsx
│   ├── auth/
│   │   └── auth-provider.tsx
│   ├── dashboard/
│   │   ├── balance-card.tsx
│   │   └── recent-transactions.tsx
│   ├── transfer/
│   │   ├── transfer-form.tsx
│   │   └── recipient-card.tsx
│   ├── deposit/
│   ├── withdraw/
│   ├── wallet/
│   └── shared/               # cross-domain UI (qr, badges, spinners)
│
├── hooks/                    # SWR + React state (camelCase, domain folders)
│   ├── ui/
│   │   ├── useDebounced.ts
│   │   └── useMobile.ts
│   ├── wallet/
│   │   └── useWalletData.ts
│   └── <domain>/
│       └── use<Feature>.ts
│
├── services/                 # canister actor layer
│   ├── client.ts             # shared call(), Outcome type, actor factory
│   ├── icp.ts                # II auth, derivation origin, canister IDs
│   ├── tokens.ts
│   ├── wallet.ts
│   ├── types.ts
│   └── <domain>/
│       └── <domain>.ts       # one folder per backend API domain
│
├── lib/                      # pure helpers (no React, no canister)
│   ├── ui/
│   │   └── utils.ts          # cn(), formatters
│   ├── wallet/
│   │   ├── accountId.ts
│   │   └── icpAddress.ts
│   └── <domain>/
│       └── *.ts
│
├── language/                 # i18n (optional)
│   ├── config.ts
│   └── en/common.json
│
└── public/
    └── .well-known/
        └── ii-alternative-origins
```

---

## Data flow

```
page.tsx
  → feature component (components/transfer/transfer-form.tsx)
    → hook (hooks/wallet/useWalletData.ts)     ← SWR cache key + revalidate
      → service (services/transfer/transfer.ts) ← actor method call
        → lib (lib/wallet/accountId.ts)       ← pure transform
```

| Folder | Contains | Must not contain |
|---|---|---|
| `app/` | route shells, metadata | business logic, direct actor calls |
| `components/` | JSX, local UI state | SWR, canister calls |
| `hooks/` | SWR, effects, derived state | JSX, pure helpers |
| `services/` | actor calls, IDL types | React, UI |
| `lib/` | pure functions | React, canister, fetch |

---

## Import paths

```typescript
import { transfer } from "@/services/transfer/transfer"
import { useWalletData } from "@/hooks/wallet/useWalletData"
import { isHexAccountId } from "@/lib/wallet/utils"
import { TransferForm } from "@/components/transfer/transfer-form"
```

Never flat kebab paths like `@/hooks/use-wallet-data`.

---

## Route groups

| Group | Auth | SEO |
|---|---|---|
| `(app)/` | Required — layout redirects to `/login` | noindex |
| `(auth)/` | Public | noindex |
| `(legal)/` | Public | indexed |
| `(profile)/` | Public | indexed per user |

---

## Static export constraints

- No Server Actions, no dynamic API routes (except explicit proxies)
- No `getServerSideProps` — use client-side SWR
- Images: `unoptimized: true` or static imports
- **Never change `NEXT_PUBLIC_DERIVATION_ORIGIN`** after launch — users get new principals

---

## Verify before merge

```bash
cd frontend
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/eslint services hooks components app lib --ext .ts,.tsx
npm run build
```

---

## Boilerplate files

| File | Purpose |
|---|---|
| [boilerplate/frontend/page.example.tsx](../boilerplate/frontend/page.example.tsx) | Thin route page |
| [boilerplate/frontend/feature-service.example.ts](../boilerplate/frontend/feature-service.example.ts) | Service module |
| [boilerplate/frontend/useFeature.example.ts](../boilerplate/frontend/useFeature.example.ts) | SWR hook |
| [boilerplate/frontend/feature-form.example.tsx](../boilerplate/frontend/feature-form.example.tsx) | Domain component |
| [boilerplate/frontend/feature-helper.example.ts](../boilerplate/frontend/feature-helper.example.ts) | lib helper |
