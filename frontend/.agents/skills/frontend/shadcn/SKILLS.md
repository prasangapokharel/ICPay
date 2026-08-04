---
description: Build whole sections from shadcn blocks via the CLI, never hand-compose
alwaysApply: true
---

# shadcn Blocks — blocks first

For any **full section** (auth pages, app shell/sidebar, dashboards, settings, tables with
toolbars), **start from an official shadcn block** instead of composing primitives by hand.
Blocks: https://ui.shadcn.com/blocks · login: /blocks/login · signup: /blocks/signup

## Rule
1. **Pick the closest block**, then install it with the CLI (run inside `frontend/`):
   ```bash
   npx shadcn@latest add sidebar-06        # app shell / sidebar
   npx shadcn@latest add login-04          # login page (see /blocks/login)
   npx shadcn@latest add signup-01         # signup page (see /blocks/signup)
   ```
   The CLI pulls in every primitive the block needs — never `npm install` a substitute or copy
   markup from the site by hand.
2. **Verify the exact block name on the blocks page before running** (e.g. `sidebar-01…16`,
   `login-01…05`, `dashboard-01`) — do not guess a name that may not exist.
3. Blocks land in `components/` / `components/ui/`. **Move the block's feature parts into the
   right feature folder** (`components/auth/`, `components/dashboard/`, …) per `ui-components.mdc`
   and keep only true primitives under `components/ui/`.
4. **Wire, don't restyle.** Replace the block's mock data / handlers with calls into the
   **service layer** (`services.mdc`). Keep default shadcn styling; adjust only via `cn()`.

## Canonical setup for this app
- **App shell:** `npx shadcn@latest add sidebar-06` → sidebar nav for the dashboard
  (Home, API Keys, Usage, Logs, Wallet, Billing, Support, Admin).
- **Auth:** a **login** block + a **signup** block → `app/(auth)/login`, `app/(auth)/signup`,
  wired to `services/auth/auth.ts` (`login`, `register`).
- **Dashboard tiles:** compose from `Card` (or a `dashboard-*` block) fed by `services/*`.

## Do / Don't
- ✅ `npx shadcn@latest add <block>` then wire to services.
- ✅ Compose several blocks + primitives into a page; keep the page thin.
- ❌ Hand-build a sidebar/login/table from `div`s and Tailwind when a block exists.
- ❌ Fork/rewrite a block's internal styles instead of using props + `cn()`.
