# Advanced ICP market terminal — UI plan

Public route: `/market/trade`  
App execution (wallet): `/trade?from=&to=`

## Goals

- Binance-style **read-only terminal** for ICP pairs (any visitor).
- **Resizable panels** on desktop; stacked layout on mobile.
- Live data from **ICPSwap** (pools, quotes, USD stats) + **DFINITY public APIs** (ledger/ICRC facts).
- One-click path to **ICPay wallet trade** when signed in.

## Data sources

| Layer | API | Used for |
|---|---|---|
| **ICPSwap REST** | `https://api.icpswap.com/token/{ledgerId}` | USD price, 24h change, TVL, volume, tx count |
| **ICPSwap canister** | SwapFactory `getPool` + SwapPool `quote` (anonymous agent) | Pool id, fee tier, live swap quote |
| **ICRC ledger** | `icrcLedger` via agent (browser) | Symbol, decimals, transfer fee, total supply |
| **DFINITY ICRC API** | `https://icrc-api.internetcomputer.org` | Optional enrichment; ledger calls preferred in-app |
| **DFINITY Metrics API** | `https://metrics-api.internetcomputer.org` | ICP/USD context (existing `useIcpPrice`) |

See `docs/official/dfinity/readme` for OpenAPI links.

## Layout (desktop)

```
┌──────────────────────────────────────────────────────────────────┐
│ Pair toolbar — symbol, price, 24h %, volume, pool fee            │
├──────────┬───────────────────────────────────────┬───────────────┤
│ Markets  │ Chart + 24h range                     │ Order panel   │
│ watchlist│ (resizable height)                    │ Buy / Sell    │
│ ~18%     ├───────────────────────────────────────┤ amount in/out │
│          │ Tabs: Pool · Token · Pair             │ quote preview │
│          │ TVL, volume, pool id, ledger links    │ → Open trade  │
└──────────┴───────────────────────────────────────┴───────────────┘
        horizontal resizable ────────────────────────────────►
```

## Component map

| File | Role |
|---|---|
| `trade-terminal.tsx` | Resizable shell, pair state, breakpoints |
| `trade-pair-toolbar.tsx` | Selected pair header + stats |
| `trade-market-watchlist.tsx` | ICP pairs list, search, selection |
| `trade-chart-panel.tsx` | 24h range visual (phase 1); candles later |
| `trade-info-tabs.tsx` | Pool / token / pair metadata |
| `trade-order-panel.tsx` | Amount, quote, CTA to `/trade` |

## Services & hooks

| Path | Role |
|---|---|
| `lib/market/tradePairs.ts` | Default ICP-quoted pairs |
| `services/market/icpswapStats.ts` | ICPSwap token stats fetch |
| `services/market/tradePairSnapshot.ts` | Pool + quote + stats bundle |
| `hooks/market/useTradeTerminal.ts` | SWR for pair list + active pair |

## Phases

| Phase | Scope |
|---|---|
| **1 (this)** | Layout, watchlist, stats, live quote, link to wallet trade |
| **2** | OHLC candles if ICPSwap history endpoint is wired |
| **3** | Signed-in inline swap on this page (reuse `runTrade`) |
| **4** | Order book / recent trades (needs indexer or pool events) |

## URL params

- `?base={ledgerId}` — non-ICP leg; quote is always ICP.
- Example: `/market/trade?base=mxzaz-hqaaa-aaaar-qaada-cai` → ckBTC/ICP.

## Flexibility

- Panels persist default sizes; no localStorage yet (phase 2).
- Pair list driven from `TERMINAL_PAIR_SEEDS` + registry tokens with ICPSwap liquidity.
- Chart panel is swappable without touching order panel.
