"use client"

import { useEffect } from "react"
import { liveTradeTitle } from "@/lib/market/tradeSeo"

export function TradeSeoHead({
  symbol,
  quoteSymbol,
  name,
  priceUsd,
}: {
  symbol: string
  quoteSymbol: string
  name: string
  priceUsd?: number | null
}) {
  useEffect(() => {
    document.title = liveTradeTitle({ symbol, quoteSymbol, name, priceUsd })
  }, [symbol, quoteSymbol, name, priceUsd])
  return null
}
