---
name: navigation
description: Expo Router structure, auth groups, and ICPay tab/menu map. Use when adding screens, tabs, deep links, or route files.
---

# Navigation

Use Expo Router. Keep route files thin.

```tsx
export default function PaymentRoute() {
  return <PaymentScreen />;
}
```

Business logic belongs in `features/`.

Use route groups for navigation boundaries: `(auth)`, `(tabs)`, `(app)`, `(legal)`.

Do not duplicate navigation logic across screens. Centralize reusable helpers when required.

---

## ICPay map

```text
src/app/
├── (auth)/
│   └── login.tsx
├── (app)/
│   ├── (tabs)/
│   │   ├── index.tsx            # home
│   │   ├── icpverse.tsx
│   │   ├── username.tsx         # center action
│   │   ├── transfer.tsx
│   │   └── settings.tsx         # menu
│   ├── deposit.tsx
│   ├── withdraw.tsx
│   ├── wallet.tsx
│   ├── token/[ledgerId].tsx
│   ├── swap.tsx
│   ├── transactions.tsx
│   ├── analytics.tsx
│   ├── profile.tsx
│   ├── icpverse/[username].tsx
│   ├── launch/
│   ├── bucket/
│   └── icpay.tsx
├── (legal)/
│   ├── about.tsx
│   ├── faq.tsx
│   ├── terms.tsx
│   └── privacy.tsx
└── [username].tsx               # public profile, no auth
```

Authenticated group requires an II session. Redirect anonymous users to `/login`.

Public: `/login`, `/[username]`, `/about`, `/faq`, `/terms`, `/privacy`.

Bottom tabs: home, icpverse, buy username (center), transfer, menu.

Menu sections (from `appallapi.json`): money, identity, storage, activity. Include `/swap` in money — the web menu JSON omitted it.

Deep links: `icpay.app/[username]` and payment links. Send from a public profile requires login.

Do not add a screen that is not in `docs/app/react-native/appallapi.json` without an explicit product decision.
