import { buildMarketFeedBundle, type MarketFeedBundle } from "@/lib/market/feedHighlights"
import { fetchIcrcTokens } from "@/services/market/icrcApi"
import { fetchRecentSnses } from "@/services/market/snsApi"

export async function fetchMarketFeedBundle(): Promise<MarketFeedBundle> {
  const [tokens, snses] = await Promise.all([
    fetchIcrcTokens({ limit: 300, hasTransactions: true }),
    fetchRecentSnses(30),
  ])
  return buildMarketFeedBundle(tokens, snses)
}
