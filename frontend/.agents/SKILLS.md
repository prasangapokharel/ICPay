# Frontend Skills Index & Task Router

Read this index first when working on the ICPay frontend (`frontend/`). It maps every development task to its corresponding skill, rule, and reference specification.

---

## 1. Skill Index & Task Router

| Task | Skill / Specification | When to read |
|---|---|---|
| **Architecture & Coding Standard** | [`skills/coding-standard/SKILL.md`](skills/coding-standard/SKILL.md) | Architecture rules, strict TypeScript, Server vs Client components, design patterns |
| **UI Components Inventory & Variants** | [`.cursor/ui-components-reference.md`](../.cursor/ui-components-reference.md) | Complete catalog of 80+ shadcn UI primitives, sizes, variants, dialog & field patterns |
| **shadcn/ui Best Practices** | [`skills/shadnc/skills.md`](skills/shadnc/skills.md) | Component priority, composition, Radix/Base-UI primitives, CVA styling |
| **Pure Helpers (`lib/`)** | [`skills/lib-standard/SKILL.md`](skills/lib-standard/SKILL.md) | Adding/moving pure helpers, domain folder layout, zero React/SWR/canister calls |
| **Data Hooks (`hooks/`)** | [`skills/hooks-standard/SKILL.md`](skills/hooks-standard/SKILL.md) | Adding/moving SWR data hooks, cache keys, optimistic updates, domain folder layout |
| **Canister Services (`services/`)** | [`skills/frontend/SKILLS.md`](skills/frontend/SKILLS.md) | Canister client layer, agent/actor creation, typed DTOs, zero inline fetches |
| **Next.js 16 & App Router** | [`skills/nextjs/skills.md`](skills/nextjs/skills.md) | Next.js 16 + React 19 standards, server components, route groups, static export |
| **SWR Official Patterns** | [`skills/swr-official/api.md`](skills/swr-official/api.md) | Cache mutation, pagination, conditional fetching, middleware, performance |
| **Commenting & Doc Standards** | [`skills/comments/SKILL.md`](skills/comments/SKILL.md) | Strict comment rules: explain non-obvious *why*, never restate code, zero clutter |

---

## 2. Cursor Rules (Auto-Applied)

| Rule | Scope | Description |
|---|---|---|
| [`rules/ui-components.mdc`](rules/ui-components.mdc) | `components/**`, `app/**` | shadcn/ui only, `@hugeicons/react` icons, folder-first structure, semantic tokens |
| [`rules/services.mdc`](rules/services.mdc) | `services/**` | Folder-per-module canister services, typed DTOs, zero inline fetches |
| [`rules/lib-standard.mdc`](rules/lib-standard.mdc) | `lib/**` | Pure helpers, folder-per-domain, camelCase files, zero React/SWR/canister calls |
| [`rules/hooks-standard.mdc`](rules/hooks-standard.mdc) | `hooks/**` | SWR data hooks, folder-per-domain, camelCase `use*` files |
| [`rules/shadcn-blocks.mdc`](rules/shadcn-blocks.mdc) | `components/**` | Prefer composable shadcn blocks and official patterns before custom UI |

---

## 3. UI Component System Reference

All UI primitives live in `@/components/ui/*`. Consult [`.cursor/ui-components-reference.md`](../.cursor/ui-components-reference.md) for full variant and size matrices.

### Core Rules
1. **Never use raw HTML form elements**: Always use `<Button>`, `<Input>`, `<Textarea>`, `<Select>`, `<Checkbox>`, etc.
2. **Always use semantic `<Field>` for forms**: Use `<FieldGroup>`, `<Field>`, `<FieldLabel>`, `<FieldDescription>`, and `<FieldError>` from `@/components/ui/field`.
3. **Always use `@hugeicons/react`**: With `@hugeicons/core-free-icons`. Never import `lucide-react` or write inline `<svg>`.
4. **Always use semantic color tokens**: `bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, `text-destructive`. Never hardcode raw hex, rgb, or generic colors like `bg-white` or `text-black`.
5. **Modal & Confirmation standards**:
   - Modal forms: `<Dialog>` + `<form>` + `<FieldGroup>` + `<DialogFooter>`.
   - Destructive actions: `<AlertDialog>` with `<AlertDialogAction variant="destructive">`.

---

## 4. Frontend Architecture Layers

Strict 4-tier frontend layering:

```
app/ (thin pages & route groups)
  ↓
components/ (feature UI compose shadcn primitives)
  ↓
hooks/ (SWR data fetching, client caching, mutations)
  ↓
services/ (typed canister actors, II agent, DTOs)
```

Pure utilities live in `lib/` and are consumed across any layer:

```
lib/ (pure math, formats, validation, address parsing — NO React, NO SWR, NO canister calls)
```

---

## 5. Domain Module Directory Maps

### `lib/` Module Map
```
lib/
├── ui/                 cn() tailwind-merge, audio chimes, brand images
├── wallet/             ICP amounts, address parsing, account identifiers, holdings cache
├── profile/            username normalization, avatars, profile URLs, reserved handles
├── live/               WebRTC, session store, peer connections, audio permissions
├── swap/               swap math, DEX liquidity routing, token lists
├── token/              token launch helpers, token registry
├── bucket/             ICPay Cloud uploads, chunking, CDN resolution, storage pricing
├── market/             ICP market price, risk scoring
├── analytics/          CSV export utilities, analytics data formatting
├── fiat/               currency configuration, formatters
├── verified/           verified badge logic
├── receipt/            transaction receipt generation
└── roadmap/            product roadmap items & milestones
```

### `hooks/` Module Map
```
hooks/
├── ui/                 useDebounced, useMobile
├── wallet/             useWalletData (primary SWR data layer)
├── live/               useLiveRoom, useLivePeers, usePageVisible
├── bucket/             useBucket, useBucketFilePreview, useBucketApiKeys
├── swap/               useSwap
├── token/              useLaunchData
├── market/             useIcpPrice
├── fiat/               useFiatValue
├── analytics/          useAnalytics
└── icpay/              useIcpaySale, useIcpayStats
```

### `services/` Module Map
```
services/
├── icp.ts              Internet Identity auth client, agent derivation, login/logout
├── client.ts           canister actor factory, IDL declarations
├── tokens.ts           ICP & ICRC-1 ledger constants and canister IDs
├── wallet.ts           backend canister caller bindings
├── account/            account balance and subaccount resolution
├── auth/               II session management and delegation
├── transfer/           ICP & ICRC token transfers
├── withdraw/           canister subaccount withdrawal
├── deposit/            subaccount generation and balance sync
├── buy/                ICPay token acquisition
├── profile/            username registration, lookup, avatar updates
├── canister/           developer canister creation, top-up, cycles management
├── dashboard/          dashboard metrics, user summary
└── community/          on-chain community channels, messages, reactions
```

---

## 6. Verification Gates

Before completing any task, run all quality gates from `frontend/`:

```bash
# 1. Typecheck (0 errors required)
./node_modules/.bin/tsc --noEmit

# 2. ESLint (0 errors required)
./node_modules/.bin/eslint services hooks components app lib --ext .ts,.tsx

# 3. Unit Tests (6/6 passing required)
npx tsx --test test/**/*.test.ts

# 4. Production Static Build (143/143 pages passing)
npm run build
```
