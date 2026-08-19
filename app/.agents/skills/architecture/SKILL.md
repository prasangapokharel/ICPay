---
name: architecture
description: Feature-first Expo architecture for the ICPay React Native app. Use when adding features, folders, screens, or deciding where code belongs.
---

# Architecture

Use feature-based architecture. Business logic belongs to features.

```text
src/
├── app/              # Expo Router only — thin routes
├── features/         # domain modules
├── components/       # shared UI (ui / layout / feedback)
├── services/         # infrastructure (IC agent, storage)
├── lib/              # configured third-party libs
├── hooks/            # truly global hooks
├── utils/            # pure generic helpers
├── constants/
├── config/
└── types/
```

```text
features/
├── auth/
├── dashboard/
├── transfer/
├── deposit/
├── withdraw/
├── wallet/
├── swap/
├── transactions/
├── username/
├── profile/
├── icpverse/
├── analytics/
├── launch/
├── bucket/
├── settings/
└── icpay/
```

Do not create global business folders such as `services/payment.ts`, `services/wallet.ts`, `services/user.ts`.

Infrastructure belongs in `services`:

```text
services/
├── api/          # HttpAgent, actor factory, query/update helpers
├── storage/      # secure-store + async storage
├── analytics/
└── notifications/
```

Shared UI belongs in `components/ui`, `components/layout`, `components/feedback`.

Do not create folders that the feature does not need. A small feature may be:

```text
features/profile/
├── profile-screen.tsx
├── api/profile-api.ts
└── types.ts
```

Introduce `hooks/`, `store/`, `schemas/` only when the feature actually needs them.

---

## Dependency direction

```text
app
 ↓
features
 ↓
services / lib
 ↓
external libraries
```

Features must not import route files.

Services must not import features.

Avoid circular dependencies. If two features need something common, move it to `components/`, `services/`, `lib/`, or `utils/`.

---

## Feature boundaries

A feature owns its API, components, hooks, schemas, state, and types.

```text
features/transfer/
├── api/
├── components/
├── hooks/
├── schemas/
├── store/
├── types.ts
└── index.ts
```

Only expose public APIs through `index.ts` when useful. Avoid importing internal implementation details from another feature.

---

## Routing stays thin

```tsx
import { TransferScreen } from '@/features/transfer';

export default function TransferRoute() {
  return <TransferScreen />;
}
```

The route knows where the screen is. The feature knows how the screen works.

---

## ICPay source of truth

Screen list, auth gates, query vs update, and canister methods live in:

`docs/app/react-native/appallapi.json`

Do not invent REST routes. The backend is Motoko canister `6vbhm-nqaaa-aaaan-q6muq-cai`.

Ship in this order:

1. mvp1 — `/login`, `/`, `/transfer`, `/deposit`, `/wallet`, `/transactions`, `/settings`
2. mvp2 — `/swap`, `/withdraw`, `/username`, `/profile`, `/icpverse`
3. mvp3 — `/analytics`, `/launch`, `/bucket`, `/icpay`
