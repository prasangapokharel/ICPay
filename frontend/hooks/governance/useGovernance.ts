"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { useTokenHoldings } from "@/hooks/wallet/useWalletData"
import {
  fetchOpenNnsProposals,
  fetchSnsMeta,
  fetchSnsProposalsForHoldings,
} from "@/services/governance/governance"
import { PINNED_LEDGER_IDS } from "@/services/tokens"

export function useGovernanceFeed() {
  const { identity } = useAuth()
  const { holdings } = useTokenHoldings()

  const heldLedgers = holdings
    .filter((h) => h.balance > 0n)
    .map((h) => h.ledgerId)
    .filter((id) => !PINNED_LEDGER_IDS.slice(0, 2).includes(id))

  const nns = useSWR("governance-nns", () => fetchOpenNnsProposals(identity), {
    revalidateOnFocus: false,
  })

  const sns = useSWR(
    heldLedgers.length ? ["governance-sns", ...heldLedgers] : null,
    () => fetchSnsProposalsForHoldings(identity, heldLedgers),
    { revalidateOnFocus: false }
  )

  return {
    nns: nns.data ?? [],
    sns: sns.data ?? [],
    loading: nns.isLoading || sns.isLoading,
    error: nns.error ?? sns.error,
    refresh: () => Promise.all([nns.mutate(), sns.mutate()]),
  }
}

export function useSnsTokenMeta(ledgerId: string | null) {
  const { identity } = useAuth()
  const { data, isLoading } = useSWR(
    ledgerId ? (["sns-meta", ledgerId] as const) : null,
    () => fetchSnsMeta(identity, ledgerId!),
    { revalidateOnFocus: false }
  )
  return { meta: data ?? null, isLoading }
}
