# Frontend Coding Standard

> **Status:** Required
> **Stack:** Next.js + React + TypeScript
> **Architecture:** App Router + Server Components + typed service layer
> **API:** `/api/v1`
> **Quality target:** Production / A++
> **Principle:** Simple, typed, scalable, testable, and maintainable.

---

## 1. Core Principles

Every frontend change MUST follow these principles:

1. **TypeScript first**
2. **Server Components by default**
3. **Client Components only when required**
4. **Components never call APIs directly**
5. **All backend communication goes through `services/`**
6. **`lib/` contains reusable domain logic, not API calls**
7. **Hooks remain thin**
8. **Avoid duplicated business logic**
9. **Avoid premature abstractions**
10. **Prefer composition over large components**
11. **Use explicit, predictable naming**
12. **Keep modules independently maintainable**
13. **Do not introduce a dependency without a reason**
14. **Do not hide important behavior behind unnecessary abstractions**
15. **Every API boundary must be typed**

The goal is not the smallest number of files.

The goal is the **smallest architecture that remains clean as the application grows**.

---

# 2. Architecture

Recommended structure:

```text
frontend/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── admin/
│   ├── api/
│   ├── layout.tsx
│   ├── error.tsx
│   ├── loading.tsx
│   └── not-found.tsx
│
├── components/
│   ├── ui/
│   ├── wallet/
│   ├── bucket/
│   ├── swap/
│   ├── token/
│   └── profile/
│
├── hooks/
│   ├── ui/
│   ├── wallet/
│   ├── bucket/
│   ├── swap/
│   └── market/
│
├── services/
│   ├── http.ts
│   ├── types.ts
│   ├── auth/
│   │   └── auth.ts
│   ├── wallet/
│   │   └── wallet.ts
│   ├── payments/
│   │   └── payments.ts
│   └── admin/
│       ├── users.ts
│       └── credits.ts
│
├── lib/
│   ├── ui/
│   ├── wallet/
│   ├── profile/
│   ├── swap/
│   ├── token/
│   ├── bucket/
│   ├── market/
│   ├── analytics/
│   └── routing/
│
├── config/
│   ├── app.ts
│   ├── wallet.ts
│   └── navigation.ts
│
├── providers/
│   └── providers.tsx
│
├── types/
│   └── global.ts
│
├── middleware.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

# 3. Dependency Direction

The dependency direction MUST remain predictable.

```text
                 ┌─────────────┐
                 │    app/     │
                 └──────┬──────┘
                        │
                        ▼
                ┌──────────────┐
                │ components/  │
                └──────┬───────┘
                       │
                       ▼
                  ┌─────────┐
                  │ hooks/  │
                  └────┬────┘
                       │
                       ▼
                ┌────────────┐
                │ services/  │
                └────────────┘

lib/ = reusable domain logic
```

### Allowed

```text
app → components
components → hooks
hooks → services
components → lib
hooks → lib
services → lib
```

### Avoid

```text
lib → components
lib → hooks
services → components
services → hooks
```

`lib/` must remain independent from React whenever possible.

---

# 4. App Router Rules

`app/` is responsible for:

* routing
* layouts
* loading states
* error boundaries
* route composition
* metadata
* Server Component orchestration

It should NOT become a business-logic directory.

### Good

```tsx
// app/(dashboard)/wallet/page.tsx

import { WalletPage } from "@/components/wallet/wallet-page"

export default function Page() {
  return <WalletPage />
}
```

### Avoid

```tsx
// ❌ page.tsx containing hundreds of lines
// ❌ API calls
// ❌ wallet calculations
// ❌ transaction formatting
// ❌ complex business logic
```

---

# 5. Server Components First

Server Components are the default.

Do NOT add:

```tsx
"use client"
```

unless the component actually requires client functionality.

Use Client Components for things such as:

* `useState`
* `useEffect`
* event handlers
* browser APIs
* client-side subscriptions
* interactive forms
* client-side hooks

### Good

```tsx
// Server Component

import { getWallet } from "@/services/wallet/wallet"

export default async function WalletPage() {
  const wallet = await getWallet()

  return <WalletBalance wallet={wallet} />
}
```

### Client component only when necessary

```tsx
"use client"

import { useState } from "react"

export function AmountInput() {
  const [amount, setAmount] = useState("")

  return (
    <input
      value={amount}
      onChange={(event) => setAmount(event.target.value)}
    />
  )
}
```

Do not turn an entire route into a Client Component just because one child needs interactivity.

---

# 6. Components

Components are responsible for UI composition.

A component should generally:

* receive typed props
* render UI
* handle local UI state
* compose smaller components

A component should NOT:

* directly call `fetch`
* know API URLs
* contain database logic
* contain large business algorithms
* duplicate domain calculations

### Good

```tsx
type WalletBalanceProps = {
  balance: string
  symbol: string
}

export function WalletBalance({
  balance,
  symbol,
}: WalletBalanceProps) {
  return (
    <div>
      <span>{balance}</span>
      <span>{symbol}</span>
    </div>
  )
}
```

---

# 7. Component Size

There is no arbitrary "100-line rule".

Instead, split a component when it has multiple responsibilities.

### Bad

```text
WalletPage
├── API requests
├── transaction calculation
├── modal state
├── wallet balance
├── transaction table
├── pagination
├── filtering
├── formatting
└── notifications
```

### Better

```text
WalletPage
├── WalletHeader
├── WalletBalance
├── WalletActions
├── TransactionFilters
├── TransactionTable
└── TransactionPagination
```

Use composition instead of creating one giant component.

---

# 8. UI Components

`components/ui/` contains generic UI primitives.

Example:

```text
components/ui/
├── button.tsx
├── card.tsx
├── dialog.tsx
├── input.tsx
├── table.tsx
└── sonner.tsx
```

These components MUST remain domain-neutral.

### Good

```tsx
<Button>Send</Button>
```

### Bad

```tsx
<WalletSendButton />
```

inside `components/ui/`.

Wallet-specific behavior belongs in:

```text
components/wallet/
```

---

# 9. Feature Components

Use feature folders for domain UI.

```text
components/
├── wallet/
├── bucket/
├── swap/
├── token/
├── profile/
└── market/
```

Example:

```text
components/wallet/
├── wallet-page.tsx
├── wallet-balance.tsx
├── wallet-actions.tsx
├── transaction-table.tsx
└── transaction-row.tsx
```

This prevents a huge global component directory.

---

# 10. Services

All backend communication MUST go through `services/`.

```text
services/
├── http.ts
├── types.ts
├── auth/
├── wallet/
├── payments/
├── usage/
└── admin/
```

Components MUST NOT contain:

```ts
fetch(...)
```

Hooks MUST NOT contain raw HTTP implementation.

---

# 11. HTTP Client

There must be exactly one shared HTTP implementation.

```ts
// services/http.ts

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api/v1"

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...request } = options

  const response = await fetch(`${API_URL}${path}`, {
    ...request,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...headers,
    },
  })

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const error = body?.error

    throw new ApiError(
      response.status,
      error?.code ?? "UNKNOWN_ERROR",
      error?.message ?? response.statusText,
    )
  }

  return body as T
}
```

No other file should reimplement this logic.

---

# 12. API Versioning

The API version belongs in the environment configuration.

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

Services should use:

```ts
api("/wallet/balance")
```

NOT:

```ts
api("/api/v1/wallet/balance")
```

This allows changing:

```text
/api/v1
```

to:

```text
/api/v2
```

without modifying every service.

---

# 13. Service Functions

Use named functions.

```ts
// services/wallet/wallet.ts

import { api } from "@/services/http"
import type {
  WalletBalance,
  WalletTransaction,
} from "@/services/types"

export async function getBalance(
  token: string,
): Promise<WalletBalance> {
  return api<WalletBalance>("/wallet/balance", {
    token,
  })
}

export async function getTransactions(
  token: string,
): Promise<WalletTransaction[]> {
  return api<WalletTransaction[]>("/wallet/transactions", {
    token,
  })
}
```

Avoid default exports.

---

# 14. Service Naming

Use HTTP/domain intent rather than generic names.

### Good

```ts
getWallet()
getBalance()
getTransactions()

createPayment()
getPayment()
listPayments()

createApiKey()
rotateApiKey()
disableApiKey()
deleteApiKey()
```

### Bad

```ts
request()
data()
handle()
process()
execute()
doThing()
```

---

# 15. DTO Types

Keep API response types in `services/types.ts` when shared.

```ts
export interface User {
  id: string
  email: string
  name: string
}

export interface WalletBalance {
  available: string
  locked: string
  currency: string
}

export interface Payment {
  id: string
  amount: string
  status: PaymentStatus
  created_at: string
}

export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
```

Use backend naming exactly when these are API DTOs.

Do not silently convert:

```text
created_at
```

into:

```text
createdAt
```

at the API boundary unless an explicit mapping layer exists.

---

# 16. DTO vs Domain Model

API DTOs and frontend domain models are different concepts.

### API DTO

```ts
type PaymentDto = {
  amount: string
  created_at: string
}
```

### Domain model

```ts
type Payment = {
  amount: bigint
  createdAt: Date
}
```

If conversion is needed, make it explicit:

```ts
function toPayment(dto: PaymentDto): Payment {
  return {
    amount: BigInt(dto.amount),
    createdAt: new Date(dto.created_at),
  }
}
```

Do not randomly transform data throughout components.

---

# 17. Hooks

Hooks should be thin orchestration layers.

They may contain:

* SWR
* React state
* polling
* subscriptions
* client lifecycle

They should not contain large business algorithms.

### Good

```ts
import useSWR from "swr"
import { getBalance } from "@/services/wallet/wallet"

export function useWalletBalance(token: string | null) {
  return useSWR(
    token ? ["wallet-balance", token] : null,
    ([, accessToken]) => getBalance(accessToken),
  )
}
```

### Bad

```ts
// ❌ Huge calculation/business layer inside hook

export function useWallet() {
  // 500 lines
}
```

Move reusable logic into `lib/`.

---

# 18. `lib/` Rules

`lib/` contains reusable domain logic.

Examples:

```text
lib/
├── wallet/
│   ├── amounts.ts
│   ├── addresses.ts
│   └── account-id.ts
│
├── swap/
│   ├── math.ts
│   └── pricing.ts
│
├── bucket/
│   ├── pricing.ts
│   └── files.ts
│
└── profile/
    └── username.ts
```

### Good

```ts
// lib/wallet/amounts.ts

export function formatTokenAmount(
  value: bigint,
  decimals: number,
): string {
  if (decimals === 0) {
    return value.toString()
  }

  const divisor = 10n ** BigInt(decimals)
  const whole = value / divisor
  const fraction = value % divisor

  if (fraction === 0n) {
    return whole.toString()
  }

  return `${whole}.${fraction
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "")}`
}
```

This is:

* deterministic
* reusable
* testable
* independent of React

---

# 19. `lib/` Must Not Become `utils.ts`

Avoid:

```text
lib/
└── utils.ts
```

containing 100 unrelated functions.

Prefer:

```text
lib/
├── wallet/
│   └── amounts.ts
├── profile/
│   └── username.ts
├── swap/
│   └── math.ts
└── bucket/
    └── pricing.ts
```

Domain ownership should be obvious from the file path.

---

# 20. Avoid Duplicate Logic

This is a core architectural rule.

### Bad

```ts
// wallet-a.ts
function formatAmount() {}

// wallet-b.ts
function formatAmount() {}

// wallet-c.ts
function formatAmount() {}
```

### Good

```ts
// lib/wallet/amounts.ts

export function formatTokenAmount() {}
```

Then:

```ts
import { formatTokenAmount } from "@/lib/wallet/amounts"
```

### Rule

> Duplicate behavior once if necessary.
> When duplication becomes a pattern, extract the shared abstraction.

Do not create abstractions for hypothetical future duplication.

---

# 21. Generic CRUD

Do NOT create a generic CRUD abstraction merely because several endpoints have:

```text
create
list
get
update
delete
```

Prefer domain-specific functions:

```ts
createApiKey()
rotateApiKey()
disableApiKey()
```

because business behavior matters more than CRUD symmetry.

Only introduce a generic abstraction when the behavior is genuinely identical and proven to be reused.

---

# 22. TypeScript

TypeScript MUST run in strict mode.

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

TypeScript documents `strict` as the master option for stronger type checking and recommends strictness for new codebases.

---

# 23. Never Use `any`

Avoid:

```ts
const data: any = response
```

Prefer:

```ts
const data: unknown = response
```

and narrow it:

```ts
function isPayment(value: unknown): value is Payment {
  if (!value || typeof value !== "object") {
    return false
  }

  return "id" in value && "amount" in value
}
```

Use `any` only when there is a documented, unavoidable third-party boundary.

---

# 24. Prefer Type Inference

Do not annotate everything unnecessarily.

### Bad

```ts
const name: string = user.name
const count: number = items.length
```

### Good

```ts
const name = user.name
const count = items.length
```

Explicitly type:

* function parameters
* public APIs
* service responses
* exported interfaces
* complex return values

---

# 25. `interface` vs `type`

Use `interface` for object contracts that are expected to be extended.

```ts
export interface User {
  id: string
  name: string
}
```

Use `type` for unions, compositions, and aliases.

```ts
export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
```

Do not obsess over the distinction; consistency is more important.

---

# 26. Immutability

Prefer immutable data.

### Good

```ts
const updated = {
  ...user,
  name,
}
```

Avoid unnecessary mutation:

```ts
// ❌
user.name = name
```

Especially avoid mutation of shared objects.

---

# 27. Async Code

Prefer `async/await`.

### Good

```ts
const payment = await createPayment(input)
```

Avoid unnecessary promise chains:

```ts
createPayment(input)
  .then(...)
  .catch(...)
```

Always handle expected failures.

---

# 28. Error Handling

Never silently swallow errors.

### Bad

```ts
try {
  await save()
} catch {
  // nothing
}
```

### Good

```ts
try {
  await save()
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message)
    return
  }

  toast.error("Something went wrong")
}
```

Expected backend errors should be represented by `ApiError`.

---

# 29. API Error Codes

Backend errors should use stable codes.

Example:

```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Insufficient funds"
  }
}
```

UI can map known codes:

```ts
const ERROR_MESSAGES: Record<string, string> = {
  INSUFFICIENT_FUNDS: "Top up your wallet to continue.",
  INVALID_ADDRESS: "The wallet address is invalid.",
}
```

Then:

```ts
const message =
  ERROR_MESSAGES[error.code] ??
  error.message
```

Never depend on human-readable error messages for program logic.

---

# 30. Authentication

Authentication follows:

```text
Access Token
    ↓
Authorization: Bearer <token>
```

Refresh tokens MUST remain in secure `httpOnly` cookies.

Do not expose refresh tokens to client JavaScript.

Services receive the access token when required:

```ts
await getBalance(accessToken)
```

The service layer owns API authentication mechanics.

---

# 31. Secrets

Never expose secrets through:

```env
NEXT_PUBLIC_*
```

`NEXT_PUBLIC_*` values are intentionally client-visible.

### Public

```env
NEXT_PUBLIC_API_URL=
```

### Private

```env
API_SECRET=
DATABASE_URL=
JWT_SECRET=
```

Never commit secrets.

---

# 32. Environment Variables

Use a small, predictable environment surface.

```env
NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
```

Avoid:

```env
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_BACKEND_URL=
NEXT_PUBLIC_SERVER_URL=
NEXT_PUBLIC_API_ENDPOINT=
```

for the same purpose.

One responsibility → one canonical variable.

---

# 33. Configuration

Use `config/` for static configuration.

```ts
// config/app.ts

export const appConfig = {
  name: "ICPay",
  version: "1.0.0",
} as const
```

Wallet:

```ts
// config/wallet.ts

export const walletConfig = {
  maxVaultItems: 5,
  transactionCodeLength: 4,
} as const
```

Avoid scattering magic numbers across components.

---

# 34. Constants

### Bad

```ts
if (files.length > 10) {}
```

### Good

```ts
const MAX_FILES = 10

if (files.length > MAX_FILES) {}
```

For domain constants:

```text
lib/<domain>/constants.ts
```

For application configuration:

```text
config/
```

---

# 35. Imports

Use absolute aliases.

### Good

```ts
import { api } from "@/services/http"
import { formatTokenAmount } from "@/lib/wallet/amounts"
import { Button } from "@/components/ui/button"
```

### Avoid

```ts
import { api } from "../../../../services/http"
```

Configure:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

# 36. Barrel Files

Do not create barrel files everywhere.

Avoid:

```text
components/index.ts
lib/index.ts
services/index.ts
```

unless they provide a real architectural benefit.

Prefer explicit imports:

```ts
import { formatTokenAmount } from "@/lib/wallet/amounts"
```

This keeps dependencies visible.

---

# 37. Naming

Use:

```text
PascalCase       React components/types
camelCase        functions/variables
UPPER_SNAKE_CASE constants only when appropriate
kebab-case       filenames
```

Examples:

```text
WalletBalance
PaymentStatus
getWalletBalance
formatTokenAmount

wallet-balance.tsx
transaction-table.tsx
```

Avoid vague names:

```text
data.ts
helper.ts
misc.ts
common.ts
stuff.ts
manager.ts
processor.ts
```

Name files by responsibility.

---

# 38. Boolean Naming

Boolean values should read naturally.

Good:

```ts
const isLoading = true
const isVerified = false
const hasBalance = true
const canWithdraw = true
```

Avoid:

```ts
const loading = true
const verify = false
const balance = true
```

---

# 39. Event Handler Naming

Use:

```ts
handleSubmit
handleChange
handleDelete
handleConnect
```

Example:

```tsx
function PaymentForm() {
  const handleSubmit = async () => {
    // ...
  }

  return (
    <form onSubmit={handleSubmit}>
      ...
    </form>
  )
}
```

---

# 40. Forms

Keep form UI separate from business/API implementation.

```text
components/payments/
├── payment-form.tsx
└── payment-preview.tsx

services/payments/
└── payments.ts

lib/payments/
└── validation.ts
```

Flow:

```text
Form
 ↓
validation
 ↓
service
 ↓
API
```

---

# 41. Validation

Validation should happen before API requests.

Pure validation:

```ts
// lib/profile/username.ts

export function isValidUsername(value: string): boolean {
  return /^[a-z0-9_]{3,32}$/.test(value)
}
```

Then:

```ts
if (!isValidUsername(username)) {
  throw new Error("Invalid username")
}
```

Use the appropriate schema validation library when validation becomes complex.

---

# 42. Data Fetching

Do not duplicate data fetching logic.

### Bad

```tsx
// component A
fetch("/wallet")

// component B
fetch("/wallet")

// component C
fetch("/wallet")
```

### Good

```text
services/wallet/wallet.ts
        ↓
hooks/wallet/use-wallet-data.ts
        ↓
components/wallet/*
```

---

# 43. Caching

Caching strategy must be intentional.

Do not add caching because "it might be faster".

For rapidly changing data such as:

```text
wallet balance
ICP price
transaction status
```

use appropriate client/server refresh behavior.

For immutable data:

```text
token metadata
static configuration
```

cache more aggressively.

Do not cache security-sensitive user-specific data incorrectly.

---

# 44. Loading States

Use route-level and component-level loading states appropriately.

```text
app/
└── wallet/
    ├── page.tsx
    └── loading.tsx
```

For interactive components:

```tsx
<Button disabled={isLoading}>
  {isLoading ? "Sending..." : "Send"}
</Button>
```

Never leave users wondering whether an operation started.

---

# 45. Error Boundaries

Use route-level error boundaries where appropriate:

```text
app/
├── error.tsx
├── not-found.tsx
└── loading.tsx
```

Feature-specific failures should be isolated where possible rather than crashing the entire application.

---

# 46. Accessibility

Every interactive UI MUST be keyboard accessible.

Use semantic HTML:

```tsx
<button>
  Send
</button>
```

not:

```tsx
<div onClick={handleSend}>
  Send
</div>
```

Images require meaningful `alt` text where appropriate.

Inputs require labels.

Do not sacrifice accessibility for visual design.

---

# 47. Performance

Performance optimization must be evidence-driven.

Prefer:

* Server Components
* minimal client JavaScript
* dynamic imports for genuinely heavy client features
* optimized images
* stable component boundaries
* efficient data fetching
* virtualization for very large lists

Avoid premature:

```ts
useMemo()
useCallback()
memo()
```

Use them when they solve a demonstrated problem.

---

# 48. React Memoization

Do not automatically write:

```tsx
const value = useMemo(...)
const callback = useCallback(...)
```

for every component.

First write clear code.

Optimize after identifying:

* expensive computation
* excessive renders
* unstable props
* measurable performance issues

---

# 49. Lists

Use stable keys.

### Good

```tsx
{transactions.map((transaction) => (
  <TransactionRow
    key={transaction.id}
    transaction={transaction}
  />
))}
```

### Avoid

```tsx
key={index}
```

unless the list is genuinely static and order cannot change.

---

# 50. Date and Money Handling

Never use floating-point arithmetic for financial values.

### Bad

```ts
const amount = 0.1 + 0.2
```

### Prefer

```ts
const amount = 10_000n
```

or a decimal-safe representation appropriate to the domain.

For token amounts, preserve integer base units:

```ts
type TokenAmount = bigint
```

Formatting belongs in:

```text
lib/wallet/amounts.ts
```

---

# 51. Blockchain / ICP Data

Do not treat blockchain amounts as JavaScript `number` when precision can be lost.

Prefer:

```ts
bigint
```

Example:

```ts
const balance: bigint = 1_500_000_000n
```

Convert to human-readable values only at the presentation boundary.

---

# 52. URL and Routing Logic

Routing helpers belong in:

```text
lib/routing/
```

Example:

```ts
export function getWalletRoute(username: string): string {
  return `/wallet/${encodeURIComponent(username)}`
}
```

Components should not repeatedly construct complex routes manually.

---

# 53. Browser APIs

Browser-only APIs must stay inside Client Components or client hooks.

Examples:

```ts
window
document
localStorage
navigator
WebRTC
MediaDevices
```

Do not access them during Server Component execution.

---

# 54. WebRTC / Live Features

Keep live infrastructure isolated:

```text
lib/live/
├── session.ts
├── peers.ts
└── rtc.ts

hooks/live/
├── useLiveRoom.ts
├── useLivePeers.ts
└── usePageVisible.ts

components/live/
├── live-room.tsx
├── video-grid.tsx
└── participant.tsx
```

Do not spread WebRTC logic across unrelated components.

---

# 55. Bucket / Upload Features

Use the same boundary:

```text
lib/bucket/
├── pricing.ts
├── files.ts
└── validation.ts

hooks/bucket/
├── useBucket.ts
├── useBucketFilePreview.ts
└── useBucketApiKeys.ts

services/bucket/
├── buckets.ts
└── files.ts

components/bucket/
├── bucket-uploader.tsx
└── bucket-file-list.tsx
```

Each layer has one responsibility.

---

# 56. Testing

Test the highest-value logic first.

Priority:

```text
1. financial calculations
2. authentication
3. permissions
4. wallet/address logic
5. API error handling
6. upload validation
7. critical UI flows
8. pure utilities
```

Pure functions should be easy to test:

```ts
describe("formatTokenAmount", () => {
  it("formats base units", () => {
    expect(
      formatTokenAmount(123_450_000n, 8),
    ).toBe("1.2345")
  })
})
```

---

# 57. Service Tests

Services should test:

* correct endpoint
* method
* request body
* authentication
* response mapping
* error handling

Do not test `fetch` itself.

Test your behavior around it.

---

# 58. No Dead Code

Do not leave:

```ts
// TODO: maybe use this later
```

unused functions, imports, components, or abandoned abstractions.

If code is not required, remove it.

Git is the history.

---

# 59. Comments

Comments should explain **why**, not **what**.

### Bad

```ts
// Increment counter
counter++
```

### Good

```ts
// The backend expects retry attempts to start at 1.
const attempt = retryCount + 1
```

Do not comment obvious code.

---

# 60. Documentation

Document:

* non-obvious architecture
* security constraints
* complex algorithms
* external API assumptions
* important trade-offs

Do not document every function with meaningless comments.

---

# 61. Environment Safety

Never commit:

```text
.env
.env.local
private keys
JWT secrets
API secrets
wallet mnemonics
credentials
```

Only commit:

```text
.env.example
```

Example:

```env
NEXT_PUBLIC_API_URL=
```

---

# 62. Git Standards

Commits should describe intent.

Good:

```text
feat(wallet): add transaction history
fix(bucket): handle expired bucket
refactor(api): centralize HTTP errors
perf(wallet): reduce balance refreshes
docs(frontend): update service architecture
```

Avoid:

```text
update
fix
changes
new
final
test
```

---

# 63. Pull Request Quality Gate

Every PR should answer:

```text
[ ] Does this follow the architecture?
[ ] Is the code strongly typed?
[ ] Is there duplicated logic?
[ ] Can an existing function be reused?
[ ] Is the correct layer being used?
[ ] Are Server Components used where possible?
[ ] Is "use client" actually required?
[ ] Are API calls inside services?
[ ] Are errors handled?
[ ] Are secrets protected?
[ ] Are financial values precision-safe?
[ ] Are tests required?
[ ] Are unnecessary dependencies avoided?
[ ] Is dead code removed?
```

---

# 64. Example: Complete Feature

Suppose we add wallet transactions.

### Structure

```text
services/wallet/wallet.ts
hooks/wallet/use-wallet-transactions.ts
lib/wallet/amounts.ts
components/wallet/transaction-table.tsx
app/(dashboard)/wallet/page.tsx
```

### Service

```ts
// services/wallet/wallet.ts

import { api } from "@/services/http"
import type { WalletTransaction } from "@/services/types"

export async function getTransactions(
  token: string,
): Promise<WalletTransaction[]> {
  return api<WalletTransaction[]>("/wallet/transactions", {
    token,
  })
}
```

### Hook

```ts
// hooks/wallet/use-wallet-transactions.ts

import useSWR from "swr"
import { getTransactions } from "@/services/wallet/wallet"

export function useWalletTransactions(
  token: string | null,
) {
  return useSWR(
    token ? ["wallet-transactions", token] : null,
    ([, accessToken]) => getTransactions(accessToken),
  )
}
```

### Pure logic

```ts
// lib/wallet/amounts.ts

export function formatTokenAmount(
  value: bigint,
  decimals: number,
): string {
  const divisor = 10n ** BigInt(decimals)
  const whole = value / divisor
  const fraction = value % divisor

  if (fraction === 0n) {
    return whole.toString()
  }

  return `${whole}.${fraction
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "")}`
}
```

### Component

```tsx
// components/wallet/transaction-table.tsx

import type { WalletTransaction } from "@/services/types"
import { formatTokenAmount } from "@/lib/wallet/amounts"

type TransactionTableProps = {
  transactions: WalletTransaction[]
}

export function TransactionTable({
  transactions,
}: TransactionTableProps) {
  return (
    <table>
      <tbody>
        {transactions.map((transaction) => (
          <tr key={transaction.id}>
            <td>
              {formatTokenAmount(
                BigInt(transaction.amount),
                transaction.decimals,
              )}
            </td>

            <td>{transaction.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

The responsibilities remain separated:

```text
API
 ↓
service
 ↓
hook
 ↓
component
 ↓
lib formatting
```

---

# 65. Anti-Patterns

The following patterns are prohibited unless there is a documented reason.

### ❌ API calls in components

```ts
fetch("/api/wallet")
```

### ❌ API calls in `lib`

```ts
// lib/wallet.ts
fetch(...)
```

### ❌ Giant hooks

```ts
useWallet.ts // 800 lines
```

### ❌ Giant utility file

```text
lib/utils.ts
```

### ❌ Business logic in UI primitives

```text
components/ui/button.tsx
```

containing wallet/payment behavior.

### ❌ Duplicate formatters

```text
formatAmount()
formatToken()
formatBalance()
formatWalletAmount()
```

when they all solve the same problem.

### ❌ Unnecessary generic abstractions

```text
GenericRepositoryFactory
GenericCrudManager
BaseServiceFactory
```

without a real need.

### ❌ Excessive client components

```tsx
"use client"
```

on entire routes without client requirements.

### ❌ `any`

```ts
const result: any
```

### ❌ Magic numbers

```ts
if (amount > 100000000)
```

### ❌ Secret exposure

```env
NEXT_PUBLIC_JWT_SECRET=
```

---

# 66. Decision Rules

When unsure where code belongs, use this table:

| Question                                | Location      |
| --------------------------------------- | ------------- |
| Is it a route?                          | `app/`        |
| Is it UI?                               | `components/` |
| Does it need React state/lifecycle?     | `hooks/`      |
| Does it call the backend?               | `services/`   |
| Is it pure reusable domain logic?       | `lib/`        |
| Is it static configuration?             | `config/`     |
| Is it globally shared type information? | `types/`      |

The most important question is:

> **What responsibility does this code own?**

Put it where that responsibility belongs.

---

# 67. Scalability Rule

Do not optimize the architecture for today's number of files.

Optimize it for **clear ownership**.

A good architecture allows:

```text
10 features
→ 50 features
→ 100 features
```

without turning into:

```text
components/
  700 files

lib/
  utils.ts

services/
  api.ts
```

Every growing domain should have an obvious home.

---

# 68. The Golden Rule

Before adding code, ask:

```text
1. Does this already exist?
2. Can I reuse it?
3. Which layer owns this responsibility?
4. Does this introduce duplication?
5. Does this need to be client-side?
6. Can this remain pure?
7. Is the abstraction justified?
8. Is the API boundary typed?
9. Will another developer understand this immediately?
10. Is this the simplest scalable solution?
```

If the answer to #10 is no, simplify it.

---

# 69. Definition of A++ Code

A++ code is not code with the most abstractions.

A++ code is:

```text
✓ Correct
✓ Strongly typed
✓ Small
✓ Explicit
✓ Reusable
✓ Testable
✓ Secure
✓ Accessible
✓ Performant
✓ Easy to delete
✓ Easy to modify
✓ Easy to review
✓ Easy to scale
```

The ideal implementation should make the next developer think:

> **"I immediately know where this belongs and why."**

---

# 70. Final Architecture

The final mental model for this project is:

```text
                         NEXT.JS
                            │
                            ▼
                    ┌───────────────┐
                    │     app/      │
                    │ Routes / RSC  │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ components/   │
                    │     UI        │
                    └───────┬───────┘
                            │
                  ┌─────────┴─────────┐
                  ▼                   ▼
              hooks/                lib/
           React/SWR          Pure domain logic
                  │
                  ▼
             services/
             API boundary
                  │
                  ▼
             /api/v1
                  │
                  ▼
              Backend
```

### Non-negotiable boundaries

```text
UI          → components/
React state → hooks/
API         → services/
Logic       → lib/
Config      → config/
Routes      → app/
Types       → services/types.ts or types/
```

**Keep the architecture boring. Keep the code excellent.**

That is the standard.
