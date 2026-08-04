---
name: testing-motoko
description: >-
  Testing Motoko canisters — where tests live, how to run them, and what must
  be covered. Use when writing or running canister tests, adding a test for a
  new service, or verifying upgrade persistence.
---

# Testing Motoko

## Location and runner

```
backend/testing/{feature-area}/*.test.mo
```

Run with:

```bash
bash scripts/run-tests.sh
```

**Not `npm test`. Not `mops test`.** `mops test` looks in `test/`, and these
tests live in `testing/` — pointing the wrong runner at them reports zero tests
and exits clean, which reads as success. Verify the pass count is what you
expect, not just the exit code.

Mirror the source layout: `src/services/Foo.mo` → `testing/services/Foo.test.mo`.

## Required coverage per service

- Happy path
- Invalid input, boundary values, empty and null
- Duplicate / conflicting operations
- Unauthorized caller, and the anonymous principal
- **Upgrade persistence** — see below

## Upgrade persistence is not optional

State loss on upgrade is a critical failure, and it is silent: the code
compiles, tests pass, and data vanishes only on deploy. This project shipped
exactly that bug — storage declared `transient` inside a `persistent actor`,
which opts *out* of orthogonal persistence and destroyed every user, balance
and transaction on each upgrade.

Test it as a real cycle, not by inspection:

```bash
dfx canister call backend createThing '(...)'
dfx deploy backend            # upgrade
dfx canister call backend getThing   # must NOT be (null)
```

Rule of thumb: domain state persists; only rebuilt-on-startup values
(service records, caches, rate limiters, timer ids) may be `transient`.

## Multi-identity tests

Any feature involving two parties must be tested with a **second identity**:

```bash
dfx identity new bobby
dfx canister call --identity bobby backend receiveThing '(...)'
```

Single-identity tests cannot detect a missing counterparty record, because
sender and recipient are the same user. This is how the missing
recipient-transaction bug survived to production.

## Cost-sensitive testing

**Cap test loops at ~10–30 calls.** Update calls burn real cycles; a large loop
against mainnet is a real expense. Never write an unbounded loop in a test.

## Output discipline

Never stream full logs:

```bash
bash scripts/run-tests.sh 2>&1 | tail -25; echo "EXIT=${PIPESTATUS[0]}"
```

Use `${PIPESTATUS[0]}` for the real exit code. `cmd | tail -N && echo OK`
reports the exit status of `tail`, which masks every failure.

## Rules

- Never write a test that cannot fail.
- Never weaken or delete an existing test to make a change pass.
- Flag flaky tests; do not add retries.
- Assert on values, not just absence of error.
