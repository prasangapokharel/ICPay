"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { useDepositAddress } from "@/hooks/wallet/useWalletData"
import { fetchIcpCustodialSubaccounts } from "@/services/ledger/subaccounts"

export function useIcpSubaccounts() {
  const { identity } = useAuth()
  const { data: deposit } = useDepositAddress()

  const { data, isLoading } = useSWR(
    deposit && identity
      ? (["icp-subaccounts", deposit.address.owner.toText()] as const)
      : null,
    () => fetchIcpCustodialSubaccounts(identity, deposit!.address.owner),
    { revalidateOnFocus: false }
  )

  return { subaccounts: data ?? [], isLoading }
}
