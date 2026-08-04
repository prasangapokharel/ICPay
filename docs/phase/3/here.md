# Phase 3 — Multi-token transfers

Phase 2 shipped multi-token *visibility*: the wallet discovers every SNS token
plus five chain-key ledgers and shows a real balance for each. It cannot spend
any of them. Every non-ICP row carries a "receive only" badge, and that badge is
honest — the canister has exactly one ledger actor and it is hardcoded to ICP.

The goal of this phase, stated plainly: **every token behaves exactly like ICP
does today.** Same username-first send, same four destination formats, same
history rows, same success screen. The only thing that varies is which ledger
settles the payment.

That framing is also the implementation strategy. Nothing here is a new feature.
It is one `ledgerId` parameter threaded through code that is already correct,
plus one fee bug fixed. If a step in this plan looks like it is building
something new, it is probably wrong.

## What already works and must not be rebuilt

Four things were built generically the first time. Recognising this is most of
the plan.

**Subaccount derivation is per-user, not per-token.**
`backend/src/ledger/Subaccount.mo:10` derives a 32-byte blob from the caller's
principal and nothing else. A subaccount is an address *within* a ledger, so the
same blob names a distinct account on every ICRC-1 ledger in existence. One
derivation serves ckBTC, ckUSDC and any SNS token at once.

There is no such thing as a per-token subaccount to build, and building one would
be actively harmful — it would change every existing user's ICP deposit address
and strand funds already sitting at the old one. The roadmap's phrase "per-token
subaccounts" should be read as *per-token accounts*, which we get for free.

**The ledger client is already fully generic.**
`backend/src/ledger/LedgerClient.mo:4` declares `ICRC1Service` as a plain actor
type — `icrc1_transfer`, `icrc1_balance_of`, `icrc1_fee`, `icrc1_decimals`,
`icrc1_symbol`. It names no canister. It is a *type*, and any ICRC-1 ledger
satisfies it. Not one line changes.

**Token discovery and balances are frontend-side and per-ledger already.**
`frontend/services/tokens.ts` queries SNS-W for the ledger list and calls
`icrc1_balance_of` on each ledger directly. The canister is not in that path at
all, so it never needed teaching.

**Recipient resolution is token-independent.** Username → principal → account
has nothing to do with which ledger settles the payment. The username system is
already the universal address for every token; it simply has not been allowed to
carry one yet.

## The fee problem, and why it is smaller than it looks

`Config.ICP_FEE = 10_000` is correct for ICP and wrong for nearly everything
else. ckBTC's fee is 10 satoshi; ckETH's is in wei. The obvious fix is to fetch
`icrc1_fee()` per token and send that.

**Do not do that.** There is a better answer, and it is one character.

`LedgerTypes.TransferArgs.fee` is `?Nat` — optional (`ledger/Types.mo:11`).
ICRC-1 defines the two cases:

| Sent | Ledger behaviour |
|---|---|
| `?10_000` | compares against its own fee; any mismatch → `#BadFee` |
| `null` | **applies its own current fee. Cannot fail on fee.** |

`#BadFee` is only reachable if you guess. Sending `null` is not sloppiness — it
is the ledger being the authority on its own fee, which it is. So in
`TransferService.doTransfer`:

```motoko
fee = ?fee;   →   fee = null;
```

This is strictly more correct than fetching, because a fetched fee is stale the
moment it is read. A ledger that changes its fee between the `icrc1_fee()` query
and the `icrc1_transfer` call produces a `#BadFee` that no amount of careful
fetching prevents. `null` has no such race.

It also fixes a case we would otherwise hit later: chain-key **withdrawals to a
minting account are burns**, and burns require a null or zero fee. Sending an
explicit fee breaks those specifically.

### Fee becomes display-only

Once the ledger owns the arithmetic, `icrc1_fee()` is needed only for the number
shown to the user and recorded on the transaction row. Stale by a moment is
harmless there — it can no longer fail a transfer, only misreport one by a
rounding error. One query per token, and queries are not billed on the IC (see
`docs/costing/here.md`).

### The validator is wrong today, independently of tokens

`validators/AmountValidator.mo:8` rejects `amount < ICP_FEE`. But the fee is
charged **on top of** the amount, not deducted from it — confirmed by
`backend/.agents/skills/motok/ledger-integration/SKILL.md:96`. So that rule is
not a real constraint. Sending 0.00005 ICP is perfectly valid if you hold 0.001.

`validateWithFee` (line 14) has the same flaw with `amount <= fee`. Both check
the wrong relationship. The real one:

```
amount > 0  and  balance >= amount + fee
```

This is a live bug on ICP right now, not something Phase 3 introduces. Fixing it
is step one because everything else depends on the fee no longer being a
constant.

## Backend

### `LedgerService.mo` — resolve the actor per call

Today `create()` builds one actor and stores it. Instead store only the
custodian, and resolve from a `ledgerId: Text` on each call:

```motoko
public func ledger(id: Text) : LedgerClient.ICRC1Service {
  actor(id);
};
```

Every function — `getBalance`, `transfer`, `getFee`, `getDecimals`, `getSymbol`
— gains `ledgerId: Text` and calls `ledger(ledgerId)` instead of
`service.icpLedger`. Bodies otherwise unchanged.

`actor(id)` on a `Text` is cheap: it is a reference, not a canister lookup. There
is no state to cache and therefore no cache to invalidate.

`depositAccount` does **not** change. It is per-user, and per the section above
that is the whole point.

`transferToAccountIdentifier` (the legacy non-ICRC path) stays ICP-only. Account
identifiers are an ICP-ledger concept and other ICRC-1 ledgers do not implement
that method. Pin it to the ICP ledger explicitly rather than accepting a
`ledgerId` it cannot honour. Note its `OldTransferArgs.fee` is **required**, not
optional (`ledger/Types.mo:47`) — so this one path keeps a real fetched fee. It
is the exception that proves the rule.

### API — one endpoint set, username first

The four endpoints in `api/v1/Transfer.mo` and `withdraw` in `api/v1/Withdraw.mo`
each take `ledgerId: Text` as the leading parameter:

```motoko
public shared ({ caller }) func transferByUsername(
  ledgerId: Text, username: Text, amount: Nat, memo: ?Text
) : async Types.ApiResult<{ blockIndex: Nat64; txId: Types.TxId }>
```

`transferByPrincipal`, `transferByAccount`, `transferByAccountId` and `withdraw`
follow the same shape.

**No new endpoints.** Not `transferTokenByUsername`, not a v2 namespace. Adding a
parallel token-aware surface would leave two code paths where one has been
audited, and the ICP one would rot. Same endpoints, one more argument.

This is a **breaking Candid change**. The frontend is the only consumer and ships
in the same release, so there is no compatibility window to preserve. Do not add
an optional parameter to avoid the break — an optional `ledgerId` means a
transfer can be issued with no token specified, and whatever we default it to is
a guess about someone's money.

Validate `ledgerId` against the known-token allowlist before it reaches
`actor(id)`. An unvalidated canister-id string means a caller can direct the
custodian to call an arbitrary canister. The custodian's authority is what makes
that dangerous, not the call itself.

### `Transaction` — record the token

Add `ledgerId: Text` to `Types.Transaction` and `TransactionPublic`; set it in
`Transaction.new()`. Without it, history renders every row as ICP and a user
cannot distinguish a 0.5 ckBTC send from a 0.5 ICP send.

Existing stable rows have no such field. Stamp them with the ICP ledger id on
upgrade — which is true, since ICP is the only token that could have moved.

## Frontend

### The flow

```
/wallet                  assets list — every discovered token
   └── tap a row
        └── /transfer/<ledgerId>    send form, bound to that one token
```

**The asset list is the token picker.** No dropdown inside the send form, no
selector modal. You tap the token you want to send and land on a page that only
sends that token. This is how every exchange does it, and it is also what makes
the page free (see below).

### `components/wallet/token-list.tsx`

Remove the `receiveOnly` badge (lines 66–68) and its locale strings across all
10 languages. Wrap each row in `<Link href={`/transfer/${token.ledgerId}`}>`.

Row layout does not change — logo, symbol, name, balance. The row was already the
right shape for a tappable list item; it simply was not tappable.

### `app/(app)/transfer/[ledgerId]/page.tsx`

The frontend is `output: "export"`, so a route parameter whose values only exist
at runtime cannot be prerendered. This project already solved that exact problem
for public profiles — `app/(profile)/[username]/page.tsx:10` emits one shell via
`generateStaticParams()` and reads the real value client-side, with a
`vercel.json` rewrite pointing real URLs at the shell.

Follow it precisely:

```tsx
export function generateStaticParams() {
  return [{ ledgerId: "token" }]
}
```

and in `vercel.json`:

```json
{ "source": "/transfer/:ledgerId", "destination": "/transfer/token" }
```

The page body is the existing `app/(app)/transfer/page.tsx` with the token read
from the URL. Keep the bare `/transfer` route working as ICP — it is linked from
the home actions and from QR scans.

### The destination selector already exists

`components/transfer/transfer-form.tsx:39` already has exactly the
username / principal / account choice, as a `Tabs` group. Semantically that is a
radio: one of three, mutually exclusive, always one selected.

**Leave it as Tabs.** Converting to radio inputs is a cosmetic swap that touches
a working, validated component and buys nothing functional. If the visual is
wrong, restyle the tab triggers — do not rewrite the control. The 64-char hex
account-ID case is detected by shape and overrides the selection regardless, so
the control is a hint, not a branch.

The form otherwise needs three token-aware changes and no more:

| Today | Change |
|---|---|
| `ICP_FEE` imported from `lib/wallet-utils` (line 27) | take `fee` as a prop |
| `parseIcp` assumes 8 decimals (`wallet-utils.ts:21`) | take `decimals` as a prop |
| `formatAmount` assumes 8 decimals (line 69) | use the existing `formatTokenAmount` |

`formatTokenAmount` already exists for exactly this reason — the comment at
`wallet-utils.ts:77` says so. The parse direction is the one that was never
generalised.

### `services/transfer/transfer.ts`

`transfer()` (line 13) gains `ledgerId: string` and passes it to all four actor
calls. Mechanical — the function already funnels every destination format into
one place, which is why this is a four-line change rather than four scattered
call sites.

## Why this adds no extra network requests

`useTokenHoldings()` (`hooks/use-wallet-data.ts:271`) already returns, for every
token the user holds:

```
{ ledgerId, balance, symbol, name, decimals, fee, logo? }
```

That is the complete input set for the transfer form — symbol and name for the
header, decimals to parse the amount, balance for the max button, fee for the
"you will receive" line.

So the per-token page reads from the SWR cache the assets list has already
populated. Navigating from a token row into its transfer page costs **zero**
additional requests. The form renders instantly from cache and revalidates in the
background like every other page in the app.

This is the payoff for the asset-list-as-picker design. A token selector *inside*
the send form would have to fetch metadata on selection, because the form could
not know in advance which token was about to be picked.

## Order of work

1. **`fee = null`** in the ICRC-1 transfer args — transfers become correct on every token, and `#BadFee` becomes unreachable.
2. **`AmountValidator`** → `amount > 0 && balance >= amount + fee`, fee passed in as an argument rather than imported. Delete `Config.ICP_FEE`.
3. **`LedgerService`** — per-call actor, `ledgerId` on every function.
4. **`Transaction.ledgerId`** — model, type, upgrade hook stamping old rows as ICP.
5. **API signatures** — 4 transfer endpoints + `withdraw`, with allowlist validation.
6. **Tests** — every endpoint whose signature changed, plus a non-ICP ledger case and one asserting a below-ICP-fee amount now succeeds. The suite is 24 files; a changed endpoint updates its test in the same commit.
7. **Frontend** — `transfer()` parameter, dynamic route, `vercel.json` rewrite, token rows become links, badge and its 10 locale strings removed, form takes `decimals`/`fee` as props.

Steps 1 and 2 are worth landing on their own. They fix a real ICP bug and are
independently testable, so a problem there does not get tangled up with the
signature churn that follows.

Backend ships separately from the frontend and does not deploy on merge — the
canister upgrade is `npm run ci backend:deploy`, run by a human. Land and deploy
the backend **before** merging the frontend, or the UI calls a Candid signature
the live canister does not have.
