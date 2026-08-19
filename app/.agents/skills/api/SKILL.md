---
name: api
description: ICPay canister, ledger, and ICPSwap client rules for the React Native app. Use when adding feature APIs, agent/actor code, queries, or updates.
---

# API Standards

ICPay has no REST backend. The wallet is Motoko canister `6vbhm-nqaaa-aaaan-q6muq-cai`.

Every method, kind (query vs update), and screen mapping is in `docs/app/react-native/appallapi.json`. Do not invent endpoints.

Keep HTTP/IC implementation centralized.

```text
services/api/
├── client.ts      # one HttpAgent, one actor factory
├── errors.ts      # { ok, err } parsing
└── types.ts
```

Feature-specific methods stay inside the feature.

```text
features/transfer/api/transfer-api.ts
features/deposit/api/deposit-api.ts
```

Never create a separate agent or actor for every feature.

```ts
import { api } from '@/services/api/client';

export const transferApi = {
  byUsername: (ledgerId: string, username: string, amount: bigint, memo?: string) =>
    api.update('transferByUsername', [ledgerId, username, amount, memo]),
};
```

---

## Query vs update

Queries are free and fast. Updates cost cycles and take a consensus round.

Prefer query: `getDashboard`, `getTransactions`, `getDepositAddress`, `getUser`, `checkUsername`, `searchUsers`, `resolveUsername`, `isLedgerSupported`, token reads, most bucket reads, `icrc1_balance_of`, ICPSwap `getPool` + `quote`.

Must update: `login`, `register`, `transfer*`, `withdraw`, `syncDeposits`, `executeSwap`, `recoverFailedSwapInput`, `purchaseUsername`, `launchToken`, bucket writes, `exportUserAnalytics`, `updateSettings`.

Quirks:

- `getSettings` is an update. Cache on device.
- Do not call backend `getSwapQuote` on mobile.
- Never change `derivationOrigin`.

Do not put an update in a polling loop or a `useEffect` that reruns on keystroke.

---

## External canisters

Ledger reads (`icrc1_balance_of`, `icrc1_fee`, `icrc1_metadata`) are always queries. Parallelize on wallet load.

ICPSwap quotes: factory `4mmnk-kiaaa-aaaag-qbllq-cai` → `getPool` then pool `quote`. Service fee is 0.1 ICP (10_000_000 e8s).

ICP price for fiat display is HTTPS, not on-chain.

---

## Auth on the wire

Internet Identity attaches the identity to the agent. Features call the API abstraction. They do not attach tokens by hand.

Public (no II): `searchUsers`, `resolveUsername`, `checkUsername`, `getVerifiedTier`, username pricing, token catalog, health.

Everything in the authenticated app shell requires an II session.

---

## Errors

Canister results are `{ ok: T } | { err: text }`. Parse once in `services/api/errors.ts`. Screens receive typed errors. Do not create a different error shape per feature.
