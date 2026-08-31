"use client"

import useSWR from "swr"
import { terminalPairKey } from "@/lib/market/tradePairs"
import {
  fetchTerminalPairs,
  fetchTradePairSnapshot,
} from "@/services/market/tradePairSnapshot"

export function useTerminalWatchlist() {
  const { data, error, isLoading } = useSWR("terminal-watchlist", fetchTerminalPairs, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  return { rows: data ?? [], isLoading, error }
}

export function useTradePairSnapshot(baseLedgerId: string | null) {
  const key = baseLedgerId ? terminalPairKey(baseLedgerId) : null
  const { data, error, isLoading, mutate } = useSWR(
    key ? ["terminal-pair", key] : null,
    () => fetchTradePairSnapshot(baseLedgerId!),
    { revalidateOnFocus: false, dedupingInterval: 20_000 }
  )

  return { snapshot: data, isLoading, error, refresh: mutate }
}

export { TERMINAL_QUOTE_LEDGER_ID } from "@/lib/market/tradePairs"
