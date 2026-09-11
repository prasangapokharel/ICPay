# Project Memory - ICPay Frontend

**Last Updated:** 2026-01-XX  
**Session:** Button Migration & Live Feature Removal

---

## Recent Major Changes

### 1. Live Feature Removal (Completed)

**What was removed:**
- Complete `/live` feature including WebRTC-based live sessions
- Routes: `/live`, `/live/[id]`, `/live/new`
- 19 files deleted (~2,236 lines of code)
  - `app/(app)/live/` — 3 route files
  - `components/live/` — 8 components (session provider, room view, participant grid, mic control, etc.)
  - `hooks/live/` — 3 hooks (useLiveRoom, useLivePeers, usePageVisible)
  - `lib/live/` — 6 utilities (WebRTC, peer management, session store, audio permissions, timing, access control)
  - `services/live/live.ts` — API service

**Reason for removal:**
- Feature had no navigation entry point (only accessible by typing URL directly)
- Unused, orphaned code discovered during audit

**Integration points cleaned:**
- Removed `LiveSessionProvider` wrapper from `AppShell` (was wrapping all authenticated pages)
- Removed `settings.items.live` translation fallback from `app-sidebar-nav.ts`

**Verification:**
- Build passes, no references remain in codebase
- Routes removed from Next.js build output

---

### 2. shadcn UI Compliance Migration (In Progress)

**Goal:** Replace all raw HTML buttons with shadcn `<Button>` component for consistency, accessibility, and maintainability.

**Status:** 80% complete (40/50 buttons compliant, up from 60%)

#### What Changed
Converted **20 raw `<button>` elements** across **17 files** to use `@/components/ui/button`:

**High-Priority (App Components):**
- `app/(app)/launch/page.tsx` — Launch flow CTA
- `app/(app)/token/[ledgerId]/token-view.tsx` — Token send button  
- `app/(app)/transactions/[id]/transaction-detail.tsx` — Copy button
- `components/dashboard/home-overview-card.tsx` — Balance refresh
- `components/dashboard/balance-card.tsx` — Balance refresh
- `components/bookmark/bookmark-drawer.tsx` — Bookmark toggle + row picker
- `components/canister/canister-id-field.tsx` — Saved canister picker
- `components/canister/subnet-picker.tsx` — Subnet selection
- `components/trade/trade-amount-field.tsx` — Max + token picker buttons

**Community Components:**
- `components/community/community-reaction-row.tsx` — Reaction badges
- `components/community/community-reaction-picker.tsx` — Reaction selector  
- `components/community/community-channel-view.tsx` — Channel header
- `components/community/community-forward-modal.tsx` — Forward picker
- `components/community/community-wallpaper-picker.tsx` — Theme selector
- `components/governance/proposal-list.tsx` — Proposal cards

#### Legitimate Exceptions (Do NOT Convert)

These raw buttons/elements are **intentionally kept as-is**:

1. **Render props** — `render={<button type="button" />}` passed to shadcn components
   - This IS the correct shadcn pattern for polymorphic components
   - Examples: `Button`, `PopoverTrigger`, `CollapsibleTrigger`

2. **UI primitives** — Raw elements inside `components/ui/*.tsx`
   - These ARE the shadcn component implementations
   - `ui/button.tsx`, `ui/input.tsx`, `ui/textarea.tsx`, `ui/table.tsx`, etc.

3. **Inline text links** — Buttons styled as inline text (e.g., "See more", "Show less")
   - `community-message-content.tsx` — "See more" expansion link
   - Using shadcn Button would be semantic overkill for inline text

4. **ContextMenu render prop** — `community-composer.tsx:164`
   - `<textarea>` passed as render prop to `ContextMenuTrigger`
   - Required for polymorphic composition

5. **Blog content tables** — Raw `<table>` in markdown-style blog posts
   - Acceptable for article formatting (6 blog post files)

6. **File upload inputs** — Hidden `<input type="file">` elements
   - `logo-picker.tsx`, `bucket-upload-control.tsx`, `community-channel-avatar-picker.tsx`
   - These are controlled by visible Button triggers

#### Remaining Work (10 buttons - Low Priority)

All remaining raw buttons are in **marketing/landing pages** (cosmetic, low user impact):
- `components/icpay/icpay-presale-hero.tsx`
- `components/icpay/icpay-token-card.tsx`
- `components/icpay/buy-icpay-drawer.tsx`
- `components/products/icfalcon/hero-section.tsx`
- `components/products/icfalcon/packages-hero.tsx`
- `components/products/icfalcon/packages-grid.tsx`
- `components/public/landing-hero-preview.tsx`
- `components/public/charity/charity-hero-carousel.tsx`
- `components/swap/swap-token-picker.tsx` (render prop - verify before converting)
- `components/community/community-message-body.tsx` (inline link - keep as-is)

**Next steps:** Convert remaining marketing buttons when touching those files, or as a dedicated polish pass.

---

## Coding Rules & Patterns

### shadcn Component Usage

**Reference:** `frontend/.cursor/ui-components-reference.md`

**Always:**
- Import from `@/components/ui/*` (e.g., `@/components/ui/button`)
- Use semantic variants (`variant="outline"`, `variant="ghost"`, `variant="destructive"`)
- Use semantic size props (`size="sm"`, `size="icon"`, `size="xs"`)
- Prefer shadcn components over raw HTML for consistency

**Common Patterns:**

```typescript
// Standard button
<Button variant="outline" size="sm">Click</Button>

// Icon button
<Button variant="ghost" size="icon" aria-label="Close">
  <XIcon className="size-4" />
</Button>

// Button as Link (polymorphic render prop)
<Button nativeButton={false} render={<Link href="/path" />}>
  Navigate
</Button>

// Custom styling (preserve shadcn base, extend with className)
<Button
  variant="ghost"
  className="h-auto p-0 hover:bg-transparent"
>
  Custom styled
</Button>
```

**Do NOT:**
- Hardcode colors like `bg-white`, `text-black`, `border-gray-200`
- Use `<button>` directly for interactive UI (use `<Button>` instead)
- Convert render props or UI primitives (see "Legitimate Exceptions" above)

### Semantic Color Tokens

Always use semantic tokens for theming:
- `bg-background`, `text-foreground`
- `bg-card`, `text-card-foreground`
- `bg-muted`, `text-muted-foreground`
- `border-border`, `ring-ring`

This ensures dark mode and theme switching work correctly.

---

## Project Structure Notes

### Frontend Architecture
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** shadcn/ui (Radix UI primitives + Tailwind)
- **Styling:** Tailwind CSS with semantic design tokens
- **i18n:** next-intl
- **Icons:** Hugeicons React

### Key Directories
- `app/(app)/` — Authenticated app routes
- `app/(public)/` — Public marketing pages
- `components/ui/` — shadcn base components (DO NOT use raw HTML here)
- `components/` — Feature components (organized by domain)
- `lib/` — Utilities, helpers, type definitions
- `services/` — API client code
- `hooks/` — React hooks

### Navigation
- Main sidebar navigation defined in `lib/navigation/app-sidebar-nav.ts`
- Mobile-friendly drawer pattern used throughout
- Uses rewritten routes for cleaner URLs

---

## Known Issues & Tech Debt

### ESLint Baseline (5 errors - pre-existing)
- `set-state-in-effect` warnings in:
  - `components/canister/my-canister-topup-dialog.tsx:86`
  - `components/canister/subnet-picker.tsx:70`
  - Plus 3 others
- **Not regressions** — these existed before the button migration
- Should be fixed separately (move setState to event handlers, not effect bodies)

### Remaining shadcn Migration Work
- 10 marketing/landing page buttons still use raw `<button>`
- Not urgent (low user impact), but should be addressed for full consistency
- See "Remaining Work" section above for file list

---

## Testing & Verification

After making changes, always:
1. **Typecheck:** `./node_modules/.bin/tsc --noEmit`
2. **Build:** `npm run build` (verify routes and no runtime errors)
3. **ESLint:** Compare error count to baseline (5 errors expected)
4. **Visual check:** Test affected UI in browser (especially Button variants)

---

## Guidelines for Future AI Agents

### When Working on This Codebase

1. **Check this memory file first** before making architectural changes
2. **Follow the shadcn patterns** documented above
3. **Never reintroduce the `/live` feature** — it was intentionally removed
4. **Preserve legitimate exceptions** — don't blindly convert all raw HTML
5. **Update this memory file** when making significant changes

### When Adding New UI Components

- Check `frontend/.cursor/ui-components-reference.md` for available shadcn components
- Use existing shadcn components before creating custom ones
- Match the project's Button variant patterns (outline, ghost, etc.)
- Always use semantic color tokens, never hardcoded colors

### When Refactoring

- Read related code before changing to understand existing patterns
- Run typecheck + build before committing
- Update this memory if you discover new architectural decisions or patterns

---

## References

- **shadcn Components:** `frontend/.cursor/ui-components-reference.md`
- **Navigation:** `frontend/lib/navigation/app-sidebar-nav.ts`
- **Sidebar Config:** `frontend/components/layout/app-shell.tsx`
- **Build Output:** Check `.next/` is in `.gitignore`, never commit build artifacts

---

**End of Memory Document**
