"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { fetchLedgerStandards } from "@/services/ledger/standards"

export function useLedgerStandards(ledgerId: string | null) {
  const { identity } = useAuth()
  const { data, isLoading } = useSWR(
    ledgerId ? (["ledger-standards", ledgerId] as const) : null,
    () => fetchLedgerStandards(identity, ledgerId!),
    { revalidateOnFocus: false }
  )
  return { standards: data ?? [], isLoading }
}
