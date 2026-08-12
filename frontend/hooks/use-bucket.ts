"use client"

import { useCallback } from "react"
import useSWR from "swr"
import useSWRImmutable from "swr/immutable"
import { useSWRConfig } from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { FILES_PAGE_SIZE } from "@/lib/bucket/bucket"
import {
  bucketCycleKey,
  bucketFilesKey,
  bucketListKey,
  bucketPriceKey,
  bucketRenewQuoteKey,
  bucketStatsKey,
  isBucketCacheKey,
} from "@/lib/bucket/cache-keys"
import {
  getBucketCycleStatus,
  getBucketPrice,
  getBucketStats,
  getRenewQuote,
  listBuckets,
  listFiles,
} from "@/services/bucket/bucket"

const QUERY = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
  errorRetryCount: 3,
} as const

export function useInvalidateBucketCache() {
  const { mutate } = useSWRConfig()
  const { identity } = useAuth()

  return useCallback(async () => {
    if (!identity) return
    // Revalidate in place — never pass undefined or the UI blanks while fetching.
    await mutate((key) => isBucketCacheKey(key, identity))
  }, [identity, mutate])
}

export function useBucketList() {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    bucketListKey(identity),
    () => listBuckets(identity),
    { ...QUERY, keepPreviousData: true, dedupingInterval: 30_000 }
  )

  return { buckets: data ?? [], error, isLoading, refresh: mutate }
}

export function useBucketStats(bucketId: string | null) {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    bucketId ? bucketStatsKey(identity, bucketId) : null,
    () => getBucketStats(identity!, bucketId!),
    { ...QUERY, keepPreviousData: true, dedupingInterval: 15_000 }
  )

  const initialLoad = isLoading && data === undefined

  return { stats: data ?? null, error, isLoading: initialLoad, refresh: mutate }
}

export function useBucketFiles(bucketId: string | null, page: number) {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    bucketId ? bucketFilesKey(identity, bucketId, page) : null,
    () => listFiles(identity!, bucketId!, page, FILES_PAGE_SIZE),
    { ...QUERY, keepPreviousData: true, dedupingInterval: 10_000 }
  )

  const total = data ? Number(data.total) : 0
  const pageSize = data ? Number(data.pageSize) : FILES_PAGE_SIZE
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const initialLoad = isLoading && data === undefined

  return {
    files: data?.items ?? [],
    total,
    page: data ? Number(data.page) : page,
    pageSize,
    totalPages,
    error,
    isLoading: initialLoad,
    refresh: mutate,
  }
}

export function useBucketPrice(capacityGB: number | null) {
  const { identity } = useAuth()

  const { data, isLoading } = useSWR(
    capacityGB !== null ? bucketPriceKey(identity, capacityGB) : null,
    () => getBucketPrice(identity!, capacityGB!),
    { ...QUERY, dedupingInterval: 60_000 }
  )

  const price = data && "ok" in data ? data.ok : null
  const priceError = data && "err" in data ? data.err : null

  return { price, priceError, isLoading: capacityGB !== null && isLoading }
}

export function useRenewQuote(bucketId: string | null, enabled: boolean) {
  const { identity } = useAuth()

  const { data, isLoading, mutate } = useSWR(
    enabled && bucketId ? bucketRenewQuoteKey(identity, bucketId) : null,
    () => getRenewQuote(identity!, bucketId!),
    { ...QUERY, dedupingInterval: 5_000 }
  )

  return { quote: data ?? null, isLoading: enabled && isLoading, refresh: mutate }
}

export function useBucketCycleStatus() {
  const { identity } = useAuth()

  const { data, isLoading } = useSWRImmutable(bucketCycleKey(identity), () =>
    getBucketCycleStatus(identity)
  )

  return { cycleStatus: data ?? null, isLoading }
}
