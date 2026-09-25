<!-- BEGIN:nextjs-agent-rules -->
<!-- BEGIN:nextjs-agent-rules -->
 
# Next.js: ALWAYS read docs before coding
 
Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.
 
<!-- END:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ICPay Frontend — Agent Instructions & Architectural Guide

Read this file and [`/.agents/SKILLS.md`](.agents/SKILLS.md) before writing code in `frontend/`.

ICPay frontend is a **Next.js 16 (React 19) App Router** application configured for **static export (`output: "export"`)**, served by Vercel in production and backed by on-chain Motoko canisters on the Internet Computer mainnet.

---

## 1. Skill & Task Router

Always consult the matching skill before starting a task:

| Task | Skill / Specification | Description |
|---|---|---|
| **Full Skill & Rule Index** | [`.agents/SKILLS.md`](.agents/SKILLS.md) | Master frontend skills index & domain directory maps |
| **UI Components Reference** | [`.cursor/ui-components-reference.md`](.cursor/ui-components-reference.md) | Complete catalog of 80+ shadcn UI primitives, sizes, variants, dialog & form patterns |
| **Architecture & Coding Standard** | [`.agents/skills/coding-standard/SKILL.md`](.agents/skills/coding-standard/SKILL.md) | App Router, Server vs Client components, strict TypeScript, design rules |
| **shadcn/ui Best Practices** | [`.agents/skills/shadnc/skills.md`](.agents/skills/shadnc/skills.md) | Component priority, composition, Radix/Base-UI primitives, CVA styling |
| **Pure Helpers (`lib/`)** | [`.agents/skills/lib-standard/SKILL.md`](.agents/skills/lib-standard/SKILL.md) | Pure helper guidelines, domain folders, zero React/SWR/canister dependencies |
| **Data Hooks (`hooks/`)** | [`.agents/skills/hooks-standard/SKILL.md`](.agents/skills/hooks-standard/SKILL.md) | SWR hook conventions, cache key management, optimistic updates |
| **Canister Services (`services/`)** | [`.agents/skills/frontend/SKILLS.md`](.agents/skills/frontend/SKILLS.md) | Typed canister actor clients, agent derivation, zero inline `fetch()` |
| **Next.js 16 Standards** | [`.agents/skills/nextjs/skills.md`](.agents/skills/nextjs/skills.md) | Turbopack, static export constraints, metadata, performance rules |
| **SWR Official Patterns** | [`.agents/skills/swr-official/api.md`](.agents/skills/swr-official/api.md) | Global cache, mutations, conditional queries, pagination |
| **Code Comment Standards** | [`.agents/skills/comments/SKILL.md`](.agents/skills/comments/SKILL.md) | Strict comment guidelines: explain non-obvious *why*, never restate code |

### Auto-Applied Cursor Rules
- [`.agents/rules/ui-components.mdc`](.agents/rules/ui-components.mdc): shadcn primitives, `@hugeicons/react`, semantic color tokens
- [`.agents/rules/services.mdc`](.agents/rules/services.mdc): typed service layer, zero inline fetches
- [`.agents/rules/lib-standard.mdc`](.agents/rules/lib-standard.mdc): pure utilities only, domain folders
- [`.agents/rules/hooks-standard.mdc`](.agents/rules/hooks-standard.mdc): SWR data layer, domain folders
- [`.agents/rules/shadcn-blocks.mdc`](.agents/rules/shadcn-blocks.mdc): composable shadcn blocks

---

## 2. Core Architectural Invariants

1. **Static Export (`output: "export"`)**:
   - The frontend builds to pure static HTML/CSS/JS.
   - Dynamic server runtime features (`cookies()`, `headers()`, dynamic Node server routes) **cannot** be used.
   - Dynamic route pages must implement `generateStaticParams()` or client-side slug resolution.
   - Canister interaction happens entirely in the browser via `@icp-sdk/core` and Internet Identity.

2. **Authentication & Derivation Origin**:
   - Authentication is **Internet Identity only**.
   - **NEVER change `NEXT_PUBLIC_DERIVATION_ORIGIN`**. It is permanently anchored to `https://63dke-waaaa-aaaan-q6mvq-cai.icp0.io`. Changing it alters every user's principal and permanently strands user funds.
   - Never store private keys, passwords, or seed phrases.

3. **Strict Layering**:
   ```
   app/ (Pages & Route Groups)
     ↓
   components/ (Feature UI composed from shadcn primitives)
     ↓
   hooks/ (SWR data fetching & optimistic state)
     ↓
   services/ (Canister client actors & agent setup)
   ```
   - **`lib/`**: Pure functions ONLY (no React hooks, no SWR, no canister calls).
   - **`components/`**: Never call canister actors or run `fetch()` directly; always invoke `services/` or `hooks/`.
   - Never skip layers.

4. **UI & Styling Standards**:
   - **shadcn/ui only**: Always import primitives from `@/components/ui/*`. Never hand-roll raw HTML `<button>`, `<input>`, or `<select>`.
   - **Forms**: Must use semantic `@/components/ui/field` primitives (`FieldGroup`, `Field`, `FieldLabel`, `FieldDescription`, `FieldError`).
   - **Icons**: Always use `@hugeicons/react` with `@hugeicons/core-free-icons`. Never add `lucide-react` or write inline `<svg>`.
   - **Semantic Color Tokens**: Always use CSS variables (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, `text-destructive`). Never hardcode hex colors or raw utility colors like `bg-white` or `text-black`.
   - **Responsive & Modals**: Use `<Dialog>` for standard modal forms and `<AlertDialog>` with `<AlertDialogAction variant="destructive">` for destructive actions.

5. **React 19 & ESLint Cleanliness**:
   - **Zero-Error Baseline**: ESLint error count must remain at **0 errors**.
   - **`react-hooks/set-state-in-effect`**: Never call `setState` synchronously within a `useEffect` body. Use React 19 render-phase adjustments (`prevValue` comparison) or derived state.

---

## 3. Directory & Route Map

```
frontend/
├── app/
│   ├── (app)/              auth-guarded — dashboard, transfer, deposit, withdraw, wallet, transactions, profile, settings, username, icpverse
│   ├── (auth)/             login — Internet Identity sign-in page
│   ├── (legal)/            public, crawlable — about, faq, terms, privacy, transparency
│   ├── (profile)/          [username] — public Web3 profile pages
│   ├── (public)/           blog, products, charity campaigns
│   ├── layout.tsx          root html/body layout, font imports, theme provider
│   └── globals.css         Tailwind 4 + oklch semantic theme tokens
├── components/
│   ├── ui/                 80+ shadcn/ui primitives (button, card, dialog, field, etc.)
│   ├── auth/               II sign-in cards & status indicators
│   ├── canister/           canister creation, controller management, cycles top-up
│   ├── dashboard/          balance card, quick actions, recent activity
│   ├── transfer/           recipient picker, amount input, memo field
│   ├── transactions/       transaction list, filters, receipts
│   ├── wallet/             token cards, send token drawers, asset holdings
│   ├── profile/            avatar editor, username claiming, social links
│   └── shared/             amount inputs, network badges, copy buttons
├── services/
│   ├── icp.ts              II AuthClient, agent, identity management
│   ├── client.ts           backend canister actor factory
│   ├── tokens.ts           ICP, ckBTC, and ICRC-1 ledger constants
│   ├── wallet.ts           canister call wrapper functions
│   └── [domain]/           per-feature service callers (transfer, profile, deposit, etc.)
├── hooks/
│   ├── use-wallet-data.ts  primary SWR cache & wallet state wrapper
│   ├── use-debounced.ts    debouncing hook for search/inputs
│   └── [domain]/           modular SWR hooks
├── lib/
│   ├── ui/                 cn() utility, brand images, audio chimes
│   ├── wallet/             e8s conversion, formatAmount, address parsing
│   ├── profile/            username validation, avatar resolution, profile URLs
│   ├── public/             page images, SEO constants, charity campaign definitions
│   └── [domain]/           pure mathematical, parsing, and validation helpers
├── test/                   tsx unit test suites (canister, cycles, blog SEO)
└── public/
    ├── images/             optimized modern WebP page assets, icons, wallpapers
    └── .well-known/        ii-alternative-origins & auth callbacks
```

---

## 4. UI Component Catalog Quick-Reference

Detailed component inventory is maintained in [`.cursor/ui-components-reference.md`](.cursor/ui-components-reference.md).

### Form Composition Standard
```tsx
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

<FieldGroup className="gap-4">
  <Field className="gap-2">
    <FieldLabel htmlFor="recipient">Recipient</FieldLabel>
    <Input id="recipient" placeholder="principal or @username" />
    <FieldDescription>Enter an Internet Computer principal or verified handle.</FieldDescription>
    {error ? <FieldError>{error}</FieldError> : null}
  </Field>
</FieldGroup>
```

### Dialog Form Standard
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Description text</DialogDescription>
    </DialogHeader>
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-4 py-2">
        {/* Form Fields */}
      </FieldGroup>
      <DialogFooter className="mt-4">
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <Button type="submit">Submit</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

### Destructive Action Standard
```tsx
<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogTrigger render={<Button variant="destructive">Delete</Button>} />
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction variant="destructive" onClick={handleAction}>
        Confirm
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 5. Verification & Quality Gates

Run these commands inside `frontend/` before completing any task. All must pass cleanly:

```bash
# 1. TypeScript Strict Typecheck (Must be 0 errors)
./node_modules/.bin/tsc --noEmit

# 2. ESLint (Must be 0 errors)
./node_modules/.bin/eslint services hooks components app lib --ext .ts,.tsx

# 3. Unit Tests (All suites must pass)
npx tsx --test test/**/*.test.ts

# 4. Production Static Build (143/143 pages static export)
npm run build
```
