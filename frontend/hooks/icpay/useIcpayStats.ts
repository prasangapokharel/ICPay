"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { fetchIcpayStats, type IcpayStats } from "@/services/icpay/icpay"
import { usePageVisible } from "@/hooks/live/usePageVisible"

// Market data moves, so this one revalidates on focus where the wallet hooks do
// not. It stays well inside every rate limit: one request per five minutes.
export function useIcpayStats(): { stats: IcpayStats | undefined; isLoading: boolean } {
  const { identity } = useAuth()
  const pageVisible = usePageVisible()

  const { data, isLoading } = useSWR("icpay-stats", () => fetchIcpayStats(identity), {
    dedupingInterval: 300_000,
    refreshInterval: pageVisible ? 300_000 : 0,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    shouldRetryOnError: false,
  })

  return { stats: data, isLoading }
}
