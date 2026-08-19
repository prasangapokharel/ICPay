---
name: typescript
description: Strict TypeScript for the ICPay React Native app — no any, discriminated unions, explicit nullability, separate API types. Use when adding types or parsing canister data.
---

# TypeScript Standards

Use strict TypeScript.

## Never use any

```ts
function parse(data: unknown) {}
```

Then narrow the type.

---

## Types

Prefer type aliases for data structures.

```ts
type User = {
  id: string;
  username: string;
};
```

Use interfaces when extension or implementation semantics are actually useful.

---

## Unions

Prefer discriminated unions for state.

```ts
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: Error };
```

Avoid boolean combinations that create impossible states (`isLoading` + `isError` + `isSuccess`).

---

## Nullability

Handle null and undefined explicitly. Do not blindly use `user!.name`. Prefer `user?.name` or explicit validation.

---

## Constants

Extract repeated values. Do not scatter magic numbers.

```ts
const PAYMENT_TIMEOUT_MS = 10_000;
```

ICPay amounts are `bigint` e8s (or e6 for ckUSDC/ckUSDT). Do not store token amounts as `number` except for display after formatting.

---

## API types

Keep canister/API types separate from UI-specific types when necessary.

```text
features/transfer/
├── api/
│   ├── transfer-api.ts
│   └── transfer.types.ts
├── types.ts
└── components/
```

Canister results are `{ ok: T } | { err: text }`. Parse at the API boundary. Screens receive already-narrowed types.

Shared shapes (`UserPublic`, `DashboardData`, `TransactionPublic`, `ICRC1Account`) must match `docs/app/react-native/appallapi.json` → `sharedTypes`.
