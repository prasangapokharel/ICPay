# Changelog

## v1.3 — Premium usernames

Short handles are the scarce inventory, so they are now sold instead of
given away.

**Paid usernames**
- Any available handle of 1-8 characters can be bought outright, priced on
  length alone: 1-3 chars 10 ICP, 4 chars 5 ICP, 5 chars 2 ICP, 6-8 chars
  1 ICP.
- The free claim is now 5-8 characters. Handles already claimed under the
  old 32-character ceiling keep resolving; only new claims are gated.
- Payment is a single ledger transfer to the sale treasury principal. The
  memo carries the handle, price and ISO date, packed to stay inside the
  ledger's 32-byte cap.
- The name is assigned only after the ledger confirms the payment, so a
  failed transfer never hands out a free handle.
- Two buyers cannot pay for one name: the ledger call is a commit point, so
  an in-flight lock plus a post-payment re-check guard the window. The lock
  is deliberately not persisted, so an upgrade cannot strand a name behind
  a lock nobody can release.
- A bought handle becomes the primary display name, but every handle the
  buyer has held keeps resolving to them — a handle is a payment address
  people memorise, and releasing one would let a stranger collect funds
  meant for the buyer.

**UI**
- Buy button on the dashboard, between Send and Receive.
- `/username` buy page: live availability check, tier and price breakdown
  with the network fee, insufficient-balance guard, and a pricing table.
- The profile card and the first-run username prompt now state the
  5-character free minimum and link to the buy page.

**Internal**
- `utils/DateTime.mo` derives a civil date from `Time.now()`, which
  `mo:core` does not provide.
- Price and length rules are mirrored client-side so the input can validate
  per keystroke without a canister call. The backend still enforces them.

## v1.2 — Username permanence and shareable receipts

**Usernames**
- The first claim is permanent on both paths that can set one. A username
  is a payment destination other people memorise, so reassigning it would
  let one account inherit another's inbound transfers.
- Uniqueness is now case-insensitive: `Alice` can no longer be registered
  alongside `alice` to impersonate it. The typed display form is still kept
  on the record.
- Controllers can reserve names (brands, impersonation bait) before anyone
  claims them. Authorization is the canister's own controller list, so it
  cannot drift and is revoked with a `dfx` controller change rather than an
  upgrade.

**Transfers**
- Memos are validated backend-side and rejected before the ledger call.
  Previously only the frontend capped them, so a direct caller could write
  a permanently failed transaction and burn a consensus round on a request
  that could never succeed. Measured in UTF-8 bytes, since the limit is a
  blob size.

**Sharing**
- Completed sends render a 1080x1350 receipt card from the block index the
  transfer already returns — nothing new is stored or queried on the
  canister. Shares through the native sheet where available, downloads
  otherwise.
- Tips offer the same receipt from the success toast, since a tip closes
  the drawer without reaching the send success screen.
- Four preset reaction memos in the tip drawer, each inside the 32-byte
  ledger memo limit.

**Fixes**
- `getTransactions` and `getTransactionDetail` were declared as update
  calls in the frontend IDL while the backend declares them queries. Every
  transaction view was paying full consensus (~6.6s) instead of a
  single-node query (~1s).
- `getExplorerUrl` built dashboard links from the internal transaction
  UUID, but that route indexes by ledger block index, so every link it
  returned was dead. Replaced with `explorerTxUrl()`.
- Removed `getProfile`, a byte-for-byte duplicate of `getUser`.
