# Advanced ICP market terminal — UI plan

Public route: `/market/trade`  
Wallet execution: `/trade?from=&to=`

## Data sources (all real — no mock data)

| Layer | Package / API | Data |
|---|---|---|
| **ICRC-1 ledger** | `@icp-sdk/canisters/ledger/icrc` (`IcrcLedgerCanister`) | name, symbol, decimals, fee, total supply, minting account, supported standards, index principal |
| **ICRC public API** | `https://icrc-api.internetcomputer.org/api/v1/ledgers/{id}` | Logo URL, supply cross-check (DFINITY official) |
| **ICPSwap REST** | `https://api.icpswap.com/token/{ledgerId}` | USD price, 24h/7d range, TVL, volume, tx count |
| **ICPSwap canister** | `lib/swap/icpswap.ts` (anonymous agent) | Pool id, fee tier, live `quote` |
| **Trade quote** | `services/trade/quote.ts` | Full net-out quote for order panel |

See `docs/official/dfinity/2.md` for ICRC fields to store per token.

## Layout (desktop)

```
┌ Pair toolbar — live USD + on-chain ICP price, volume, TVL ─────┐
├ Markets ├ Chart (24h low · now · high from ICPSwap) ├ Order ──┤
│ watch   ├ Pool / Token / Pair tabs (ICRC + pool facts) │ panel │
└─────────┴────────────────────────────────────────────┴───────┘
```

Resizable via `components/ui/resizable.tsx`.

## Services

| File | Role |
|---|---|
| `services/market/icrcLedgerFacts.ts` | On-chain ICRC + ICRC API enrichment |
| `services/market/icpswapStats.ts` | ICPSwap market stats |
| `services/market/tradePairSnapshot.ts` | Pair bundle + pool resolution |
| `hooks/market/useTradeTerminal.ts` | SWR for watchlist + active pair |

## URL

`?base={ledgerId}` — quote is always ICP (`ryjl3-tyaaa-aaaaa-aaaba-cai`).

## Phases

| Phase | Status |
|---|---|
| Real ICRC + ICPSwap data, resizable terminal | **Done** |
| OHLC candles (needs ICPSwap history API) | Next |
| Inline `runTrade` on this page | Next |
| Order book / trades feed | Future |
