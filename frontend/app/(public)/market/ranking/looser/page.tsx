import type { Metadata } from "next"
import { MarketRankingDetail } from "@/components/public/market/market-ranking-detail"

export const metadata: Metadata = {
  title: "Top Losers - ICPay",
  description: "Top losing tokens on Internet Computer by 24h price change",
}

export default function LoserPage() {
  return <MarketRankingDetail type="loser" />
}
