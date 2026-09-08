"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { useTokenHoldings } from "@/hooks/wallet/useWalletData"
import {
  fetchOpenNnsProposals,
  fetchSnsProposalsForHoldingsAsRows,
} from "@/services/governance/governance"
import { PINNED_LEDGER_IDS } from "@/services/tokens"

const GOVERNANCE_OPTS = {
  revalidateOnFocus: false,
  dedupingInterval: 300_000,
} as const

export function useGovernanceFeed() {
  const { identity } = useAuth()
  const { holdings } = useTokenHoldings()

  const heldLedgers = holdings
    .filter((h) => h.balance > 0n)
    .map((h) => h.ledgerId)
    .filter((id) => !PINNED_LEDGER_IDS.slice(0, 2).includes(id))

  const nns = useSWR("governance-nns", () => fetchOpenNnsProposals(identity), GOVERNANCE_OPTS)

  const sns = useSWR(
    heldLedgers.length ? (["governance-sns", ...heldLedgers] as const) : null,
    () => fetchSnsProposalsForHoldingsAsRows(identity, heldLedgers),
    GOVERNANCE_OPTS
  )

  return {
    nns: nns.data ?? [],
    sns: sns.data ?? [],
    loading: nns.isLoading || sns.isLoading,
    error: nns.error ?? sns.error,
    refresh: () => Promise.all([nns.mutate(), sns.mutate()]),
  }
}

export { useSnsTokenMeta } from "@/hooks/sns/useSnsTokenMeta"
