"use client"

import useSWR from "swr"
import {
  TERMINAL_PAIR_SEEDS,
  TERMINAL_QUOTE_LEDGER_ID,
  terminalPairKey,
} from "@/lib/market/tradePairs"
import { fetchIcpswapTokenStats } from "@/services/market/icpswapStats"
import { fetchTradePairSnapshot } from "@/services/market/tradePairSnapshot"

export function useTerminalWatchlist() {
  const { data, error, isLoading } = useSWR(
    "terminal-watchlist",
    async () => {
      const rows = await Promise.all(
        TERMINAL_PAIR_SEEDS.map(async (seed) => {
          const stats = await fetchIcpswapTokenStats(seed.baseLedgerId)
          return { ...seed, stats }
        })
      )
      return rows
    },
    { revalidateOnFocus: false, dedupingInterval: 30_000 }
  )

  return { rows: data ?? [], isLoading, error }
}

export function useTradePairSnapshot(baseLedgerId: string | null) {
  const key = baseLedgerId ? terminalPairKey(baseLedgerId) : null
  const { data, error, isLoading, mutate } = useSWR(
    key ? ["terminal-pair", key] : null,
    () => fetchTradePairSnapshot(baseLedgerId!),
    { revalidateOnFocus: false, dedupingInterval: 15_000 }
  )

  return { snapshot: data, isLoading, error, refresh: mutate }
}

export { TERMINAL_QUOTE_LEDGER_ID }
