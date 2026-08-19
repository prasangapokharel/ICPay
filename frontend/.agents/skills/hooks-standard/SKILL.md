---
name: icpay-hooks-standard
description: >-
  ICPay frontend hooks/ layout — folder-per-module, camelCase files, SWR data
  hooks only. Read before adding or moving anything under frontend/hooks/.
---

# ICPay — `hooks/` Standard

React hooks with SWR live in `frontend/hooks/`. Pure helpers belong in `lib/`;
canister calls in `services/`; JSX in `components/`.

Mirrors `lib/` layout: **one domain folder per module**, camelCase file names.

---

## Layout

```
hooks/
├── ui/                 generic UI hooks
│   ├── useDebounced.ts
│   └── useMobile.ts
├── wallet/             wallet SWR (main data layer)
│   └── useWalletData.ts
├── live/               live audio room
│   ├── useLiveRoom.ts
│   ├── useLivePeers.ts
│   └── usePageVisible.ts
├── bucket/             ICPay Cloud
│   ├── useBucket.ts
│   ├── useBucketFilePreview.ts
│   └── useBucketApiKeys.ts
├── swap/               token swap
│   └── useSwap.ts
├── token/              token launch
│   └── useLaunchData.ts
├── market/             prices
│   └── useIcpPrice.ts
├── fiat/               fiat display
│   └── useFiatValue.ts
├── analytics/          analytics export
│   └── useAnalytics.ts
└── icpay/              ICPay token presale/stats
    ├── useIcpaySale.ts
    └── useIcpayStats.ts
```

---

## Naming rules

| Rule | Example |
|---|---|
| Folder = domain module | `wallet/`, `live/`, `bucket/` |
| File = camelCase, `use` prefix | `useWalletData.ts`, `useLivePeers.ts` |
| No kebab-case files | ~~`use-wallet-data.ts`~~ → `wallet/useWalletData.ts` |
| No flat dumps at `hooks/` root | Every hook lives in a module folder |
| One primary concern per file | Split when file exceeds ~300 lines |

---

## Import paths

Always use the `@/hooks/` alias:

```typescript
import { useLiveBalance } from "@/hooks/wallet/useWalletData"
import { useDebounced } from "@/hooks/ui/useDebounced"
import { useLivePeers, livePeersKey } from "@/hooks/live/useLivePeers"
import { BUCKET_QUERY } from "@/hooks/bucket/useBucket"
```

| Do | Don't |
|---|---|
| `@/hooks/wallet/useWalletData` | `@/hooks/use-wallet-data` |
| `@/hooks/live/usePageVisible` | `@/hooks/use-page-visible` |
| `@/hooks/bucket/useBucket` | `@/hooks/use-bucket` |

Cross-module hook imports use `@/hooks/<module>/<file>`.
Inside a module, relative imports are OK for co-located hooks.

---

## What belongs in `hooks/`

| Put here | Put elsewhere |
|---|---|
| `use*` + SWR data fetching | `lib/` — pure helpers |
| Cache keys exported for mutate | `services/` — canister actors |
| `"use client"` when needed | `components/` — JSX |

---

## Module map (mirrors `lib/`)

| Module | Import prefix | Used for |
|---|---|---|
| `ui` | `@/hooks/ui/` | debounce, mobile breakpoint |
| `wallet` | `@/hooks/wallet/` | balances, profile, bookmarks |
| `live` | `@/hooks/live/` | room state, peers, tab visibility |
| `bucket` | `@/hooks/bucket/` | files, pricing, API keys |
| `swap` | `@/hooks/swap/` | swap quotes, token list |
| `token` | `@/hooks/token/` | launch fee, symbol check |
| `market` | `@/hooks/market/` | ICP/USD price |
| `fiat` | `@/hooks/fiat/` | fiat conversion display |
| `analytics` | `@/hooks/analytics/` | analytics data |
| `icpay` | `@/hooks/icpay/` | presale, token stats |

---

## Adding a new hook

1. Pick the matching module folder (or create `hooks/<module>/`).
2. Add `use<Name>.ts` with named exports — **no default exports**.
3. Import lib helpers from `@/lib/<module>/…` and services from `@/services/…`.
4. Wire components via `@/hooks/<module>/use<Name>`.

---

## Related

| Doc | Path |
|---|---|
| lib standard | [`skills/lib-standard/SKILL.md`](../lib-standard/SKILL.md) |
| SWR skill | [`.agents/skills/swr-official/`](../../skills/swr-official/) |
| Frontend skill | [`.claude/skills/icpay-frontend/SKILL.md`](../../../.claude/skills/icpay-frontend/SKILL.md) |
