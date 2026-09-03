import { NextResponse } from "next/server"
import { fetchMarketStats } from "@/services/market/marketStats"

export async function GET() {
  try {
    const stats = await fetchMarketStats()
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error("[api/market/stats] Error:", error)
    return NextResponse.json(
      {
        totalVolume24h: 0,
        totalTvl: 0,
        totalTokens: 0,
        totalHolders: 0,
        totalTransactions7d: 0,
        avgPriceChange24h: 0,
      },
      { status: 500 }
    )
  }
}
