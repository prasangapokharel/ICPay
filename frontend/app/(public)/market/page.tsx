import type { Metadata } from "next"
import { fetchIcpswapTokenAll } from "@/services/market/icpswapStats"
import {
  marketIndexMetadata,
  marketItemListJsonLd,
} from "@/lib/market/tradeSeo"
import { MarketOverview } from "@/components/public/market/market-overview"

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const listed = await fetchIcpswapTokenAll()
  return marketIndexMetadata(listed.length)
}

export default async function MarketPage() {
  const listed = await fetchIcpswapTokenAll()
  const jsonLd = marketItemListJsonLd(listed)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketOverview />
    </>
  )
}
