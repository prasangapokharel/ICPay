"use client"

import useSWR from "swr"
import type { MarketStats } from "@/services/market/marketStats"

async function fetcher(): Promise<MarketStats> {
  const res = await fetch("/api/market/stats")
  if (!res.ok) throw new Error("Failed to fetch market stats")
  return res.json()
}

export function useMarketStats() {
  const { data, error, isLoading } = useSWR<MarketStats>("/api/market/stats", fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  })

  return {
    stats: data ?? null,
    isLoading,
    error,
  }
}
