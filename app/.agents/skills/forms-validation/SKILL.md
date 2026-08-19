---
name: forms-validation
description: Schema-based form validation for ICPay mobile. Use when building login, transfer, withdraw, swap, username, or launch forms.
---

# Forms and Validation

Use schema-based validation (Zod or the project validator).

Validate user input at the boundary.

Keep schemas inside the feature:

```text
features/auth/schemas/
features/transfer/schemas/
features/swap/schemas/
```

Do not duplicate validation rules between components.

Bad: `if (email.length === 0) {}` in five different components.

Create one schema and reuse it.

Form UI should handle input, errors, loading, and submission.

Business rules belong outside the visual component.

---

## ICPay forms

Treat QR payloads, deep links, usernames, principals, and account IDs as untrusted input.

- Transfer recipient: `@username`, principal, ICRC-1 account, or ICP account-id. Resolve `@name` with `resolveUsername` (query).
- Amounts: parse to bigint e8s. Reject empty, NaN, more decimals than the ledger, and amount below fee.
- Username: pricing tiers from `appallapi.json`. Free claim is 5+ characters.
- Swap: max input is `balance - 3 * ledgerFee - serviceDebit` when ICP is the input token. Default slippage 100 bps.
- Withdraw: destination must be an ICRC-1 account. This is self-custody exit.

Disable submit while the mutation is in flight. Show the canister `err` text, not a generic failure, when the backend returns one.
