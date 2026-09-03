import type { Metadata } from "next"
import { MarketRankings } from "@/components/public/market/market-rankings"

export const metadata: Metadata = {
  title: "Market Rankings - ICPay",
  description: "Hot coins, top gainers, top losers, and top volume tokens on Internet Computer",
}

export default function RankingPage() {
  return <MarketRankings />
}
