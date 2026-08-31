"use client"

import { useMemo } from "react"
import type { Identity } from "@icp-sdk/core/agent"
import useSWR, { useSWRConfig } from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { useDebounced } from "@/hooks/ui/useDebounced"
import { useTokenHoldings, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { filterSwapTokens, sortSwapTokens } from "@/lib/swap/tokens"
import { fetchTradeQuoteChecked, getTradingBalance, type TradeQuoteOpts } from "@/services/trade/trade"

const keyFor = (identity: Identity | undefined, ...parts: string[]) =>
  identity ? ([...parts, identity.getPrincipal().toText()] as const) : null

export function tradeBalanceKey(identity: Identity | undefined, ledgerId: string) {
  return keyFor(identity, "trade-balance", ledgerId)
}

async function fetchTradeBalances(identity: Identity, ledgerIds: string[]): Promise<Map<string, bigint>> {
  const entries = await Promise.all(
    ledgerIds.map(async (id) => [id, await getTradingBalance(identity, id)] as const)
  )
  return new Map(entries)
}

export function useTradeTokens() {
  const { holdings, isLoading: holdingsLoading } = useTokenHoldings()
  const { identity } = useAuth()
  const swapHoldings = useMemo(() => filterSwapTokens(holdings), [holdings])
  const ledgerIds = useMemo(
    () => swapHoldings.map((h) => h.ledgerId).sort().join(","),
    [swapHoldings]
  )

  const { data: tradeBalances, isLoading: tradeLoading } = useSWR(
    identity && ledgerIds ? keyFor(identity, "trade-balances", ledgerIds) : null,
    () => fetchTradeBalances(identity!, swapHoldings.map((h) => h.ledgerId)),
    { revalidateOnFocus: false, dedupingInterval: 15_000 }
  )

  const tokens = useMemo(() => {
    const merged = swapHoldings.map((h) => ({
      ...h,
      balance: h.balance + (tradeBalances?.get(h.ledgerId) ?? 0n),
    }))
    return sortSwapTokens(merged)
  }, [swapHoldings, tradeBalances])

  return { tokens, isLoading: holdingsLoading || tradeLoading }
}

export function useTradeQuote(
  tokenIn: string | null,
  tokenOut: string | null,
  amountIn: bigint,
  opts: TradeQuoteOpts = {}
) {
  const { identity } = useAuth()
  const debouncedAmount = useDebounced(amountIn, 300)

  const enabled =
    tokenIn &&
    tokenOut &&
    tokenIn !== tokenOut &&
    debouncedAmount > 0n

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    enabled ? keyFor(identity, "trade-quote", tokenIn, tokenOut, debouncedAmount.toString()) : null,
    () =>
      fetchTradeQuoteChecked(identity, tokenIn!, tokenOut!, debouncedAmount, {
        skipAllowlistCheck: true,
        ...opts,
      }),
    {
      revalidateOnFocus: false,
      keepPreviousData: false,
      dedupingInterval: 3_000,
      errorRetryCount: 1,
    }
  )

  return { quote: data, error, isLoading: isLoading || isValidating, refresh: mutate }
}

export type TradeBalanceUpdate = {
  tokenInId: string
  tokenOutId: string
  amountIn: bigint
  amountOut: bigint
}

export function useApplyTradeBalances() {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()
  const refreshWallet = useRefreshWallet()

  return (update: TradeBalanceUpdate) => {
    if (!identity) return
    const principal = identity.getPrincipal().toText()

    const patchTradeMap = (map: Map<string, bigint> | undefined) => {
      if (!map) return map
      const next = new Map(map)
      const inBal = next.get(update.tokenInId) ?? 0n
      next.set(update.tokenInId, inBal > update.amountIn ? inBal - update.amountIn : 0n)
      next.set(update.tokenOutId, (next.get(update.tokenOutId) ?? 0n) + update.amountOut)
      return next
    }

    mutate(
      (key) =>
        Array.isArray(key) &&
        key[0] === "trade-balances" &&
        key[key.length - 1] === principal,
      patchTradeMap,
      { revalidate: false }
    )

    const tradeOutKey = tradeBalanceKey(identity, update.tokenOutId)
    if (tradeOutKey) {
      mutate(tradeOutKey, (bal: bigint | undefined) => (bal ?? 0n) + update.amountOut, {
        revalidate: false,
      })
    }

    void refreshWallet()
  }
}
