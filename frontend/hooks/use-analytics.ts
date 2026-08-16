"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { getUserAnalytics, type AnalyticsData } from "@/services/analytics/analytics"

export function useAnalytics(enabled: boolean): {
  data: AnalyticsData | undefined
  error: Error | undefined
  isLoading: boolean
  refresh: () => void
} {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    enabled && identity ? "user-analytics" : null,
    () => getUserAnalytics(identity),
    {
      dedupingInterval: 60_000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  )

  return { data, error, isLoading, refresh: mutate }
}
