import { fetchIcrcTokens, icrcPercentChange24h, isIcrcFetchAbort } from "./icrcApi"
import { fetchIcpswapProtocolStats } from "./icpswapProtocol"

export type MarketStats = {
  totalVolume24h: number
  totalTvl: number
  totalTokens: number
  totalHolders: number
  totalTransactions7d: number
  avgPriceChange24h: number
}

export async function fetchMarketStats(): Promise<MarketStats> {
  try {
    const [tokens, protocol] = await Promise.all([
      fetchIcrcTokens({ limit: 500, hasTransactions: true }),
      fetchIcpswapProtocolStats(),
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

    return {
      totalVolume24h: protocol?.volumeUsd24h || totalVolume24h,
      totalTvl: protocol?.tvlUsd || 0,
      totalTokens: tokens.length,
      totalHolders,
      totalTransactions7d,
      avgPriceChange24h: priceChangeCount > 0 ? priceChangeSum / priceChangeCount : 0,
    }
  } catch (err) {
    if (!isIcrcFetchAbort(err)) console.error("[marketStats] Failed to fetch stats:", err)
    return {
      totalVolume24h: 0,
      totalTvl: 0,
      totalTokens: 0,
      totalHolders: 0,
      totalTransactions7d: 0,
      avgPriceChange24h: 0,
    }
  }
}
