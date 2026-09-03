# ICPay Market Data — Official Sources Only (No icptokens.net)

> Dropping icptokens.net (30 req/min free tier — hits fast at any real traffic). Everything below is either **IC Dashboard infrastructure** (icrc-api / ic-api / ledger-api / sns-api, run by DFINITY, same backend that powers dashboard.internetcomputer.org) or **ICPSwap's own official API** (the DEX's first-party data, not a third-party scraper of it). No 30 req/min wall, no third party in the middle.

---

## 0. The big discovery: the ICRC API already has price + market cap built in

You don't need ICPSwap *or* icptokens for price/market cap/volume/holders. The official ICRC ledger API computes and stores this itself.

```
GET https://icrc-api.internetcomputer.org/api/v2/ledgers
```

This single endpoint can be **sorted directly** by:
```
token_value_price_usd   -token_value_price_usd
token_value_fdv_usd     -token_value_fdv_usd
total_transactions_count_over_past_7d
unique_owners_count
```
— which tells you the response payload already embeds a `token_value` object per ledger, with this schema (confirmed from the live OpenAPI spec):

```json
{
  "price": 20.01,
  "price_usd": 20.01,
  "price_change_24h": 0.01,
  "price_change_24h_usd": 0.01,
  "volume_24h": 20.01,
  "volume_24h_usd": 20.01,
  "volume_7d": 20.01,
  "volume_7d_usd": 20.01,
  "fdv": 20.01,
  "fdv_usd": 20.01,
  "fdv_change_24h": 0.01,
  "fdv_change_24h_usd": 0.01,
  "source": "CoinMarketCap",
  "source_url": "...",
  "timestamp": 1696118400
}
```

`fdv` = Fully Diluted Valuation = price × total supply — **this is your Market Cap column**, straight from the official API, no computation needed on your end.

```bash
curl -s "https://icrc-api.internetcomputer.org/api/v2/ledgers?limit=50&sort_by=-token_value_volume_24h_usd"
curl -s "https://icrc-api.internetcomputer.org/api/v2/ledgers?limit=50&sort_by=-token_value_fdv_usd"      # market cap leaderboard
curl -s "https://icrc-api.internetcomputer.org/api/v2/ledgers?query=motoko"                                 # search by name/symbol
```

Query filters worth knowing about on this same endpoint:
```
network              → mainnet | testnet
token_types          → nns, sns, chain_key, tcycles, one_sec, other
token_types_require_price → only return ledgers with token_value_price_usd > 0 (filters out dead/priceless tokens automatically)
has_transactions      → default true, hides inactive ledgers
max_top_holder_percentage → default 90, filters out ledgers where one wallet holds >90% (rug-pull-shaped tokens)
```
That `max_top_holder_percentage` filter is a free anti-scam screen for your "New" / "Trending" lists — worth turning on.

---

## 1. Full official field inventory

### 1a. Per-ledger metadata + price (single call covers most of your table)
```
GET /api/v2/ledgers/{ledger_canister_id}
```
Returns `icrc1_metadata` (name, symbol, decimals, logo, **total_supply**, fee, minting account) **plus** the embedded `token_value` block above.

### 1b. Holder count (Market Cap column's sibling — often shown together)
```
GET /api/v2/ledgers/{ledger_canister_id}/holders/count
→ { "total": 327325 }

GET /api/v2/ledgers/{ledger_canister_id}/holders?sort_by=-balance&limit=20
→ top holders with balance, per-account tx count
```

### 1c. Total supply (time series, not just latest — for a supply chart if you want one)
```
GET /api/v1/ledgers/{ledger_canister_id}/total-supply?step=86400
GET /api/v2/ledgers/{ledger_canister_id}/total-supply.txt   → plain text, cheapest call if you just need the number
```

### 1d. Circulating supply (real circulating, not just FDV — mints minus burns minus known-unmoved-since-mint balances)
```
GET /api/v1/ledgers/{ledger_canister_id}/circulating-supply?step=86400
GET /api/v1/ledgers/{ledger_canister_id}/circulating-supply.txt
```
Use this if you want a true **circulating market cap** column alongside FDV — most competitors only show FDV because this endpoint is easy to miss.

### 1e. Historical price/volume (for a sparkline without hitting ICPSwap)
```
GET /api/v2/ledgers/{ledger_canister_id}/token-values?start=<unix>&end=<unix>&limit=1000
```
Capped at a 90-day range per call, returns price + 24h volume at each point — this is enough to draw a mini sparkline in your table row.

### 1f. Ledger-wide stats (for a "platform totals" strip)
```
GET /api/v2/ledgers/token-value-stats
→ { fdv, fdv_usd, volume_7d, volume_7d_usd }   // aggregated across all tracked ledgers
```

### 1g. Total ledger count (for pagination / "N tokens" label)
```
GET /api/v2/ledgers/count?has_transactions=true
```

---

## 2. Pool / TVL / swap-level data — still needs ICPSwap's own API (first-party, not a scraper)

The ICRC API knows token-level price/FDV but has **no concept of pools**. For "Pool canister," per-pool TVL, and the swap feed, ICPSwap's own official API is still the right — and only — official-tier source, since ICPSwap is the DEX itself:

```
Base: https://api.icpswap.com/info
GET /pool/all
GET /pool/{poolId}/chart/{level}
GET /token/all
GET /transaction/find?poolId=...
```
(Full field list already in `trading-tokens.md` §3 — unchanged, no rate-limit concerns reported on this one, unlike icptokens' documented 30 req/min free cap.)

---

## 3. Recommended split of responsibility (official-only stack)

| Data | Official source |
|---|---|
| Token discovery, metadata, logo | ICRC API `/api/v2/ledgers` |
| Price (USD), 24h/7d change, FDV/market cap, 7d volume | ICRC API `/api/v2/ledgers` (`token_value` block) — **no ICPSwap call needed** |
| Total supply / circulating supply | ICRC API `/total-supply`, `/circulating-supply` |
| Holder count / top holders | ICRC API `/holders`, `/holders/count` |
| Sparkline / historical price | ICRC API `/token-values` |
| **Pool list, per-pool TVL, pool canister id** | ICPSwap `/info/pool/all` |
| **Recent swaps feed** | ICPSwap `/info/transaction/find` |
| Token-level 24h volume cross-check | ICPSwap `/info/token/all` (compare against ICRC's `volume_24h_usd`; they may differ since ICRC sources from CoinMarketCap per the `source` field, ICPSwap is on-chain-only) |
| Native ICP accounts/supply | Ledger API (`ledger-api.internetcomputer.org`) |
| ICP/USD headline rate | IC Dashboard `/api/v3/icp-usd-rate` |
| Canister type verification (is this really a `ledger`) | IC Dashboard `/api/v4/canisters?canister_type=ledger` |

Two independent official price sources (ICRC API pulls from CoinMarketCap per its `source` field; ICPSwap gives on-chain DEX price) is actually a feature — cross-check them and flag a token if they diverge by more than, say, 10%, as a data-quality signal, same idea icptokens itself used internally but you get it for free from having two official sources instead of one scraped one.

---

## 4. Updated `/api/v1/markets/tokens` row shape (official-only)

```json
{
  "canister_id": "ryjl3-tyaaa-aaaaa-aaaba-cai",
  "symbol": "ICP",
  "name": "Internet Computer",
  "logo": "https://...",
  "decimals": 8,
  "price_usd": 2.29,
  "price_change_24h": 0.0342,
  "volume_24h_usd": 3850000,
  "volume_7d_usd": 24500000,
  "market_cap_fdv_usd": 1260000000,
  "circulating_supply": 500000000,
  "total_supply": 550000000,
  "holder_count": 327325,
  "pool_tvl_usd": 250000,
  "pool_id": "p2gzi-iyaaa-aaaag-qneta-cai",
  "sparkline_24h": [2.26, 2.28, 2.31, 2.29]
}
```

Build order per row:
1. `ICRC /api/v2/ledgers` → symbol, name, logo, price_usd, price_change_24h, volume_24h_usd, volume_7d_usd, fdv_usd → market_cap_fdv_usd
2. `ICRC /circulating-supply` + `/total-supply` → supply fields
3. `ICRC /holders/count` → holder_count
4. `ICPSwap /info/pool/all` filtered to this token → pool_tvl_usd, pool_id (only if a pool exists — some tokens are ICRC ledgers with no active pool, in which case leave these null rather than "No pool" placeholder text)
5. `ICRC /token-values` (last 24h) → sparkline_24h

---

## 5. Rate limits — what's actually documented for the official stack

Nothing in DFINITY's own docs for icrc-api / ic-api / ledger-api / sns-api states a fixed per-minute quota the way icptokens explicitly publishes (30/min free). That doesn't mean unlimited — batch and cache anyway (your Go backend polling on a schedule into Postgres, per the architecture in `trading-tokens.md` §6, is still the right move so your Next.js frontend never calls these upstream APIs directly). But you're no longer racing a published 30-requests-per-minute ceiling shared across whatever else uses your Free-tier key.

ICPSwap's info API likewise publishes no explicit rate limit in its docs — same caching advice applies: poll it on an interval from your backend, don't call it per-user-per-pageview.