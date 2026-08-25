"use client"

import useSWR from "swr"
import type { IcpPrice } from "@/lib/market/icpPrice"
import { fetchIcpPrice } from "@/services/market/icpPrice"

const PRICE_KEY = "icp-price"

export function useIcpPrice(
  opts?: { refreshInterval?: number }
): { price: IcpPrice | null; loading: boolean } {
  const { data, isLoading } = useSWR<IcpPrice | null>(
    PRICE_KEY,
    () => fetchIcpPrice(),
    {
      dedupingInterval: 300_000,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
      ...(opts?.refreshInterval ? { refreshInterval: opts.refreshInterval } : {}),
    }
  )

  return { price: data ?? null, loading: isLoading }
}
