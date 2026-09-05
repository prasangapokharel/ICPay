"use client"

import { useEffect, useMemo } from "react"
import useSWR from "swr"
import { useSavedCanisters } from "@/hooks/canister/useSavedCanisters"
import { rememberCanister } from "@/lib/canister/savedCanisters"
import {
  fetchControlledCanisters,
  type ControlledCanister,
} from "@/services/canister/controlledCanisters"

export function useMineCanisters(principal: string | null | undefined) {
  const key = principal?.trim() || null
  const saved = useSavedCanisters(key)

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key ? (["controlled-canisters", key] as const) : null,
    ([, controller]) => fetchControlledCanisters(controller),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
      keepPreviousData: true,
    }
  )

  useEffect(() => {
    if (!key || !data?.items.length) return
    for (const item of data.items) rememberCanister(key, item.canisterId)
  }, [key, data])

  const metaById = useMemo(() => {
    const map = new Map<string, ControlledCanister>()
    for (const item of data?.items ?? []) map.set(item.canisterId, item)
    return map
  }, [data])

  const ids = useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const item of data?.items ?? []) {
      if (seen.has(item.canisterId)) continue
      seen.add(item.canisterId)
      out.push(item.canisterId)
    }
    for (const id of saved) {
      if (seen.has(id)) continue
      seen.add(id)
      out.push(id)
    }
    return out
  }, [data, saved])

  return {
    ids,
    metaById,
    networkTotal: data?.total ?? 0,
    isLoading: Boolean(key) && isLoading && !data,
    isValidating,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    refresh: () => mutate(),
  }
}
