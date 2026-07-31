---
description: Folder-per-module API service layer; components never fetch inline
alwaysApply: true
---

# Services — one folder per module

All backend calls go through a typed **service layer**, organized **folder-first by module**
(mirrors the components rule). Components and pages call services — **never `fetch()` inline**.

## Structure
```
services/
  http.ts              ← shared client: base URL, auth header, JSON, error envelope
  types.ts             ← shared DTOs (User, Wallet, ApiKey, Payment, Ticket, …)
  auth/auth.ts         ← register, login, refresh, logout, me
  api-keys/api-keys.ts ← list, create, rotate, enable, disable, remove
  wallet/wallet.ts     ← balance, transactions
  usage/usage.ts       ← summary
  dashboard/dashboard.ts
  payments/payments.ts ← create top-up, list, get
  support/tickets.ts   ← create, list, get, reply
  admin/users.ts  admin/credits.ts  admin/catalog.ts  admin/settings.ts  admin/tickets.ts
```
- One module = one folder; one resource = one file (`<module>/<resource>.ts`).
- Export **named async functions** returning typed DTOs. No default exports.
- New backend resource → new `services/<module>/<resource>.ts`. Never dump calls in components.

## Shared client — `service/http.ts`
Single fetch wrapper. Reads the ONE clean env var **`NEXT_PUBLIC_API_URL`** (already includes
`/api/v1`, e.g. `http://localhost:8080/api/v1`), attaches auth, and unwraps the backend error
envelope `{ "error": { code, message } }`.
```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1"

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message) }
}

export async function api<T>(path: string, opts: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...rest } = opts
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const e = body?.error ?? {}
    throw new ApiError(res.status, e.code ?? "error", e.message ?? res.statusText)
  }
  return body as T
}
```

## Example — `services/auth/auth.ts`
```ts
import { api } from "@/services/http"
import type { User } from "@/services/types"

export type TokenResponse = { user: User; access_token: string; refresh_token: string; expires_at: string }

export const register = (email: string, password: string, name?: string) =>
  api<TokenResponse>("/auth/register", { method: "POST", body: JSON.stringify({ email, password, name }) })

export const login = (email: string, password: string) =>
  api<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })

export const me = (token: string) => api<User>("/auth/me", { token })
```

## Rules
- **Auth:** JWT (`Authorization: Bearer`) for dashboard/admin calls; the **`admin/*`** services
  require an admin token. Keep the refresh token in an **httpOnly cookie**; attach the access
  token via `http.ts`. `/messages` uses `x-api-key` and is normally server-to-server, not the UI.
- **Server Components** call services directly (server-side). **Client Components** call them
  from event handlers / hooks (or Next server actions) — still via the service, never raw fetch.
- Handle `ApiError` at the UI edge → shadcn `Alert` / `Sonner` toast (e.g. `insufficient_funds`
  → "Top up your credits"). Match backend codes in `docs/api/v1/*.md`.
- Keep DTOs in `services/types.ts` aligned with the backend responses (`../../docs/api/v1`).
