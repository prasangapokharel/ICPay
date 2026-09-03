"use client"

import useSWR from "swr"
import type { MarketStats } from "@/services/market/marketStats"
import { usePageVisible } from "@/hooks/live/usePageVisible"

async function fetcher(): Promise<MarketStats> {
  const res = await fetch("/api/market/stats")
  if (!res.ok) throw new Error("Failed to fetch market stats")
  return res.json()
}

export function useMarketStats() {
  const pageVisible = usePageVisible()
  const { data, error, isLoading } = useSWR<MarketStats>("/api/market/stats", fetcher, {
    refreshInterval: pageVisible ? 60_000 : 0,
    revalidateOnFocus: false,
  })

  return {
    stats: data ?? null,
    isLoading,
    error,
  }
}
