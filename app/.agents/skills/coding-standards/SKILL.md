---
name: coding-standards
description: Clean TypeScript naming, imports, errors, and file rules for the ICPay React Native app. Use when writing or reviewing any mobile TypeScript or TSX.
---

# Coding Standards

## General

Write clean, predictable, maintainable TypeScript.

Prefer simple code over clever code.

Do not duplicate logic.

Reuse existing utilities, services, hooks, components, and types before creating new ones.

Do not create abstractions without a real reuse case.

Keep functions small and focused.

Use descriptive names.

Avoid unnecessary comments. Code should explain itself.

Do not leave dead code, unused imports, unused variables, or commented-out implementations.

Keep files under ~300 lines. Split a screen into feature components when it grows.

---

## Naming

Use camelCase for variables, functions, parameters, hooks, and object properties.

```ts
const userName = 'alice';

function getUserProfile() {}

const isAuthenticated = true;
```

Use PascalCase for React components, classes, types, interfaces, and enums.

```tsx
function UserProfile() {}

type UserProfileProps = {};

interface ApiResponse {}

class ApiClient {}
```

Use UPPER_SNAKE_CASE only for true compile-time constants.

```ts
const MAX_FILE_SIZE = 10 * 1024 * 1024;
```

Do not use:

```ts
const User_Name = 'alice';
const USER_NAME = 'alice';
function GetUser() {}
```

---

## Files

Use kebab-case for filenames.

```text
user-profile.tsx
payment-card.tsx
use-auth.ts
api-client.ts
```

React component names remain PascalCase inside the file.

```tsx
export function PaymentCard() {}
```

---

## Booleans

Use meaningful prefixes: `isLoading`, `isAuthenticated`, `isVisible`, `hasPermission`, `canSubmit`, `shouldRetry`.

Avoid bare names: `loading`, `auth`, `visible`, `permission`.

---

## Functions

Use verbs: `getUser()`, `createPayment()`, `updateProfile()`, `deleteAccount()`, `validateEmail()`, `formatCurrency()`.

Avoid vague names: `data()`, `handle()`, `process()`, `doSomething()` unless the context makes the meaning obvious.

Prefer explicit return types for exported functions, API functions, hooks, and reusable utilities.

```ts
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
```

---

## Imports

Keep imports organized.

1. React / React Native
2. External packages
3. Internal aliases (`@/`)
4. Relative imports (same feature only)

Prefer aliases:

```ts
import { Button } from '@/components/ui/button';
import { transferApi } from '@/features/transfer/api/transfer-api';
```

Avoid deep relative imports:

```ts
import { Button } from '../../../components/ui/button';
```

---

## TypeScript

Use strict TypeScript. Do not use `any` unless there is a documented unavoidable reason.

Prefer `unknown` over `any`. Define API boundaries explicitly. Avoid unnecessary type assertions (`user as User`). Prefer runtime validation when external data is involved.

---

## Error handling

Never silently swallow errors.

```ts
try {
  await savePayment();
} catch (error) {
  logger.error(error);
  throw error;
}
```

---

## Duplication

Never copy the same business logic into multiple files. One reusable implementation per feature:

```text
features/transfer/
├── api/
├── schemas/
├── services/
└── components/
```

---

## Exports

Prefer named exports.

```ts
export function PaymentCard() {}
```

Avoid default exports except where required by framework conventions. Expo Router route files may use default exports when required.
