---
name: icpay-lib-standard
description: >-
  ICPay frontend lib/ layout — folder-per-module, camelCase files, pure helpers
  only, import paths. Read before adding or moving anything under frontend/lib/.
---

# ICPay — `lib/` Standard

Pure helpers live in `frontend/lib/`. No React, no canister calls, no SWR.
Canister access belongs in `services/`; UI in `components/`.

Mirrors backend layering: **one domain folder per module**, camelCase file names.

---

## Layout

```
lib/
├── ui/                 shared UI helpers (cn, chimes)
│   ├── utils.ts        cn() — tailwind merge
│   └── successChime.ts
├── wallet/             ICP amounts, addresses, account ids
│   ├── utils.ts        formatAmount, parseIcp, E8S, copyText
│   ├── accountId.ts    crc32, base32
│   ├── icpAddress.ts   parseAddress, detectTypedAddress
│   └── holdingsCache.ts
├── profile/            usernames, avatars, bookmarks
│   ├── username.ts
│   ├── avatar.ts
│   ├── url.ts
│   ├── reservedHandles.ts
│   ├── reservedBrands.ts
│   └── bookmarkLabels.ts
├── live/               WebRTC + session (frontend-only live)
│   ├── webrtc.ts
│   ├── sessionStore.ts
│   ├── peers.ts
│   ├── audioPerms.ts
│   └── access.ts
├── swap/               swap math + token lists
│   ├── utils.ts
│   ├── config.ts
│   └── tokens.ts
├── token/              ICPay token launch
│   ├── launch.ts
│   └── registry.ts
├── bucket/             ICPay Cloud uploads + CDN
│   ├── bucket.ts       main exports + constants
│   ├── allowedFiles.ts
│   ├── uploadChunk.ts
│   └── …
├── market/             prices + risk
│   ├── icpPrice.ts
│   └── riskScore.ts
├── analytics/          CSV export + access gates
│   ├── csv.ts
│   └── access.ts
├── fiat/               fiat display config
│   ├── config.ts
│   └── fiat.ts
├── verified/           premium tick / tier (was verifed/)
│   └── premiumTick.ts
├── receipt/            receipt formatting
│   └── receipt.ts
└── routing/            static-export route helpers
    └── rewrittenRoute.ts
```

---

## Naming rules

| Rule | Example |
|---|---|
| Folder = domain module | `wallet/`, `live/`, `bucket/` |
| File = camelCase | `sessionStore.ts`, `icpAddress.ts` |
| No kebab-case files | ~~`live-webrtc.ts`~~ → `live/webrtc.ts` |
| No flat dumps at `lib/` root | Every file lives in a module folder |
| One primary export topic per file | Split when file exceeds ~300 lines |

---

## Import paths

Always use the `@/lib/` alias:

```typescript
import { cn } from "@/lib/ui/utils"
import { formatAmount } from "@/lib/wallet/utils"
import { dedupeLivePeers } from "@/lib/live/peers"
import { prepareUploadFile } from "@/lib/bucket/prepareUpload"
```

| Do | Don't |
|---|---|
| `@/lib/wallet/utils` | `@/lib/wallet-utils` |
| `@/lib/profile/username` | `@/lib/username` |
| `@/lib/verified/premiumTick` | `@/lib/verifed/premium-tick` |
| Relative `./allowedFiles` inside same module | Cross-module relative `../../` |

Inside a module, relative imports are OK for co-located files:

```typescript
import { pathExtension } from "./allowedFiles"
```

Cross-module: always `@/lib/<module>/<file>`.

---

## What belongs in `lib/`

| Put here | Put elsewhere |
|---|---|
| Pure functions, constants, types | `services/` — canister calls |
| Formatting, parsing, validation | `hooks/` — React + SWR |
| WebRTC client (`live/webrtc.ts`) | `components/` — JSX |
| localStorage helpers | `app/` — routes |

---

## Adding a new module

1. Create `lib/<module>/` folder.
2. Add camelCase file(s) with named exports only — **no default exports**.
3. Import from `@/lib/<module>/<file>` in hooks/components/services.
4. If the module grows past ~300 lines, split by concern (see `bucket/`).
5. Unit tests live under `test/` at project level — not inside `lib/`.

Example — new `lib/notifications/`:

```
lib/notifications/
├── prefs.ts       read/write local notification prefs
└── format.ts      display helpers
```

---

## Module map (quick reference)

| Module | Import prefix | Used for |
|---|---|---|
| `ui` | `@/lib/ui/` | `cn`, success/login chimes |
| `wallet` | `@/lib/wallet/` | Amounts, fees, addresses, copy |
| `profile` | `@/lib/profile/` | Usernames, avatars, reserved names |
| `live` | `@/lib/live/` | Live audio room client |
| `swap` | `@/lib/swap/` | Swap quotes, fees, token allowlist |
| `token` | `@/lib/token/` | Token launch, registry |
| `bucket` | `@/lib/bucket/` | Cloud storage uploads |
| `market` | `@/lib/market/` | ICP price, risk score |
| `analytics` | `@/lib/analytics/` | Analytics export |
| `fiat` | `@/lib/fiat/` | Currency selector |
| `verified` | `@/lib/verified/` | Premium badge tier |
| `receipt` | `@/lib/receipt/` | Transaction receipts |
| `routing` | `@/lib/routing/` | Rewritten static routes |

---

## shadcn/ui

`components.json` aliases `utils` → `@/lib/ui/utils`. Do not move `cn()` back to root.

---

## Related

| Doc | Path |
|---|---|
| Services layer | [`.agents/rules/frontend/SKILLS.md`](../../rules/frontend/SKILLS.md) |
| Frontend skill | [`.claude/skills/icpay-frontend/SKILL.md`](../../../.claude/skills/icpay-frontend/SKILL.md) |
| Backend lib (Motoko pkg) | `backend/pkg/` — separate from frontend `lib/` |
