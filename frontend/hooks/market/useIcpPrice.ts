"use client"

import useSWR from "swr"
import type { IcpPrice } from "@/lib/icp-price"

const PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true"

// A constant key, so every component that asks for the price shares one cache
// entry and one request.
const PRICE_KEY = "icp-price"

export function useIcpPrice(
  opts?: { refreshInterval?: number }
): { price: IcpPrice | null; loading: boolean } {
  const { data, isLoading } = useSWR<IcpPrice | null>(
    PRICE_KEY,
    async () => {
      const res = await fetch(PRICE_URL)
      if (!res.ok) throw new Error(String(res.status))
      const json = await res.json()
      const row = json?.["internet-computer"]
      if (typeof row?.usd !== "number") return null
      return {
        usd: row.usd,
        change24h: row.usd_24h_change ?? 0,
        marketCap: row.usd_market_cap ?? 0,
        volume24h: row.usd_24h_vol ?? 0,
      }
    },
    {
      // The price is decorative and CoinGecko rate-limits anonymous callers, so
      // it is held for five minutes and never refetched on focus or remount.
      dedupingInterval: 300_000,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
      ...(opts?.refreshInterval
        ? { refreshInterval: opts.refreshInterval }
        : {}),
    }
  )

  return { price: data ?? null, loading: isLoading }
}
