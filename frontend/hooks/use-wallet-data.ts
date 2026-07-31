"use client"

import useSWR, { useSWRConfig } from "swr"
import type { Identity } from "@dfinity/agent"
import { getWalletActor } from "@/services/wallet"
import { useAuth } from "@/components/auth/auth-provider"
import type { DashboardData, TransactionPublic } from "@/services/types"

// Keys are arrays so every page asking for the same data hits one cache entry.
// The principal is part of the key: switching identity must not serve the
// previous user's cached balance.
const keyFor = (identity: Identity | undefined, ...parts: string[]) =>
  identity ? ([...parts, identity.getPrincipal().toText()] as const) : null

export function useDashboard() {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    keyFor(identity, "dashboard"),
    async () => {
      const actor = await getWalletActor(identity!)
      const result = await actor.getDashboard()
      if ("err" in result) throw new Error(result.err)
      return result.ok
    },
    // getDashboard is an update call and costs real cycles, so refocus
    // revalidation is deduped: tab-switching must not refetch every time.
    { revalidateOnFocus: true, keepPreviousData: true, dedupingInterval: 30_000 }
  )

  return {
    data: data as DashboardData | undefined,
    error,
    isLoading,
    refresh: mutate,
  }
}

export function useDepositAddress() {
  const { identity } = useAuth()

  const { data, error, isLoading } = useSWR(
    keyFor(identity, "deposit-address"),
    async () => {
      const actor = await getWalletActor(identity!)
      const [address, accountId] = await Promise.all([
        actor.getDepositAddress(),
        actor.getDepositAccountIdentifier(),
      ])
      return { address, accountId }
    },
    // A principal's deposit address is derived and never changes, so this can
    // stay cached for the whole session instead of refetching per visit.
    { revalidateOnFocus: false, revalidateIfStale: false }
  )

  return { data, error, isLoading }
}

export function useTransactions(page = 0, pageSize = 20) {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    keyFor(identity, "transactions", String(page), String(pageSize)),
    async () => {
      const actor = await getWalletActor(identity!)
      const result = await actor.getTransactions(BigInt(page), BigInt(pageSize))
      if ("err" in result) throw new Error(result.err)
      return result.ok
    },
    { keepPreviousData: true }
  )

  return {
    items: (data?.items ?? []) as TransactionPublic[],
    total: data?.total ?? 0n,
    error,
    isLoading,
    refresh: mutate,
  }
}

// Anything that moves funds invalidates balance and history together, so both
// are refetched from one call rather than each page tracking its own staleness.
export function useRefreshWallet() {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()

  return () => {
    if (!identity) return
    const principal = identity.getPrincipal().toText()
    mutate((key) => Array.isArray(key) && key[key.length - 1] === principal)
  }
}
