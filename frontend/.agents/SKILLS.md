# Frontend Skills Index

| Skill | Path | When to read |
|---|---|---|
| **lib standard** | [`skills/lib-standard/SKILL.md`](skills/lib-standard/SKILL.md) | Adding/moving `lib/` helpers |
| **hooks standard** | [`skills/hooks-standard/SKILL.md`](skills/hooks-standard/SKILL.md) | Adding/moving `hooks/` SWR hooks |
| **Services** | [`rules/frontend/SKILLS.md`](rules/frontend/SKILLS.md) | Canister client layer |
| **UI components** | [`rules/ui-components.mdc`](rules/ui-components.mdc) | shadcn, icons, RSC |
| **ICPay frontend** | [`.claude/skills/icpay-frontend/SKILL.md`](../.claude/skills/icpay-frontend/SKILL.md) | Static export, II, i18n, CI |

## Cursor rules (auto-applied)

| Rule | Scope |
|---|---|
| [`lib-standard.mdc`](rules/lib-standard.mdc) | `frontend/lib/**` |
| [`hooks-standard.mdc`](rules/hooks-standard.mdc) | `frontend/hooks/**` |
| [`services.mdc`](rules/services.mdc) | services layer |
| [`ui-components.mdc`](rules/ui-components.mdc) | components, app |

## `lib/` module map

```
lib/ui/          cn(), chimes
lib/wallet/      amounts, addresses, accountId
lib/profile/     username, avatar, reserved names
lib/live/        WebRTC, session, peers
lib/swap/        swap math, config, tokens
lib/token/       launch, registry
lib/bucket/      cloud uploads, CDN, pricing
lib/market/      icpPrice, riskScore
lib/analytics/   csv, access
lib/fiat/        currency config
lib/verified/    premiumTick
lib/receipt/     receipt helpers
lib/routing/     rewrittenRoute
```

## `hooks/` module map

```
hooks/ui/          useDebounced, useMobile
hooks/wallet/      useWalletData
hooks/live/        useLiveRoom, useLivePeers, usePageVisible
hooks/bucket/      useBucket, useBucketFilePreview, useBucketApiKeys
hooks/swap/        useSwap
hooks/token/       useLaunchData
hooks/market/      useIcpPrice
hooks/fiat/        useFiatValue
hooks/analytics/   useAnalytics
hooks/icpay/       useIcpaySale, useIcpayStats
```
