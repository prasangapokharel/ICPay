---
name: testing
description: Behavior tests for the ICPay React Native app — auth, transfers, validation, query vs update. Use when adding or changing tests.
---

# Testing

Test business behavior, not implementation details.

Prioritize:

1. Critical business logic
2. API behavior
3. Authentication
4. Payments
5. Important user flows
6. Complex UI behavior

Keep tests close to the feature when practical.

```text
features/transfer/
├── components/
├── api/
├── transfer.test.ts
└── ...
```

Cross-cutting tests live in `tests/`.

Use descriptive names:

```ts
it('creates a payment when the request is valid', async () => {});
```

Do not test framework behavior.

---

## ICPay cases

Must cover:

- Amount parsing to e8s, fee subtraction, reject over-balance
- Recipient parsing: username vs principal vs account vs account-id
- `{ ok, err }` mapping at the API boundary
- Query functions never call `update`
- Swap max-input formula and the ban on `getSwapQuote`
- Username length tiers (free claim 5+)
- Auth: unauthenticated app shell redirects to login
- `derivationOrigin` is the asset canister origin (constant test)

Mock the actor. Do not hit mainnet in tests. Cap any live replica loop at 10–30 calls.
