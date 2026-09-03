"use client"

import useSWR from "swr"
import { terminalPairKey } from "@/lib/market/tradePairs"
import {
  fetchTerminalPairs,
  fetchTradePairSnapshot,
} from "@/services/market/tradePairSnapshot"
import { ohlcWindowQuery, type ChartWindow } from "@/lib/market/ohlc"
import { fetchIcpswapOhlc } from "@/services/market/icpswapChart"
import type { IcpswapTokenStats } from "@/services/market/icpswapStats"

export function useTerminalWatchlist() {
  const { data, error, isLoading } = useSWR("terminal-watchlist", fetchTerminalPairs, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300_000,
    keepPreviousData: true,
  })

  return { rows: data ?? [], isLoading, error }
}

export function useIcpswapOhlc(ledgerId: string | undefined, window: ChartWindow) {
  const { level, limit } = ohlcWindowQuery(window)
  const { data, error, isLoading } = useSWR(
    ledgerId ? (["icpswap-ohlc", ledgerId, level, String(limit)] as const) : null,
    () => fetchIcpswapOhlc(ledgerId!, level, limit),
    { revalidateOnFocus: false, dedupingInterval: 120_000, keepPreviousData: true }
  )
  return { bars: data ?? [], isLoading, error }
}

export function useTradePairSnapshot(
  baseLedgerId: string | null,
  cachedStats?: IcpswapTokenStats | null
) {
  const key = baseLedgerId ? terminalPairKey(baseLedgerId) : null
  const { data, error, isLoading, mutate } = useSWR(
    key ? ["terminal-pair", key] : null,
    () => fetchTradePairSnapshot(baseLedgerId!, cachedStats),
    { revalidateOnFocus: false, dedupingInterval: 60_000, revalidateIfStale: false, keepPreviousData: true }
  )

  return { snapshot: data, isLoading, error, refresh: mutate }
}

export { TERMINAL_QUOTE_LEDGER_ID } from "@/lib/market/tradePairs"
