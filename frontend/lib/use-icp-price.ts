"use client"

import useSWR from "swr"

const PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd&include_24hr_change=true"

export type IcpPrice = {
  usd: number
  change24h: number
}

// A constant key, so every component that asks for the price shares one cache
// entry and one request.
const PRICE_KEY = "icp-price"

export function useIcpPrice(): { price: IcpPrice | null; loading: boolean } {
  const { data, isLoading } = useSWR<IcpPrice | null>(
    PRICE_KEY,
    async () => {
      const res = await fetch(PRICE_URL)
      if (!res.ok) throw new Error(String(res.status))
      const json = await res.json()
      const row = json?.["internet-computer"]
      if (typeof row?.usd !== "number") return null
      return { usd: row.usd, change24h: row.usd_24h_change ?? 0 }
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
    }
  )

  return { price: data ?? null, loading: isLoading }
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  })
}

// Micro-balances (a fraction of a cent) must not collapse to "$0.00", which
// reads as "worthless". Sub-cent values show extra precision instead.
export function formatUsdPrecise(value: number): string {
  if (value > 0 && value < 0.01) {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumSignificantDigits: 3,
    })
  }
  return formatUsd(value)
}
