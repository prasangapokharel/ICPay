import { fetchIcrcLedgersCount, fetchIcrcTokens, icrcPercentChange24h, isIcrcFetchAbort } from "./icrcApi"
import { fetchIcpswapProtocolStats } from "./icpswapProtocol"

export type MarketStats = {
  totalVolume24h: number
  totalTvl: number
  totalTokens: number
  totalHolders: number
  totalTransactions7d: number
  avgPriceChange24h: number
}

let statsCache: { data: MarketStats; expiresAt: number } | null = null

export async function fetchMarketStats(): Promise<MarketStats> {
  if (statsCache && Date.now() < statsCache.expiresAt) {
    return statsCache.data
  }

  try {
    const [tokens, protocol, totalCount] = await Promise.all([
      fetchIcrcTokens({ limit: 100, hasTransactions: true }),
      fetchIcpswapProtocolStats(),
      fetchIcrcLedgersCount(),
    ])

    let totalVolume24h = 0
    let totalHolders = 0
    let totalTransactions7d = 0
    let priceChangeSum = 0
    let priceChangeCount = 0

    for (const token of tokens) {
      if (token.token_value) {
        totalVolume24h += token.token_value.volume_24h_usd || 0
        const pct = icrcPercentChange24h(token.token_value)
        if (Number.isFinite(pct)) {
          priceChangeSum += pct
          priceChangeCount++
        }
      }
      totalHolders += token.unique_owners_count || 0
      totalTransactions7d += token.total_transactions_count_over_past_7d || 0
    }

    const result: MarketStats = {
      totalVolume24h: protocol?.volumeUsd24h || totalVolume24h,
      totalTvl: protocol?.tvlUsd || 0,
      totalTokens: totalCount > 0 ? totalCount : tokens.length,
      totalHolders,
      totalTransactions7d,
      avgPriceChange24h: priceChangeCount > 0 ? priceChangeSum / priceChangeCount : 0,
    }

    statsCache = { data: result, expiresAt: Date.now() + 60_000 }
    return result
  } catch (err) {
    if (!isIcrcFetchAbort(err)) console.error("[marketStats] Failed to fetch stats:", err)
    return statsCache?.data ?? {
      totalVolume24h: 0,
      totalTvl: 0,
      totalTokens: 0,
      totalHolders: 0,
      totalTransactions7d: 0,
      avgPriceChange24h: 0,
    }
  }
}
