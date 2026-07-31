"use client"

import { useEffect, useState } from "react"

const PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd&include_24hr_change=true"

export type IcpPrice = {
  usd: number
  change24h: number
}

export function useIcpPrice(): { price: IcpPrice | null; loading: boolean } {
  const [price, setPrice] = useState<IcpPrice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const res = await fetch(PRICE_URL, { signal: controller.signal })
        if (!res.ok) throw new Error(String(res.status))
        const json = await res.json()
        const row = json?.["internet-computer"]
        if (typeof row?.usd === "number") {
          setPrice({ usd: row.usd, change24h: row.usd_24h_change ?? 0 })
        }
      } catch {
        // Price is decorative; a failure must not block the wallet balance.
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [])

  return { price, loading }
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  })
}
