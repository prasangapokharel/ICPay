---
name: state-management
description: Server/canister cache, session, and UI state for ICPay mobile. Use when adding hooks, query keys, stores, or deciding where state lives.
---

# State Management

Three kinds of state. Do not mix them.

| Kind | Lives in | Examples |
|---|---|---|
| Canister / ledger data | TanStack Query (or SWR equivalent) | balances, dashboard, transactions, quotes |
| Session | auth feature store + expo-secure-store | II identity, actor, `isNew` |
| UI | `useState` or a tiny feature store | drawers, selected token, form draft |

Do not put server data in Zustand. Do not put identity in AsyncStorage.

---

## Query cache

Mirror the web `use-wallet-data` keys so behavior stays comparable.

- Queries: `getDashboard`, `getTransactions`, `getDepositAddress`, `getUser`, `icrc1_balance_of`, ICPSwap `quote`.
- Mutations: `login`, `transfer*`, `withdraw`, `syncDeposits`, `executeSwap`, `purchaseUsername`.
- Default page size 20, max 50.

Never poll an update call. Never refetch `getDashboard` on every tab focus — refresh `icrc1_balance_of` instead.

`getSettings` is implemented as an update. Cache on device. Do not refetch on every focus.

Swap quotes must use ICPSwap factory/pool queries. Never backend `getSwapQuote`.

After a successful transfer, swap, or withdraw, patch holdings cache then revalidate the affected query keys.

Offline: show last cached holdings. Never invent a balance.

---

## Session

1. `AuthClient.login({ identityProvider, derivationOrigin })`
2. `actor.login()` — creates or loads the user
3. `actor.register(username)` only when `isNew` and the name is free (5+ chars)
4. Persist the identity delegation in expo-secure-store
5. Reuse one `HttpAgent` per session

NFID is a different principal and a different wallet. If offered, warn before connecting.

---

## UI state

Keep state close to where it is used.

A feature store is allowed when two screens in the same feature share it (swap token pair, transfer recipient). Do not create a global app store.

Never store derived values in state when they can be calculated.
