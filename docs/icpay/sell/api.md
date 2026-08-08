# ICPAY buy API

The endpoint that sells ICPAY for ICP inside the app. Rate, inventory and
funding are decided in [`rate.md`](rate.md); this document is the design.

**One tap.** The buyer enters an ICP amount, sees what they get, confirms once.
Their custodial ICP is debited and ICPAY arrives — either in their own in-app
account, or at a principal they name.

---

## The shape of it

Two new files, two extended. No repository, no storage, no model, no stable
variable, no migration:

| File | New or extended | Size |
|---|---|---|
| `config/Config.mo` | extended | ~6 lines |
| `services/SaleService.mo` | new | ~110 lines |
| `api/v1/Sale.mo` | new | ~20 lines |
| `main.mo` | extended | 3 lines |

Compare with the staking plan's nine files. The whole difference is that
staking has to *remember* positions and a sale does not. Inventory is the
ledger balance of one subaccount. Proceeds land in the subaccount the 24h sweep
timer already drains. The ICP leg writes its own history row through
`TransferService`. There is nothing left over to persist, so there is nothing to
migrate and nothing to corrupt on upgrade.

---

## User flow

```
┌──────────────────────────────────────────────┐
│  Buy ICPAY                                   │
│                                              │
│  Pay          [ 2.5            ] ICP         │
│  Receive        25,000 ICPAY                 │  <- computed client-side
│                                              │     rate from getIcpayRate()
│  Send to      ( ) My ICPay account           │  <- default
│               ( ) Another wallet             │
│                 [ principal            ]     │
│                                              │
│  Balance 4.12 ICP   ·   1 ICP = 10,000 ICPAY │
│                                              │
│  Supply 600,000,000. The minting account is  │  <- disclosure, see below
│  a live key and can issue more.              │
│                                              │
│              [   Confirm   ]                 │
└──────────────────────────────────────────────┘
```

Nothing between the amount and the confirm. No quote to accept, no expiry, no
second screen — the rate is a constant, so there is no price to lock and no
slippage to warn about. That is the main advantage of a fixed-price sale over
routing to a DEX, and the reason to keep the screen this bare.

The recipient field defaults to the buyer's own account and most people will
never open it. It exists so someone can buy straight into a wallet they hold
keys to, which is the only way ICPAY bought here can reach a DEX later.

---

## Call sequence

```
   Browser                    icp_wallet_backend              ICP ledger    ICPAY ledger
      │                              │                            │              │
      │  getIcpayRate()   (query)    │                            │              │
      │─────────────────────────────>│                            │              │
      │<────────────── 10_000 ───────│  a constant, no ledger call│              │
      │                              │                            │              │
      │  getIcpaySale()   (update)   │                            │              │
      │─────────────────────────────>│  icrc1_balance_of(\02)     │              │
      │                              │───────────────────────────────────────────>│
      │<─ rate, inventory, min, max ─│                            │              │
      │                              │                            │              │
      │  [user types, confirms]      │                            │              │
      │  buyIcpay(icp, ?recipient)   │                            │              │
      │─────────────────────────────>│                            │              │
      │                              │ 1. validate amount         │              │
      │                              │ 2. resolve user            │              │
      │                              │ 3. read \02 inventory ─────────────────────>│
      │                              │                            │              │
      │                              │ 4. ICP: user ──> \01       │              │
      │                              │───────────────────────────>│              │
      │                              │                            │              │
      │                              │ 5. ICPAY: \02 ──> dest ────────────────────>│
      │                              │                            │              │
      │<── ok { icpBlock, icpayBlock, icpayAmount, destination } ──│              │
      │                              │                            │              │
      │                              │  on 5 failing:             │              │
      │                              │  refund \01 ──> user       │              │
      │                              │───────────────────────────>│              │
      │<── err "... refunded ..." ───│                            │              │
```

`\01` is `REVENUE_SUBACCOUNT`, `\02` is `SALE_SUBACCOUNT`.

---

## Why ICP moves first

This is the one ordering decision, and the safe-feeling answer is wrong.

Paying out ICPAY first means a failed ICP debit has already given away
inventory. The tokens are gone to a principal that may not even be a user of
this app — **unrecoverable**.

Charging first means a failed payout leaves the buyer's ICP sitting in a
subaccount only this canister can spend from — **refundable**, by the very next
line of code.

> Take the failure you can undo.

`UsernameSaleService.purchase` makes the same call for the same reason: it
charges before it assigns the name, so a rejected payment never yields a free
handle.

---

## Why the inventory is read before charging

`TransferService.resolveSender` carries an explicit comment saying it
deliberately does **not** pre-read a balance — the ledger checks funds itself,
so a pre-flight read buys a whole extra consensus round (~3.5s measured) for an
answer the transfer already returns, and it is racy besides.

Step 3 breaks that rule on purpose, and the difference is whose balance it is:

- `resolveSender` would be reading the **buyer's** balance. The ledger enforces
  it anyway, so the read is pure cost.
- Step 3 reads **our own** inventory. Nothing else enforces it, and if it is
  short the failure lands on the refund path — two extra ledger calls, a buyer
  staring at an error, and a small chance the refund itself fails.

So the read converts the single most likely failure (inventory ran out) from a
messy compensating transaction into a clean upfront rejection. It costs one
query-speed call and it is worth it. **This needs a comment in the code saying
so**, or someone will read the `resolveSender` rule and "fix" it back.

---

## Where each leg gets its funds

The two legs use different mechanisms, and that is forced, not chosen.

**ICP leg — `TransferService.transferByAccount`.** Moves from the *caller's*
custodial account. It also runs the ledger allowlist check, validates the
amount, and writes a `#transfer` row into the buyer's history for free.

**ICPAY leg — raw `LedgerService.transfer` with `from_subaccount = ?SALE_SUBACCOUNT`.**
`transferByAccount` cannot be reused here: it sends from the caller, and on this
leg the sender is the canister itself. `icrc1_transfer` always sends from the
caller's own account, so `from_subaccount` is the only thing that selects `\02`
instead of the canister's default account. This is exactly the shape of
`TokenService.sweepRevenue`, which moves revenue out of `\01` the same way.

Going raw means skipping the allowlist check, and that is safe here for a reason
worth stating: the allowlist exists because `actor(id)` on a caller-supplied id
lets someone point the custodian at a canister they wrote, which can return a
forged `#Ok`. On this leg the ledger id is a compiled-in constant and no
argument reaches it. ICPAY is on the allowlist anyway — `isLedgerSupported`
returns `true`, verified live — so users can already hold and send it in-app.

---

## Config

```motoko
// Sale inventory. \01 is REVENUE_SUBACCOUNT; this continues the sequence and
// cannot collide with a user account -- Subaccount.fromPrincipal is
// length-prefixed and right-aligned with padding = 32 - len - 1, which is at
// least 2 for every principal, so byte 0 of a derived subaccount is always \00.
public let SALE_SUBACCOUNT: Blob = "\02\00\00...";  // 32 bytes

// Both sides are 8-decimal, so this is exact integer arithmetic with no
// rounding rule to get wrong. See docs/icpay/sell/rate.md for the derivation.
public let ICPAY_PER_ICP: Nat = 10_000;

// Denominated in ICP e8s -- these bound what the buyer pays, not what they get.
public let MIN_BUY_ICP: Nat = 10_000_000;    // 0.1 ICP
public let MAX_BUY_ICP: Nat = 5_000_000_000; // 50 ICP, per call not per user
```

`ICPAY_LEDGER_CANISTER_ID` goes here too rather than being passed in, matching
how `ICP_LEDGER_CANISTER_ID` is handled.

The payout is `icpAmount * ICPAY_PER_ICP`. Both tokens are 8-decimal — ICP by
`ICP_DECIMALS`, ICPAY read live from the ledger — so e8s multiply directly with
no scaling factor. 2.5 ICP is `250_000_000`, times 10,000 is
`2_500_000_000_000` e8s, which is 25,000 ICPAY. Exact, no remainder, no rounding
mode to argue about. **If ICPAY were ever a different decimal count this
arithmetic would be silently wrong**, which is why the decimals belong in a test
rather than in an assumption.

ICPAY's own transfer fee is `10_000` e8s (0.0001 ICPAY), read live. It is paid
out of the sale inventory, which is why step 3 checks `icpayAmount + fee` and
not `icpayAmount` alone.

---

## Service

```motoko
public func create(
  users: UserStorage.UserMap,
  transfers: TransferService.TransferService,
  self: Principal,
) : SaleService {
  { users; transfers; self };
};
```

Three fields. `UsernameSaleService` needs five including a pending-lock set; the
sale needs no lock, because there is no uniquely claimable resource to race
over. Two simultaneous buyers either both succeed or the second is refused for
inventory — both correct outcomes, no lock required.

```motoko
public type Quote = {
  icpayPerIcp: Nat;
  inventory: Nat;   // live \02 balance
  minBuy: Nat;
  maxBuy: Nat;
};

public type Purchase = {
  icpBlock: Nat64;
  icpayBlock: Nat64;
  icpAmount: Nat;
  icpayAmount: Nat;
  destination: Text;  // rendered, so the UI can show where it actually went
};
```

`destination` is returned rather than assumed. When the buyer named an external
principal, this is the only confirmation they will ever get — see the receipt
caveat below.

### `buy`

```
buy(service, caller, icpAmount, recipient) :
  validate icpAmount            -- AmountValidator, then MIN/MAX
  resolve caller                -- "User not found" if unregistered
  resolve destination           -- recipient ?: caller's custodial ICPAY account
  icpayAmount = icpAmount * ICPAY_PER_ICP
  read \02 balance, read ICPAY fee
  if balance < icpayAmount + fee  -> #err "Sale inventory is short"

  ICP: transferByAccount(caller, ICP_LEDGER, fixedAccount(self, \01), icpAmount)
    #err -> return it unchanged

  ICPAY: LedgerService.transfer(ICPAY_LEDGER, {
           from_subaccount = ?\02; to = destination;
           amount = icpayAmount; fee = ?fee })
    #Ok  -> #ok { ... }
    #Err -> refund, then #err
```

Destination resolution mirrors `TransferService.transferByPrincipal`: a
registered principal is credited in their custodial account, anyone else at
their own default ledger account. The default — no recipient given — is the
caller's custodial account, which is what keeps the tokens spendable in-app.

### Refund

```
refund: LedgerService.transfer(ICP_LEDGER, {
          from_subaccount = ?\01; to = caller's custodial account;
          amount = icpAmount - icpFee })
```

The fee is deducted because the refund is itself a ledger transfer and someone
has to pay for it. Charging it to the buyer is the honest option; absorbing it
would mean the canister pays for a failure it did not cause, and at 0.0001 ICP
the difference is not worth the special case.

**The refund can fail too.** When it does, the error text must carry the ICP
block index so the payment can be settled by hand — exactly what
`UsernameSaleService` does when a name is claimed mid-payment:

```
"ICPAY payout failed and the refund did not go through. Your ICP is safe at
 payment block 12345678 -- contact support."
```

Every branch that ends in `#err` after the ICP has moved must name that block
index. It is the only handle anyone has on the money afterwards.

---

## API

```motoko
mixin (sale: SaleService.SaleService, mwConfig: MiddlewareAuth.Config) {
  public shared query func getIcpayRate() : async Nat { ... };

  public shared func getIcpaySale() : async SaleService.Quote { ... };

  public shared ({ caller }) func buyIcpay(icpAmount: Nat, recipient: ?Principal)
    : async Types.ApiResult<SaleService.Purchase> {
    await SaleService.buy(sale, MiddlewareAuth.effectiveCaller(mwConfig, caller), icpAmount, recipient);
  };
}
```

Three methods, and the split between the first two is not cosmetic:

- `getIcpayRate` is a real `query` — it returns a compiled-in constant, so it
  costs nothing and answers instantly. The frontend can compute the receive
  amount on every keystroke against it.
- `getIcpaySale` cannot be a query, because reading the `\02` balance is an
  inter-canister call. It is fetched once when the screen opens, not per
  keystroke.

Shipping the rate from the canister rather than hardcoding it in the frontend
means changing the price is a backend deploy, not a race between a redeployed
frontend and a stale cached one where the two disagree about what a buyer owes.

---

## Frontend

| Where | What |
|---|---|
| `services/wallet.ts` | three entries in `WalletActor` + three in the IDL service |
| `services/icpay/icpay.ts` | `getIcpayRate`, `getIcpaySale`, `buyIcpay` wrappers over `query`/`call` |
| `components/icpay/buy-icpay-drawer.tsx` | the screen above |
| `components/icpay/icpay-token-card.tsx` | a Buy button opening it |
| `language/*/common.json` | all 10 locales, same commit |

The drawer follows `send-token-drawer`: amount input, computed secondary line,
one confirm button that shows a spinner and flips its label between idle,
sending, and insufficient. `primeSuccessChime()` goes in the confirm tap and
`playSuccessChime()` on success — the buy is a multi-second round trip, so
without the prime the chime is silently refused on mobile.

All ten locale catalogs must be edited in the same commit. `language/check.mjs`
enforces key parity, and a missing key throws `MISSING_MESSAGE` at runtime
rather than failing the build — the gap would ship.

---

## What the UI must say, and must not

**External sends leave custody permanently.** ICPAY delivered to a principal the
canister does not custody cannot be recovered by anyone here — not by support,
not by a controller. A mistyped principal is a total loss. The recipient field
must say this *before* the confirm, not after.

**Do not promise a receipt.** There is no receive-side transaction recording
anywhere in this codebase. `doTransfer` writes a `#transfer` row for the caller
only. So:

| Destination | What the buyer's history shows |
|---|---|
| Own account | one ICP `#transfer` row. No ICPAY "received" row. |
| External principal | the same ICP row, and nothing about the ICPAY at all. |

The `#ok` response is the confirmation. The drawer should show the ICPAY block
index on success, because that is the only durable record the buyer gets and it
is checkable on any ICP explorer.

---

## Disclosure — still unresolved

ICPAY's own `icrc1:description` says "Supply is fixed at launch and can never be
increased." That is **false** and cannot be corrected: the ledger has no
controllers, so it can never be upgraded, and its minting account is a live key.
See [`rate.md`](rate.md#burning-the-one-lever-against-the-supply-problem).

Airdropping a token with that defect is one thing. **Taking ICP for it is
another.** The buy screen must state the real supply and the live minting key
before it takes anyone's money — it is the single fact a buyer would most want
to know, and the app already reads both from the ledger for the transparency
card (`fetchIcpayStats` returns `mintingAccount` and `supplyFixed`, and
`supplyFixed` is already `false` for ICPAY today).

**The wording is not decided by this document, and the endpoint should not ship
without it.** This is the one open blocker, not a detail to settle in review.

---

## Order of work

Three backend commits, each of which compiles and passes alone:

| # | Contents | Live? |
|---|---|---|
| 1 | `Config.mo` constants, `SaleService.mo`, service tests | no — nothing calls it |
| 2 | `api/v1/Sale.mo`, security tests | no — not included in `main.mo` |
| 3 | `import SaleApi` + `transient let saleService` + `include SaleApi(saleService, mwConfig)` | **yes, on deploy** |

Splitting 2 from 3 mirrors the staking plan: an API file that is not `include`d
changes no behaviour, so the reviewable surface stays small and only the last
commit can break anything.

**The frontend ships after the deploy, not before.** Adding the three methods to
the IDL in `services/wallet.ts` describes an interface the live canister does
not yet have, and calling one rejects at the agent. So: commits 1–3, then
`npm run ci backend:deploy`, then the frontend commit. The alternative — a
drawer that catches the rejection and hides itself — is a fallback for a state
that lasts minutes and is not worth the code.

**Merging to `main` does not deploy the canister.** A human runs
`npm run ci backend:deploy`. Until that happens, commit 3 is inert.

End to end, including the parts that are not commits:

```
1. Config + SaleService + tests          commit
2. api/v1/Sale.mo + tests                commit
3. wire into main.mo                     commit
4. npm run ci backend:deploy             human, this is what makes it live
5. fund \02 with 100,000 ICPAY           human
6. buy 0.1 ICP through the real endpoint  verify both legs landed
7. top up \02 to 10,000,000              human
8. frontend drawer + 10 locales          commit
```

Step 6 is the one that cannot be skipped. It is the first time the two legs run
against real ledgers, and it costs 0.1 ICP to find out the payout leg works
before anyone else's money is involved.

---

## Funding, and the order that matters

```
Ledger      5fsnk-rqaaa-aaaan-q6m4q-cai
Owner       6vbhm-nqaaa-aaaan-q6muq-cai
Subaccount  0200000000000000000000000000000000000000000000000000000000000000
Amount      100,000 ICPAY first, then 10,000,000
```

**Deploy before funding.** No deployed code can move ICPAY out of `\02` today,
so tokens sent early are inert — recoverable, but stuck until commit 3 is live.

Send 100,000 first, confirm with `icrc1_balance_of`, buy the minimum through the
real endpoint, and check both legs landed. Then top up to 10M. Topping up is a
plain ledger transfer and never needs another deploy, which is the whole reason
to start small.

ICP proceeds land in `REVENUE_SUBACCOUNT`, which the existing 24h timer already
sweeps to treasury. No new collection path, no new timer. The only thing worth
noting is that sale proceeds and username/launch revenue become
indistinguishable once they are in `\01` — if the two ever need to be reported
apart, that has to come from the block log, not from the balance.

---

## Tests

Under `backend/testing/`, run by `bash backend/scripts/run-tests.sh` — not
`npm test`, not `mops test`.

`testing/services/SaleService.test.mo`

- `icpAmount * ICPAY_PER_ICP` at 0.1, 1, 2.5 and 50 ICP
- ICPAY decimals are 8, so the e8s multiplication holds
- below `MIN_BUY_ICP` and above `MAX_BUY_ICP` are both refused
- zero is refused by `AmountValidator` before the range check
- inventory short of `icpayAmount + fee` refuses without charging

`testing/security/Sale.test.mo`

- an anonymous caller is refused. In prod `MiddlewareAuth.effectiveCaller`
  passes the caller through untouched, so the refusal comes from
  `UserRepo.getByPrincipal` finding no record — worth a test precisely because
  it is not an explicit `isAnonymous` check and could quietly stop holding.
- an external recipient is honoured rather than silently redirected to the
  caller — the failure mode here is delivering to the wrong account, which is
  irreversible

---

## Deliberately not built

**Per-user purchase caps.** They need storage, which needs a stable variable and
a migration, which ends the property that makes this design small. A caller can
loop past `MAX_BUY_ICP`, and that is accepted: the real limit is how much
inventory sits in `\02`, and that is controlled by how much gets funded.

**A quote/accept two-step.** The rate is a constant. There is nothing to expire.

**A pending lock.** Nothing unique is being claimed.

**Burning collected ICPAY.** [`rate.md`](rate.md) argues for routing ICPAY taken
in fee discounts to the minting account, which reduces `total_supply` on-chain.
That belongs to the discount feature, not this one — this endpoint only sells.

---

## Summary

| Decision | Choice | Why |
|---|---|---|
| State | none | inventory is a ledger balance; nothing to migrate |
| Files | 2 new, 2 extended | no repository, no storage, no model |
| Leg order | ICP first | a failed payout is refundable; given-away inventory is not |
| Inventory read | before charging | our own balance, and it is the likeliest failure |
| ICPAY leg | raw transfer from `\02` | `transferByAccount` sends from the caller, not the canister |
| Rate source | canister query | a stale frontend must not disagree about the price |
| Recipient | optional, defaults to self | the only way bought ICPAY reaches a DEX later |
| Receipt | block index only | no receive-side row exists in this codebase |
| Per-user cap | none | would require storage; inventory is the real limit |
| Disclosure | **open — blocks ship** | the token's own description is false |
