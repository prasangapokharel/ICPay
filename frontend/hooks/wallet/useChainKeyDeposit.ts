"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { fetchChainKeyDeposit, isChainKeyLedger } from "@/services/chainkey/deposits"

export function useChainKeyDeposit(ledgerId: string | null) {
  const { identity } = useAuth()

  const { data, isLoading } = useSWR(
    ledgerId && identity && isChainKeyLedger(ledgerId)
      ? (["chain-key-deposit", ledgerId, identity.getPrincipal().toText()] as const)
      : null,
    () => fetchChainKeyDeposit(ledgerId!, identity),
    { revalidateOnFocus: false }
  )

  return { deposit: data ?? null, isLoading }
}
