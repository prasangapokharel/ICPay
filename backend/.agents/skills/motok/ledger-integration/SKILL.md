---
name: ledger-integration
description: >-
  ICRC-1 and legacy ICP ledger integration — custodial subaccounts, deposit
  sync, transfers, fees, and double-credit hazards. Use when writing canister
  code that holds or moves ICP, calls icrc1_transfer, derives deposit
  addresses, or reconciles balances.
---

# Ledger Integration

Money code. A bug here loses funds, and the ledger is not reversible.

## Custodial account model

For a canister that must *spend* user funds, the account owner is the
**canister**, with a per-user subaccount for attribution:

```motoko
public func custodialAccount(custodian : Principal, user : Principal) : Account {
  { owner = custodian; subaccount = ?Subaccount.fromPrincipal(user) };
};
```

Owner = user means the canister cannot move the funds. Owner = canister with no
subaccount means every user's funds are commingled and unattributable.

Consequence worth internalizing: **funds live in a principal-derived subaccount,
independent of any user record.** A balance can therefore display correctly for
a user who has no record in your state — the balance reads the ledger, while
operations read your map. If those two ever disagree, expect "user not found"
errors while a balance shows on screen.

## Two address formats

The ICP ledger has both a modern and a legacy interface, and funds can arrive
by either:

| Form | Interface | Representation |
|---|---|---|
| ICRC-1 account | `icrc1_transfer` | `{ owner; subaccount }` |
| Account identifier | legacy `transfer` | 32-byte hex |

`Principal.toLedgerAccount(owner, subaccount)` derives the legacy identifier
from an ICRC-1 account. **Both forms address the same account** — verified by
minting to each and reading one balance. Expose both to the frontend, and
resolve incoming funds on both paths, or deposits made the legacy way become
invisible.

## Balance is a query — exploit it

`icrc1_balance_of` is declared `shared query`. Calling it from an update makes
it a billed inter-canister call (~40M cycles, often the single largest cost in
a read path). Calling it from the frontend costs nothing.

Keep it in an update only when a fund-moving decision depends on it, where
consensus-backed certification is the point. For display, let the client read
the ledger directly. See `cycles-and-cost`.

Note a canister method cannot be a `composite query` calling the ledger:
composite queries cannot cross subnets and the ICP ledger is on the NNS subnet.

## Deposit sync and the double-credit hazard

Deposits arrive with no callback — the ledger cannot notify you. Reconciliation
compares ledger truth against what you have recorded:

```
credited = ledgerBalance − totalRecordedDeposits
```

This formula is the source of the most dangerous class of bug in a custodial
wallet. **Any transaction type that the recorded-deposits total does not count,
but which moved funds into the account, gets credited a second time.**

So when an internal transfer credits a recipient, the recipient's row must be
typed so that the reconciliation total *includes* it — in practice, type it as
a deposit rather than a transfer. Verify after every change to transfer logic:
run sync immediately after an internal transfer and assert it reports no new
deposits and the balance is unchanged.

Also guard self-transfers, which otherwise write phantom rows.

## Transaction records

One ledger movement between two local users concerns **two** users. A single
row tagged with the sender's id makes the recipient's history genuinely empty.
Write a row for each side, and resolve whether a destination is a local user on
both the subaccount path and the account-identifier path.

Budget for this: every internal transfer writes 2 rows, so row-count growth
projections must double.

## Fees

The ledger fee is deducted on top of the amount. Read it rather than
hardcoding, decide explicitly whether sender or recipient absorbs it, and
validate `amount + fee <= balance` before attempting — not `amount <= balance`.

## Failure handling

An `icrc1_transfer` await can fail after the ledger has already moved funds.
Write the record as pending *before* the call, then mark completed with the
returned block index or failed on error. Never treat an error as "nothing
happened" — verify against the ledger.

Return the block index to the client. The ICP dashboard accepts it and 302s to
the hash form of the URL.

## Testing

**No real ICP is required.** A local ledger with a minter identity covers
deposit, sync, transfer, withdraw and fees end-to-end. Mint with
`dfx --identity minter`; both `transfer` and `icrc1_transfer` reach the same
account.

Always test recipient crediting with a **second identity**. Single-identity
tests cannot catch the missing-recipient-row bug, since sender and recipient
are the same user.

## Rules

- Use only official ledger interfaces. Never reimplement account derivation
  guessed from a spec.
- Never store private keys or seed phrases in a canister.
- Verify `caller` on every fund-moving update.
- Validate the amount against balance plus fee, server-side, always.
