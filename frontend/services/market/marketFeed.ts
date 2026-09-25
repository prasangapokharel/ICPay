import { buildMarketFeedBundle, type MarketFeedBundle } from "@/lib/market/feedHighlights"
import { fetchIcrcTokens } from "@/services/market/icrcApi"
import { fetchRecentSnses } from "@/services/market/snsApi"

let feedCache: { data: MarketFeedBundle; expiresAt: number } | null = null

export async function fetchMarketFeedBundle(): Promise<MarketFeedBundle> {
  if (feedCache && Date.now() < feedCache.expiresAt) {
    return feedCache.data
  }

  const [tokens, snses] = await Promise.all([
    fetchIcrcTokens({ limit: 100, hasTransactions: true }),
    fetchRecentSnses(20),
  ])
  const bundle = buildMarketFeedBundle(tokens, snses)
  feedCache = { data: bundle, expiresAt: Date.now() + 60_000 }
  return bundle
}
