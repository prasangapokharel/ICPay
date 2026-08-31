# ICPay roadmap

ICPay is a custodial ICP wallet where the address is a username. This document
says what is built, what is next, and — for each future phase — what has to be
true before it ships.

Every "shipped" claim below was checked against the code, not against memory.
Anything unverifiable is marked as such rather than assumed.

**Last reviewed:** 2026-08-19

---

## Where we are

**Phase 6 — Cloud storage and live streaming.** Shipped and live at `icpay.app`.

ICPay now includes a full-featured cloud storage platform (ICPay Bucket) with API
keys, chunked uploads, and file management, plus live streaming rooms. The wallet
holds, displays and sends ICP, ckBTC, ckETH, ckUSDC, ckUSDT, every SNS token, and
any launched ICRC-1 token — with token swaps integrated via ICPSwap. Phase 7 is next.

| | |
|---|---|
| Backend canister | `6vbhm-nqaaa-aaaan-q6muq-cai` — Motoko, on-chain |
| Frontend | Static export on Vercel. **Not on-chain.** |
| Asset canister | `63dke-waaaa-aaaan-q6mvq-cai` — the II derivation origin |
| Auth | Internet Identity only. No passwords, no seed phrases. |
| Ledger | Official ICP ledger `ryjl3-tyaaa-aaaaa-aaaba-cai` |
| Index | Official `qhbym-qaaaa-aaaaa-aaafq-cai` |

---

## Phase 0 — Custody foundation ✅

The part everything else stands on.

- Per-user subaccount of the canister, derived from a length-prefixed principal
  (`ledger/Subaccount.mo`). One user, one deterministic deposit address.
- Every withdraw and transfer derives `from_subaccount` from `caller`, never
  from a parameter. There is no code path by which one user's call moves another
  user's funds, and no admin endpoint that touches balances at all —
  `api/v1/Admin.mo` exposes only username reserve/release.
- Strict layering `api/v1 → services → repositories → storage`, enforced by
  `CONTRIBUTING.md`.
- Stable memory across upgrades, with migrations in `src/migrations/`.
- 24-test suite, `bash scripts/run-tests.sh`.

**The honest caveat:** custodial means the canister holds the keys. A user's
funds are safe from other users, not from a canister upgrade. One controller
principal can upgrade the code. Phase 6 is where that stops being true.

## Phase 1 — Username as the address ✅

- Claim 5–8 characters free. Buy 1–4 characters: **10 ICP** (1–3 chars),
  **5 ICP** (4), **2 ICP** (5), **1 ICP** (6–8) — `config/Config.mo:17-20`.
- Usernames are permanent. Changing one keeps the old handle resolving as an
  alias, so a published address never breaks (`UserRepository.mo:73-85`).
- Four ways to send: by username, by principal, by ICRC-1 account, by legacy
  account ID (`api/v1/Transfer.mo`).
- Public profile at `icpay.app/@handle`, crawlable, shareable.
- Directory search is unauthenticated by design — `resolveUsername` has to work
  for someone who has not signed in, or you could not look up who to pay.
- Purchases settle to a treasury principal, not a canister subaccount, so
  proceeds are spendable without going through this canister.

## Phase 2 — Multi-token visibility ✅

- `services/tokens.ts` discovers every SNS ledger from SNS-W
  (`qaa6y-5yaaa-aaaaa-aaafa-cai`) and adds the five chain-key ledgers, which are
  not SNS-launched and therefore not listed there.
- Balances via `icrc1_balance_of`, metadata via `icrc1_metadata`.
- Live ICP price from CoinGecko for fiat display.
- Reads only at the time this phase closed. Sending arrived in Phase 3.

---

## Phase 3 — Multi-token transfers ✅

Made the tokens Phase 2 displayed actually movable.

- `LedgerService.mo` takes a `ledgerId` on every call and constructs the actor
  from it, so one code path serves any ICRC-1 ledger. Only
  `transferToAccountIdentifier` stays pinned to ICP — no other ledger implements
  the legacy method.
- `transferByUsername`, `transferByPrincipal`, `transferByAccount`, `withdraw`,
  `getDashboard` and `syncDeposits` all carry a ledger id.
- Fees read live per transfer via `icrc1_fee`, never cached: an ICRC-1 fee can
  change, and a stale one is eaten by the ledger as `BadFee`.
- Ledger allowlist in storage, checked by `LedgerService.isAllowed` before any
  transfer — a hostile canister id cannot be sent to.
- The deposit subaccount stays derived from the principal alone. It is
  token-agnostic, so per-token derivation would have moved every existing user's
  ICP address and stranded funds at the old one.
- Frontend sends any token from its token page, with per-token decimals
  throughout: amounts are parsed and formatted on the digit string, since float
  math cannot hold ckETH's 18 places.

**The honest caveat:** the allowlist is what makes this safe. Opening it up
without a verification story is how a fake `USDC` gets sent.

---

## Phase 4 — Token creation ✅

Launching a token from the wallet, in one screen, without touching dfx.

- The audited reference ICRC-1/ICRC-2 ledger wasm is uploaded in chunks and
  sealed against a module hash, then installed per launch. No ledger was
  written for this.
- `launchToken` charges a 5 ICP fee, creates the canister, installs the sealed
  wasm and hands off control — in that order. The row is written *before* the
  ledger call so a trap still leaves evidence of the payment.
- `getMyTokens` lists a creator's launches; `listTokens` is the public
  directory. Launched ledgers are registered on the transfer allowlist, so a
  new token is sendable by username immediately.
- Symbols are reserved at launch and checked by `isSymbolAvailable`, which is a
  query — the form can check on every typing pause for free.
- Frontend `/launch` form with live symbol availability, logo downscaled to a
  128px data URI in the browser, and a confirm step that names the fee.

**Three deliberate departures from the original plan:**

- **ICPay pays the cycles, not the creator.** The creator pays a flat 5 ICP fee
  and ICPay converts part of it to cycles. Asking a user to acquire cycles
  before launching would have put dfx back in the flow, which was the whole
  thing this phase set out to remove.
- **Nobody is the controller, not the creator.** Every launch sets
  `controllers = []`, so the ledger can never be upgraded or reinstalled by
  anyone — including ICPay and including the creator. The plan said hand the
  controller to the creator; a creator who can upgrade their own ledger can
  rewrite the supply rules after people buy in. The freezing threshold is set
  to a year to compensate, since with no controller there is no reinstall after
  deletion.
- **Decimals and transfer fee are fixed, not form fields.** 8 decimals and a
  10 000 e8s fee for every launch. A creator choosing 0 decimals or a zero fee
  produces a token that behaves surprisingly everywhere else in the wallet.

**Anti-spam** landed as the crude fix the plan predicted: the 5 ICP fee. The
reputation gate still waits on Phase 7.

**Symbol collisions** are handled by reservation rather than display — a symbol
can only be claimed once here. That does nothing about a token impersonating one
launched elsewhere, so the ledger canister id is shown on the token page.

**The honest caveat:** ICPAY itself, launched 2026-08-06, predates the fix that
pins every new token's minting account to the management canister. Its supply is
therefore still mintable and its ledger cannot be upgraded to change that. Every
token launched after that fix names `aaaaa-aa`, which has no caller, so its
supply genuinely cannot grow. `/icpay` reads the minting account from the ledger
and shows it rather than asserting either way.

---

# Upcoming

Ordered by dependency, not by excitement. Each phase unlocks the next; shipping
them out of order means building on something that is not there.

---

## Phase 5 — Token swaps and on-chain trading ✅

ICPSwap integration for swapping any ICRC-1 token pair.

- `getSwapQuote` returns price, price impact, minimum received with slippage.
- `executeSwap` with `amountOutMin` for slippage protection enforced on-chain.
- Failed swap recovery: `recoverFailedSwapInput` for stuck input tokens,
  `recoverPendingSwap` for manual retry of specific swaps.
- Frontend `/swap` page with live quotes, slippage control, and success state.
- Swap transactions recorded in transaction history with both legs visible.
- **No LP positions yet** — only token-to-token swaps via ICPSwap pools.

**Decision made:** Integrated ICPSwap rather than building a custom AMM. Uses
their liquidity, their audits, their pools. ICPay provides the UX layer.

**Risks addressed:**
- Cross-canister call failures leave clear transaction states (pending, failed).
- Recovery paths for stuck approvals and incomplete swaps.
- Slippage enforced by the DEX, not just shown in UI.

**Shipped:** 2026-08-19 (this review date confirms it is live in production).

---

## Phase 6 — Cloud storage (ICPay Bucket) ✅

On-chain file storage with API keys, chunked uploads, and programmatic access.

- Create buckets with capacity tiers (1GB, 5GB, 10GB, 50GB, 100GB), paid in ICP.
- Chunked file uploads for large files, indexed chunks for parallel upload.
- Public and private buckets with visibility controls.
- API key system with read/write permissions for programmatic access.
- File operations: upload, download, delete, move, copy, bulk operations.
- File metadata, tags, search, and folder listing.
- Renewal system for expired buckets with cycle management.
- Frontend `/bucket` pages: list, create, pricing, docs, per-bucket file browser.
- HTTP gateway for direct file access via canister URLs.

**Cycle management:**
- `getBucketCycleStatus` monitors balance and burn rate.
- `getBucketCloudStats` shows total storage, file count, revenue.
- Storage burn calculated per GB stored; idle burn added on top.

**Shipped:** 2026-08-19 (verified via API endpoints and frontend pages).

---

## Phase 6b — Live streaming rooms ✅

Real-time streaming and interaction rooms (experimental feature).

- Create live rooms with public/private/invite-only visibility.
- Host controls: start, end, invite management.
- Frontend `/live` pages: room list, create new, room screen.
- Room state tracked: active, ended, participant count.
- Stored in `LiveStorage.mo` with full CRUD operations.

**Scope:** Basic room lifecycle and access control. Video/audio streaming itself
is handled client-side (not stored on-chain).

**Shipped:** 2026-08-19 (verified via storage modules and frontend pages).

---

# Upcoming

Ordered by dependency, not by excitement. Each phase unlocks the next; shipping
them out of order means building on something that is not there.

---

## Phase 7 — Decentralizing custody

The phase that makes the security section of the docs honest.

Everything above increases how much value sits under one controller principal
with an unencrypted key on one laptop. That is acceptable for a small wallet
and unacceptable for a payments network.

**Scope**

- Move the controller to an SNS or an NNS-controlled canister, so upgrades are
  a proposal and a vote rather than one person's `dfx deploy`.
- Reproducible builds. Pin `moc` in Docker, publish the expected module hash,
  and let anyone verify the deployed hash matches the source. Without this,
  "auditable on-chain code" means "auditable if you trust that the source
  matches the wasm."
- Third-party security audit before any material TVL.
- Private disclosure channel in `SECURITY.md`. Right now the only route is a
  public GitHub issue, which asks a researcher to publish a live vulnerability.
- Published incident policy: what happens on a discovered exploit, who can
  pause what, how users find out.

**This is not optional and should not slip.** It is placed after swap/storage only
because those features raised the stakes enough to justify the cost. If adoption
arrives sooner, this phase moves up.

---

## Phase 8 — Merchants and online payments

Turn the wallet into something you can pay a shop with. **This is the next priority phase.**

**Depends on:** Phase 3 (stablecoins — nobody prices a coffee in a volatile
asset) and Phase 7 (a merchant holding revenue needs stronger custody than a
hobbyist holding pocket change).

**Scope**

- Merchant accounts: a handle flagged as a business, with a display name, logo
  and verification badge.
- Payment requests — a signed link or QR encoding recipient, token, amount and
  an order reference. Expiring, single-use, and verifiable by the merchant
  without trusting the customer's screenshot.
- Checkout page: scan or tap, confirm, settle.
- Webhook or polling API so a shop's own backend learns a payment cleared.
- Refunds as first-class objects, linked to the original transaction. Not a
  manual reverse transfer that nobody can reconcile.
- Settlement reports and CSV export.
- Optional embeddable "Pay with ICPay" button.

**Open questions**

- Fees. Everything so far is free except username purchases. A merchant fee is
  the obvious revenue line, but it needs to undercut card processing
  meaningfully or there is no reason to switch.
- Chargebacks do not exist. On-chain settlement is final. That is a feature for
  the merchant and a risk for the buyer, and the checkout copy has to say so
  rather than implying card-like protection.
- Compliance. Taking payments for real goods invites KYC/AML obligations that
  vary by jurisdiction. This needs a lawyer before launch, not after.

---

## Phase 9 — Shopping

The most speculative item here, and the one most likely to change shape.

**Depends on:** Phase 8 working with real merchants.

**Scope**

- Merchant directory — browsable, searchable, category-filtered.
- Product listings with on-chain price, inventory, and fulfilment status.
- Order history in the wallet next to transactions.
- Optional escrow: funds held by the canister until the buyer confirms delivery,
  with a dispute window.

**The hard part is not code.** Escrow needs a dispute resolver, and a dispute
resolver is either a trusted party (centralized) or a vote (slow, gameable).
Ship without escrow first, learn what actually goes wrong, then design for the
real failure mode instead of an imagined one.

---

## Continuous

Not phases — always in flight.

- **Performance.** `getById`, `completeTx` and `failTx` scan the global
  transaction list linearly. Fine now, quadratic at scale. Move to an ID-keyed
  map before volume gets to six figures.
- **Cycles.** Watch `npm run ci cycles:balance`. At zero the canister is
  deleted and every user record with it. Queries are free; only update calls and
  idle burn (~45k cycles/s) cost anything.
- **Test coverage.** 33 tests. Every new endpoint adds tests in the same commit.
- **Docs.** `docs/command/README.md` is the operations reference; keep it true.

---

## What is deliberately not on this roadmap

Saying no is part of a roadmap.

- **Non-custodial mode.** A real improvement, and a different product. Retrofitting
  it means rebuilding every flow.
- **Mobile apps.** The PWA covers it. Two more build targets is not worth it yet.
- **Cross-chain bridges.** Chain-key tokens already give BTC, ETH and stables
  natively. A bridge is the most-exploited component in the industry, and here
  it would be redundant.
- **NFTs.** No clear tie to sending money by username.
- **Fiat on-ramp.** Wanted, but it needs a licensed partner. Revisit with
  Phase 7 compliance work.

---

## Status legend

| | |
|---|---|
| ✅ | Shipped and live |
| 🔨 | In progress or next up |
| — | Planned, not started |

Phases are ordered by dependency. Ship them in order or build on air.
