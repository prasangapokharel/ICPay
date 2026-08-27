"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { useDepositAddress } from "@/hooks/wallet/useWalletData"
import { fetchIcrcTransactions } from "@/services/ledger/icrcHistory"

const PAGE_SIZE = 10n

export function useIcrcTokenHistory(ledgerId: string | null, enabled = true) {
  const { identity } = useAuth()
  const { data: deposit } = useDepositAddress()

  const key =
    enabled && ledgerId && deposit && identity
      ? ([
          "icrc-history",
          ledgerId,
          deposit.address.owner.toText(),
          identity.getPrincipal().toText(),
        ] as const)
      : null

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const subRaw = deposit!.address.subaccount[0]
      const sub = subRaw
        ? subRaw instanceof Uint8Array
          ? subRaw
          : Uint8Array.from(subRaw)
        : undefined
      return fetchIcrcTransactions(
        identity,
        ledgerId!,
        deposit!.address.owner,
        sub,
        PAGE_SIZE
      )
    },
    { revalidateOnFocus: false }
  )

  return {
    page: data,
    pageSize: PAGE_SIZE,
    error,
    isLoading,
    refresh: mutate,
    fetchPage: async (start?: bigint) => {
      if (!identity || !deposit || !ledgerId) {
        return { rows: [], hasMore: false }
      }
      const subRaw = deposit.address.subaccount[0]
      const sub = subRaw
        ? subRaw instanceof Uint8Array
          ? subRaw
          : Uint8Array.from(subRaw)
        : undefined
      return fetchIcrcTransactions(
        identity,
        ledgerId,
        deposit.address.owner,
        sub,
        PAGE_SIZE,
        start
      )
    },
  }
}
