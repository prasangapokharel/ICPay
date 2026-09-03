import { NextResponse } from "next/server"
import { fetchMarketFeedBundle } from "@/services/market/marketFeed"

export async function GET() {
  try {
    const body = await fetchMarketFeedBundle()
    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    })
  } catch {
    return NextResponse.json(
      { trending: [], newListings: [], gainers: [] },
      { status: 502 }
    )
  }
}
