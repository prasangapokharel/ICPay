"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { walletKey } from "@/lib/wallet/walletCache"
import { WALLET_LEDGER_IDS_DEDUPE_MS } from "@/lib/sns/constants"
import { listLedgerIds } from "@/services/tokens"

export function useWalletLedgerIds() {
  const { identity } = useAuth()
  const { data, error, isLoading, mutate } = useSWR(
    walletKey(identity, "ledger-ids"),
    () => listLedgerIds(identity),
    {
      revalidateOnFocus: false,
      dedupingInterval: WALLET_LEDGER_IDS_DEDUPE_MS,
    }
  )
  return {
    ledgerIds: data,
    isLoading,
    error,
    refresh: mutate,
  }
}
