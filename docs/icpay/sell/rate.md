# ICPAY sale rate

**1 ICP = 10,000 ICPAY.**

Every figure below was read from the live ledger `5fsnk-rqaaa-aaaan-q6m4q-cai`
on 2026-08-07, not estimated. ICP is taken at $2.08, the price the app itself
was showing that day.

---

## The decision

| | |
|---|---|
| Rate | **10,000 ICPAY per 1 ICP** |
| Acceptable band | 5,000 – 20,000 |
| Rejected | 100,000 (and anything above 20,000) |
| Implied FDV | 60,000 ICP ≈ $125,000 |
| Opening inventory | 10,000,000 ICPAY (1.67% of supply) |
| That inventory raises | 1,000 ICP ≈ $2,080 |

---

## Why not the obvious 100,000

100,000 per ICP was the first instinct. It prices the whole 600M supply at
6,000 ICP — about $12,500 — and selling the entire 10M inventory would raise
**100 ICP, roughly $208**. That does not pay for the endpoint that collects it.

The general shape, at 599,999,999.99 supply:

| Rate | FDV | 10M inventory raises | 5 ICP launch at 20% off |
|---|---|---|---|
| 1,000 | 600,000 ICP ($1.25M) | 10,000 ICP | 4,000 ICPAY |
| 5,000 | 120,000 ICP ($250K) | 2,000 ICP | 20,000 ICPAY |
| **10,000** | **60,000 ICP ($125K)** | **1,000 ICP ($2,080)** | **40,000 ICPAY** |
| 20,000 | 30,000 ICP ($62K) | 500 ICP | 80,000 ICPAY |
| 100,000 | 6,000 ICP ($12.5K) | 100 ICP ($208) | 400,000 ICPAY |

---

## Why the rate barely matters for proceeds, and what it actually decides

Reconstructing every one of the 94 blocks in the ICPAY log gives a holder set
that ties out to the live supply exactly (599,999,999.99), so this is measured,
not modelled:

| | |
|---|---|
| Accounts holding > 0 | **38** |
| Top 3 accounts | **82.4%** of supply |
| Top 6 accounts | **97.9%** |
| Free float outside the top 6 | ~12.7M ICPAY |

The company holds roughly 494M — the top 3. The sale offers at most 1.67% of
supply. So the rate has almost no effect on what the treasury takes home; the
sale is small either way.

What the rate decides is whether ICPAY ends up with a **price at all**. Pricing
high and selling nothing leaves 494M denominated in a market that does not
exist. Pricing so that people actually buy is what gives the other 82% a number
against it. That is the whole argument for erring cheap.

---

## Why 10,000 and not 1,000 — the liquidity loop must close

This is the constraint that decides it, and it is easy to miss:

> **The sale price is a floor on the future listing price.**

Collect at one rate, then seed a DEX pool at a worse rate, and every buyer is
underwater the moment the pool opens. It reads as a rug regardless of intent.

So the loop has to close at a **single** rate:

```
sell 10M ICPAY at 10,000/ICP   ->  raises 1,000 ICP
pair ~500 ICP with 5M ICPAY    ->  pool opens at the same 10,000/ICP
```

Nobody who bought early is down on day one, and the remaining ~500 ICP stays in
treasury.

At 1,000/ICP the same 10M raises 10,000 ICP on paper, but seeding a pool at
*that* price needs roughly ten times the ICP to be paired honestly — which the
treasury does not have (1.31 ICP at time of writing). The high rate produces a
number that cannot be defended with real liquidity. 10,000 is the highest rate
where the loop closes with money that will actually exist.

---

## Why 10,000 makes the discount legible

The sale exists to make a 20% fee discount meaningful. At 10,000 the discount
prices are round numbers a user can hold in their head:

| Purchase | ICP price | Pay in ICPAY (−20%) |
|---|---|---|
| Token launch | 5 ICP | 40,000 ICPAY |
| Username, 1–3 chars | 10 ICP | 80,000 ICPAY |
| Username, 4 chars | 5 ICP | 40,000 ICPAY |
| Username, 5 chars | 2 ICP | 16,000 ICPAY |
| Username, 6–8 chars | 1 ICP | 8,000 ICPAY |

At 1,000/ICP a 1 ICP username costs 800 ICPAY, which reads like dust. At
100,000 it costs 80,000 ICPAY for the cheapest item on the menu, and the launch
fee runs to 400,000 — numbers that make the token feel worthless.

The ~12.7M free float outside the top 6 covers about **317 discounted launches**
at 40,000 each, so the existing float is not a constraint on adoption.

---

## Inventory and limits

| | |
|---|---|
| Opening inventory | 10,000,000 ICPAY |
| Test transfer first | 100,000 ICPAY, confirm with `icrc1_balance_of` |
| `MIN_BUY` | 0.1 ICP |
| `MAX_BUY` | 50 ICP per call |

Start at 10M rather than a larger float: it caps the blast radius if the
endpoint has a bug, and topping up is a plain ledger transfer requiring no
deploy.

`MAX_BUY` is **per call, not per user**. The sale is deliberately stateless —
inventory is just the ledger balance — so enforcing a per-user cap would mean
adding storage and a migration. At this size a caller can loop past the cap, and
that is accepted; the real limit is the inventory itself.

---

## Funding

| | |
|---|---|
| Ledger | `5fsnk-rqaaa-aaaan-q6m4q-cai` |
| Owner | `6vbhm-nqaaa-aaaan-q6muq-cai` |
| Subaccount | `0200000000000000000000000000000000000000000000000000000000000000` |

`\01` is `REVENUE_SUBACCOUNT`. `\02` continues the sequence and cannot collide
with a user account: `Subaccount.fromPrincipal` is length-prefixed and
right-aligned with `padding = 32 - len - 1`, which is at least 2 for every
principal, so byte 0 of a derived subaccount is always `\00`.

Both canister ICPAY accounts read **0** at time of writing. The 72.6M
canister-owned balance visible in the block log sits under a *user's* derived
subaccount — that is custodial user property, not company inventory. All company
tokens are in personal wallets today.

**Do not fund before the endpoint is deployed.** No deployed code can move ICPAY
out of `\02`, so tokens sent early are inert until then. They are recoverable —
not lost — but stuck.

ICP proceeds land in `REVENUE_SUBACCOUNT`, which the existing 24h sweep timer
already carries to treasury. No new collection path.

---

## Burning, the one lever against the supply problem

ICPAY launched before commit `94df3c2` set `TOKEN_MINTING_PRINCIPAL` to
`aaaaa-aa`, so its minting account is a live key
(`mrxi6-dk5go-zznk7-c3plm-gh34v-o26vu-a6577-z7el5-senix-cezfq-jqe`) and the
ledger has **no controllers** — it can never be upgraded, so this cannot be
fixed. See [`../../../.claude/skills/icpay-roadmap/SKILL.md`](../../../.claude/skills/icpay-roadmap/SKILL.md).

That same property cuts the other way: in ICRC-1 a transfer **to** the minting
account is a burn that reduces `total_supply`. So while the mint cannot be
disabled, the supply *can* be visibly reduced.

**Route ICPAY collected from discounted purchases to the minting account.** 600M
then falls on-chain, verifiably, as the discount is used. It is the only
credibility lever available against the supply defect, and it costs nothing —
the tokens are already coming in.

Supply is already drifting down from transfer fees alone: 59,999,999,999,280,000
e8s on 2026-08-06, 59,999,999,999,030,000 today. That is 25 fees burned, not new
mints. Nobody has minted since block 51.

---

## Disclosure — unresolved

Airdropping a token with a live minting key is one thing. **Selling it for ICP
is another.** The token's own `icrc1:description` reads "Supply is fixed at
launch and can never be increased," which is not true and cannot be made true.

Before the buy screen takes anyone's ICP it should state the real supply
(600,000,000) and that the minting account is a live key. This is the fact a
buyer would most want to know, and the wording is **still open** — it is not
decided by this document.

---

## Summary

| Decision | Choice | Why |
|---|---|---|
| Rate | 10,000 ICPAY / ICP | Highest rate where the liquidity loop still closes |
| Not 100,000 | — | Whole inventory would raise ~$208 |
| Not 1,000 | — | Seeding a pool at that price needs ~10x the ICP treasury has |
| Inventory | 10M, test with 100K | Caps blast radius; topping up needs no deploy |
| Proceeds | `REVENUE_SUBACCOUNT` | Existing sweep timer already drains it |
| Collected ICPAY | Burn to minting account | Only lever against the supply defect |
| Disclosure | Open | Selling against a false description is the real risk |
