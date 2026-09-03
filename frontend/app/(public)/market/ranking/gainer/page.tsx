import type { Metadata } from "next"
import { MarketRankingDetail } from "@/components/public/market/market-ranking-detail"

export const metadata: Metadata = {
  title: "Top Gainers - ICPay",
  description: "Top gaining tokens on Internet Computer by 24h price change",
}

export default function GainerPage() {
  return <MarketRankingDetail type="gainer" />
}
