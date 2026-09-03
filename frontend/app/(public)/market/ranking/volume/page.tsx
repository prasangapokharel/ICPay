import type { Metadata } from "next"
import { MarketRankingDetail } from "@/components/public/market/market-ranking-detail"

export const metadata: Metadata = {
  title: "Top Volume - ICPay",
  description: "Top tokens by 24h trading volume on Internet Computer",
}

export default function VolumePage() {
  return <MarketRankingDetail type="volume" />
}
