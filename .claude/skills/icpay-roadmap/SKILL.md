---
name: icpay-roadmap
description: What ICPay has shipped, what is next, and what was deliberately refused. Read before proposing or building a feature, so work lands in phase order and rejected ideas are not re-proposed.
---

# ICPay roadmap

Source of truth: `docs/roadmap/roadmap.md`. This is a summary — read that file
before planning real work, and treat it as authoritative if the two disagree.

## Shipped

**Phase 0 — Custody foundation.** Per-user subaccounts derived from the caller
principal. Strict API→Service→Repository→Storage layering. 24-test suite.

**Phase 1 — Username as the address.** Free claim for 5–8 characters; paid
purchase for 1–4 (10 / 5 / 2 / 1 ICP by length). Usernames are permanent, with
aliases. Send by username, principal, account, or account-ID. Public profiles.
Unauthenticated directory search.

**Phase 2 — Multi-token visibility.** Discovers every SNS token from SNS-W plus
five chain-key ledgers (ckBTC, ckETH, ckUSDC, ckUSDT, ICP), showing balances via
`icrc1_balance_of`. Read-only *at the time this phase closed* — sending arrived
in Phase 3.

Also shipped outside the phase numbering: 10-language UI, fiat display, avatar
profile links, settings drawer with theme switching.

**Phase 3 — Multi-token transfers.** `LedgerService.mo` takes a `ledgerId` on
every call, so one path serves any ICRC-1. Fees read live via `icrc1_fee`, never
cached. A storage allowlist gates which ledgers can be sent to.

**Phase 4 — Token creation.** `launchToken` charges 5 ICP, creates a canister,
installs the sealed reference ledger wasm and hands off control. Three things
differ from what the roadmap originally specified, and the deviations are
deliberate — do not "fix" them back:

- **ICPay pays the cycles**, not the creator. Requiring the creator to supply
  cycles would put dfx back in the flow.
- **Nobody is the controller** — every launch sets `controllers = []`, so the
  ledger can never be upgraded by anyone, creator included. The freezing
  threshold is a year to compensate, since there is no reinstall after deletion.
- **Decimals (8) and transfer fee (10 000 e8s) are fixed**, not form fields.

`TOKEN_MINTING_PRINCIPAL = "aaaaa-aa"` (`Config.mo:36`) is what makes a launched
token's supply genuinely fixed: the management canister has no caller, and in
ICRC-1 a transfer *from* the minting account is what mints. **ICPAY itself
launched before that fix**, so its supply is still mintable and its ledger
cannot be upgraded to change it — never claim ICPAY has a fixed supply.

## Next

**Phase 5 — Liquidity and trading.** ICRC-2 approve + `transfer_from`, swap
quotes with slippage, LP positions. The roadmap's recommendation is to
**integrate an existing DEX** (ICPSwap, Sonic, KongSwap) rather than build an
AMM. Do not propose building one. **This is the next thing to build** — prefer
it over starting a later phase.

**Phase 6 — Decentralizing custody.** Move the controller to an SNS- or
NNS-controlled canister. Reproducible Docker builds, third-party audit,
`SECURITY.md` with a private disclosure channel, published incident policy.
Partially mitigated already: both canisters now have redundant recovery
controllers, so key *loss* no longer means losing the canister. Key *theft* is
still unmitigated — that is what this phase is for. See `docs/security/guide.md`.

**Phase 7 — Merchants and payments.** Merchant accounts with a verification
badge; signed, expiring, single-use payment requests; checkout page; webhook
API; refunds as a first-class operation; settlement reports. Depends on Phase 3
for stablecoins and Phase 6 for security.

**Phase 8 — Shopping.** Merchant directory, product listings, order history,
optional escrow with a dispute window. The most speculative item on the list.

## Deliberately refused

Do not propose these. Each was considered and rejected with a reason:

| Not doing | Why |
|---|---|
| Non-custodial mode | A different product. Retrofitting means rebuilding every flow. |
| Native mobile apps | The PWA covers it. |
| Cross-chain bridges | Chain-key tokens make them redundant, and bridges are the most-exploited component in the industry. |
| NFTs | No connection to sending money by username. |
| Fiat on-ramp | Needs a licensed partner. Revisit alongside Phase 7 compliance work. |

## Continuous concerns

**Performance.** `getById`, `completeTx`, and `failTx` scan the global
transaction list linearly. Fine at current volume, quadratic at scale — a known
future problem, not a bug to fix opportunistically.

**Cycles.** Watch `npm run ci cycles:balance`. At zero the canister is deleted.

**Tests.** 24 files. Every new endpoint adds a test in the same commit.

**Docs.** `docs/command/README.md` is the operations reference and is meant to
stay true. Update it when a command changes.

## Where things are documented

| Path | Contents |
|---|---|
| `docs/roadmap/roadmap.md` | The authoritative roadmap |
| `docs/command/README.md` | Operations reference — every `npm run ci` command |
| `docs/workflow.md` | Branch workflow |
| `docs/architecture/meramaid/` | Mermaid diagrams: system, backend, frontend, flows, data |
| `docs/costing/here.md` | Cycle cost and burn analysis |
| `docs/language/add/readme.md` | How to add a locale |
| `docs/launch/guide.md` | Launch playbook |
| `docs/demo/` | Screenshots used by the README |
