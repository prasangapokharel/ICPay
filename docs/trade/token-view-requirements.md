# Token Trading View - Complete Data Requirements

## Current Status

### ✅ Already Implemented:
1. **Token List** - Using ICRC API v2 (`https://icrc-api.internetcomputer.org/api/v2/ledgers`)
2. **Price Chart** - Using ICPSwap Token Chart API
3. **Basic Token Info** - Symbol, Name, Decimals, Fee, Total Supply, Standards
4. **Enhanced Metadata** - Single parallel fetch with batch loading

### ❌ Missing/Incomplete:

## 1. Token Header Metrics (Top Bar)

**Current:** Price, 24h Change
**Missing:**
```typescript
{
  marketCap: number        // Price × Circulating Supply
  fdv: number             // token_value.fdv_usd from ICRC API
  volume24h: number       // token_value.volume_24h_usd (display prominently)
  volume7d: number        // token_value.volume_7d_usd
  holders: number         // unique_owners_count
  holdersChange24h: number // unique_owners_count_change_24h
}
```

**API Source:** ICRC API v2 - Already in response, just extract it!
```bash
curl "https://icrc-api.internetcomputer.org/api/v2/ledgers/2ouva-viaaa-aaaaq-aaamq-cai"
```

---

## 2. Pool Tab - **CURRENTLY BROKEN ("No pool" shown)**

**Problem:** Not using ICPSwap Pool API
**Solution:** Integrate ICPSwap Pool endpoints

### A. Get All Pools
```bash
curl "https://api.icpswap.com/info/pool/all"
```

**Response Fields:**
```typescript
{
  poolId: string              // Pool canister ID ⭐ PRIMARY FIELD
  poolFee: number            // Fee tier (e.g., 3000 = 0.3%)
  token0Symbol: string
  token1Symbol: string
  tvlUSD: string            // Total Value Locked
  volumeUSD24H: string      // 24h volume
  volumeUSD7D: string       // 7d volume
  txCount24H: string        // Transaction count
  priceLow24H: string       // 24h low
  priceHigh24H: string      // 24h high
}
```

### B. Pool Chart (Optional - for Pool performance chart)
```bash
curl "https://api.icpswap.com/info/pool/{poolId}/chart/h1?page=1&limit=24"
```

**Response:** Full OHLC data per hour/day
```typescript
{
  open: string
  high: string
  low: string
  close: string
  volumeUSD: string
  tvlUSD: string
  beginTime: number
  endTime: number
}
```

---

## 3. Token Tab - Enhanced Information

**Current:** Basic metadata
**Add:**

```typescript
{
  // From ICRC API (already available):
  tokenType: string              // "sns" | "chain_key" | "one_sec" | "icrc"
  circulatingSupply?: string     // If different from total
  maxSupply?: string            // If capped
  holders: number               // unique_owners_count
  holdersChange24h: number      // unique_owners_count_change_24h
  transactions7d: number        // total_transactions_count_over_past_7d
  volume7d: string             // total_volume_over_past_7d
  
  // Links (from ICRC API urls field):
  website?: string[]
  twitter?: string[]
  explorer?: string[]
  sourceCode?: string[]
  chat?: string[]
  announcement?: string[]
}
```

---

## 4. Chart - Already Working ✅

**Current Implementation:**
```typescript
// frontend/services/market/icpswapChart.ts
fetchIcpswapOhlc(ledgerId, level, limit)
// Uses: https://api.icpswap.com/info/token/{ledgerId}/chart/{level}
```

**Available Levels:**
- `h1` - Hourly (for 24h view)
- `d1` - Daily (for 7d view)
- `m1` - Minute (for real-time)

**Data Returned:**
```typescript
{
  time: number      // Timestamp
  open: number
  high: number
  low: number
  close: number
  volumeUsd: number
}
```

---

## 5. Recent Swaps Panel

**Current:** Shows some data
**Enhance with:** ICPSwap Transaction API

```bash
curl "https://api.icpswap.com/info/transaction/find?poolId={poolId}&page=1&limit=20&actionTypes=Swap"
```

**Fields:**
```typescript
{
  action: "Swap" | "AddLiquidity" | "RemoveLiquidity"
  token0Amount: string
  token1Amount: string
  token0Symbol: string
  token1Symbol: string
  amountUSD: string
  account: string        // Principal
  timestamp: number
  transactionId: string  // Make clickable to explorer
}
```

---

## 6. Priority Implementation Order

### Phase 1 - Critical (Fix broken UI)
1. **Fix Pool Tab** - Integrate ICPSwap Pool API
   - File: `services/market/icpswapPool.ts` (create)
   - Hook: `hooks/market/usePoolData.ts` (create)
   - Component: Update `trade-info-tabs.tsx` Pool tab

2. **Add Token Header Metrics** - Extract from existing ICRC API response
   - Market Cap & FDV
   - Holders count + 24h change
   - Display volume prominently

### Phase 2 - Enhanced Info
3. **Token Type Badge** - Show SNS/Chain-key/ICRC badge
4. **Social Links** - Website, Twitter, Explorer from ICRC `urls`
5. **Transaction Count (7d)** - From ICRC API

### Phase 3 - Nice to Have
6. **Holder Growth Chart** - Historical holders data
7. **Multiple Pools** - If token has >1 pool, show all
8. **Pool Performance Chart** - TVL/Volume over time

---

## API Endpoint Summary

| Data Needed | API Endpoint | Status |
|-------------|-------------|--------|
| Token List | `icrc-api.internetcomputer.org/api/v2/ledgers` | ✅ Using |
| Token Metadata | ICRC API v2 (same as above) | ✅ Using |
| Token Price/Volume | ICRC API v2 `token_value` field | ✅ Have, need to display |
| Token Holders | ICRC API v2 `unique_owners_count` | ✅ Have, need to display |
| Token Links | ICRC API v2 `urls` field | ✅ Have, need to display |
| **Pool Data** | `api.icpswap.com/info/pool/all` | ❌ **NOT USING** |
| **Pool Chart** | `api.icpswap.com/info/pool/{id}/chart/{level}` | ❌ Optional |
| Token Chart | `api.icpswap.com/info/token/{id}/chart/{level}` | ✅ Using |
| Recent Swaps | `api.icpswap.com/info/transaction/find` | ⚠️ Partial |

---

## Implementation Files

### New Files to Create:
```
services/market/icpswapPool.ts    - Pool API client
hooks/market/usePoolData.ts       - Pool data hook
```

### Files to Update:
```
components/public/market/trade/trade-info-tabs.tsx  - Pool tab UI
components/public/market/trade/trade-pair-toolbar.tsx - Add header metrics
services/market/tradePairSnapshot.ts - Include pool data
```

---

## Sample Implementation

### 1. Create Pool Service
```typescript
// services/market/icpswapPool.ts
export type IcpswapPool = {
  poolId: string
  poolFee: number
  token0Symbol: string
  token1Symbol: string
  tvlUSD: string
  volumeUSD24H: string
  volumeUSD7D: string
  priceLow24H: string
  priceHigh24H: string
}

export async function fetchPoolsByToken(
  tokenLedgerId: string
): Promise<IcpswapPool[]> {
  const res = await fetch('https://api.icpswap.com/info/pool/all')
  const body = await res.json()
  
  return body.data.filter((pool: any) => 
    pool.token0LedgerId === tokenLedgerId ||
    pool.token1LedgerId === tokenLedgerId
  )
}
```

### 2. Use in Component
```typescript
// components/public/market/trade/trade-info-tabs.tsx
import { usePoolData } from '@/hooks/market/usePoolData'

const { pools, isLoading } = usePoolData(snapshot.baseLedgerId)

// Display in Pool tab:
{pools.map(pool => (
  <div key={pool.poolId}>
    <InfoRow label="Pool ID" value={pool.poolId} />
    <InfoRow label="Fee Tier" value={`${pool.poolFee / 10000}%`} />
    <InfoRow label="TVL" value={formatUsd(pool.tvlUSD)} />
    <InfoRow label="Volume 24h" value={formatUsd(pool.volumeUSD24H)} />
  </div>
))}
```

---

## Summary

**Everything needed is available in official APIs:**
- ✅ ICRC API v2 - Token metadata, holders, volume, links
- ✅ ICPSwap Info API - Pools, charts, transactions
- ✅ All endpoints are public, no auth needed

**Main issue:** Pool data not integrated - showing "No pool" when pools exist!

**Next step:** Create pool service and hook to fetch and display ICPSwap pool data.
