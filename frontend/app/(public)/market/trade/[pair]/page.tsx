import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { TradeTerminal } from "@/components/public/market/trade/trade-terminal"
import { fetchIcpswapTokenAll } from "@/services/market/icpswapStats"
import {
  resolveListedToken,
  tradePairJsonLd,
  tradePairMetadata,
  uniquePairSlugs,
} from "@/lib/market/tradeSeo"

export const instant = false

export async function generateStaticParams() {
  if (process.env.ICP_STATIC_EXPORT === "1") {
    const listed = await fetchIcpswapTokenAll()
    const slugs = uniquePairSlugs(listed).slice(0, 250)
    if (slugs.length > 0) return slugs.map((pair) => ({ pair }))
  }
  return [{ pair: "CKBTC_ICP" }]
}

type PageProps = {
  params: Promise<{ pair: string }>
  searchParams: Promise<{ base?: string }>
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { pair } = await params
  const { base } = await searchParams
  const listed = await fetchIcpswapTokenAll()
  const token = resolveListedToken(pair, listed, base)
  return tradePairMetadata(token)
}

function TerminalFallback() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-[60vh] w-full rounded-xl" />
    </div>
  )
}

export default async function MarketTradePairPage({ params, searchParams }: PageProps) {
  const { pair } = await params
  const { base } = await searchParams
  const listed = await fetchIcpswapTokenAll()
  const token = resolveListedToken(pair, listed, base)
  const jsonLd = token ? tradePairJsonLd(token) : null

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <div className="h-[calc(100svh-3.5rem)] overflow-hidden">
        <Suspense fallback={<TerminalFallback />}>
          <TradeTerminal />
        </Suspense>
      </div>
    </>
  )
}
