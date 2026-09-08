"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import {
  SNS_REGISTRY_DEDUPE_MS,
  SNS_REGISTRY_SWR_KEY,
} from "@/lib/sns/constants"
import { fetchSnsRegistryList, findSnsRegistryRow } from "@/services/sns/registry"

const REGISTRY_OPTS = {
  revalidateOnFocus: false,
  dedupingInterval: SNS_REGISTRY_DEDUPE_MS,
} as const

export function useSnsRegistryList() {
  const { identity } = useAuth()
  const { data, error, isLoading, mutate } = useSWR(
    SNS_REGISTRY_SWR_KEY,
    () => fetchSnsRegistryList(identity),
    REGISTRY_OPTS
  )
  return {
    rows: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  }
}

export function useSnsRegistryRow(ledgerId: string | null) {
  const { rows, isLoading, error } = useSnsRegistryList()
  const registry = ledgerId ? findSnsRegistryRow(rows, ledgerId) ?? null : null
  return { registry, isLoading, error }
}
