"use client"

import useSWR from "swr"
import { fetchPoolsByToken } from "@/services/market/icpswapPool"

export function useTokenPools(tokenLedgerId: string | null | undefined) {
  const { data, error, isLoading } = useSWR(
    tokenLedgerId ? ["token-pools-icpswap", tokenLedgerId] : null,
    () => fetchPoolsByToken(tokenLedgerId!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 120_000,
      keepPreviousData: true,
    }
  )

  return {
    pools: data ?? [],
    isLoading,
    error,
  }
}
