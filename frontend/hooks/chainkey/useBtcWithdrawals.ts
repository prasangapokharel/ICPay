"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { fetchBtcWithdrawalStatuses } from "@/services/chainkey/status"
import { CKBTC_LEDGER_ID } from "@/services/chainkey/constants"

export function useBtcWithdrawals(ledgerId: string | null) {
  const { identity } = useAuth()
  const { data, isLoading, mutate } = useSWR(
    ledgerId === CKBTC_LEDGER_ID && identity
      ? (["btc-withdrawals", identity.getPrincipal().toText()] as const)
      : null,
    () => fetchBtcWithdrawalStatuses(identity!),
    { revalidateOnFocus: false }
  )
  return { rows: data ?? [], isLoading, refresh: mutate }
}
