"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import {
  fetchBtcWithdrawalFee,
  fetchEthGasEstimate,
  fetchPendingBtcSats,
  mintCkBtcFromDeposit,
} from "@/services/chainkey/status"
import { fetchChainKeyDeposit, isChainKeyLedger } from "@/services/chainkey/deposits"
import { CKBTC_LEDGER_ID } from "@/services/chainkey/constants"

export function useChainKeyStatus(ledgerId: string | null) {
  const { identity } = useAuth()
  const principal = identity?.getPrincipal().toText()

  const deposit = useSWR(
    ledgerId && identity && isChainKeyLedger(ledgerId)
      ? (["chain-key-deposit", ledgerId, principal] as const)
      : null,
    () => fetchChainKeyDeposit(ledgerId!, identity),
    { revalidateOnFocus: false }
  )

  const pendingBtc = useSWR(
    ledgerId === CKBTC_LEDGER_ID && deposit.data?.asset === "BTC" && identity
      ? (["chain-key-pending-btc", deposit.data.address, principal] as const)
      : null,
    () => fetchPendingBtcSats(identity!, deposit.data!.address),
    { revalidateOnFocus: false }
  )

  const btcFee = useSWR(
    ledgerId === CKBTC_LEDGER_ID ? "chain-key-btc-fee" : null,
    () => fetchBtcWithdrawalFee(identity),
    { revalidateOnFocus: false }
  )

  const ethGas = useSWR(
    ledgerId && ledgerId !== CKBTC_LEDGER_ID && isChainKeyLedger(ledgerId)
      ? "chain-key-eth-gas"
      : null,
    () => fetchEthGasEstimate(identity),
    { revalidateOnFocus: false }
  )

  const checkDeposit = async (): Promise<string | null> => {
    if (!identity || ledgerId !== CKBTC_LEDGER_ID) return null
    try {
      await mintCkBtcFromDeposit(identity)
      await Promise.all([deposit.mutate(), pendingBtc.mutate()])
      return null
    } catch (e) {
      return e instanceof Error ? e.message : "Failed to check deposit"
    }
  }

  return {
    deposit: deposit.data ?? null,
    pendingBtcSats: pendingBtc.data,
    btcFee: btcFee.data,
    ethGas: ethGas.data,
    loading: deposit.isLoading,
    checkDeposit,
  }
}
