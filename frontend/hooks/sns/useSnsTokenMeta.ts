"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { fetchSnsMeta } from "@/services/sns/proposals"

export function useSnsTokenMeta(ledgerId: string | null) {
  const { identity } = useAuth()
  const { data, isLoading } = useSWR(
    ledgerId ? (["sns-meta", ledgerId] as const) : null,
    () => fetchSnsMeta(identity, ledgerId!),
    { revalidateOnFocus: false, dedupingInterval: 300_000 }
  )
  return { meta: data ?? null, isLoading }
}
