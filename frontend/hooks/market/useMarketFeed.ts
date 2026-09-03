"use client"

import useSWR from "swr"
import type { MarketFeedBundle } from "@/lib/market/feedHighlights"

const EMPTY: MarketFeedBundle = { trending: [], newListings: [], gainers: [] }

async function loadMarketFeed(): Promise<MarketFeedBundle> {
  const res = await fetch("/api/market/feed")
  if (!res.ok) return EMPTY
  return (await res.json()) as MarketFeedBundle
}

export function useMarketFeed() {
  const { data, error, isLoading } = useSWR("market-feed", loadMarketFeed, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300_000,
    keepPreviousData: true,
  })
  return { feed: data ?? EMPTY, isLoading, error }
}
