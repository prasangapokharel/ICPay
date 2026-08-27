"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { fetchSnsRegistryEntry } from "@/services/governance/governance"

export function useSnsRegistry(ledgerId: string | null) {
  const { identity } = useAuth()
  const { data, isLoading } = useSWR(
    ledgerId ? (["sns-registry", ledgerId] as const) : null,
    () => fetchSnsRegistryEntry(identity, ledgerId!),
    { revalidateOnFocus: false }
  )
  return { registry: data ?? null, isLoading }
}
