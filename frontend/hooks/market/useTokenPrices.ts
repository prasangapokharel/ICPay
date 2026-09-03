"use client"

import useSWR from "swr"
import { fetchTokenPrices, type TokenPrice } from "@/services/market/tokenPrice"

export function useTokenPrices(ledgerIds: string[]) {
  const key = ledgerIds.length > 0 ? ["token-prices", ...ledgerIds.slice().sort()] : null

  const { data, isLoading } = useSWR(
    key,
    () => fetchTokenPrices(ledgerIds),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
      keepPreviousData: true,
    }
  )

  return {
    prices: data ?? new Map<string, TokenPrice>(),
    isLoading,
  }
}
