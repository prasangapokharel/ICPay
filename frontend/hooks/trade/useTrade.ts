"use client"

import useSWR, { useSWRConfig } from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { useDebounced } from "@/hooks/ui/useDebounced"
import { useTokenHoldings, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { filterSwapTokens, sortSwapTokens } from "@/lib/swap/tokens"
import { requiredWalletDebit } from "@/lib/trade/fees"
import { fetchTradeQuoteChecked, type TradeQuoteOpts } from "@/services/trade/trade"
import { balancesCacheKey } from "@/lib/wallet/walletCache"

const keyFor = (identity: { getPrincipal(): { toText(): string } } | undefined, ...parts: string[]) =>
  identity ? ([...parts, identity.getPrincipal().toText()] as const) : null

export function useTradeTokens() {
  const { holdings, isLoading } = useTokenHoldings()
  const tokens = sortSwapTokens(filterSwapTokens(holdings))
  return { tokens, isLoading }
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
  tokenInFee: bigint
}

export function useApplyTradeBalances() {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()
  const refreshWallet = useRefreshWallet()

  return (update: TradeBalanceUpdate) => {
    if (!identity) return
    const principal = identity.getPrincipal().toText()
    const tokenDebit = requiredWalletDebit(update.amountIn, update.tokenInFee)

    const patchBalanceMap = (map: Map<string, bigint> | undefined) => {
      if (!map) return map
      const next = new Map(map)
      next.set(update.tokenInId, (next.get(update.tokenInId) ?? 0n) - tokenDebit)
      next.set(update.tokenOutId, (next.get(update.tokenOutId) ?? 0n) + update.amountOut)
      return next
    }

    const balancesKey = balancesCacheKey(identity, [])
    if (balancesKey) {
      mutate(balancesKey, patchBalanceMap, { revalidate: false })
    }
    mutate(
      (key) =>
        Array.isArray(key) &&
        key[0] === "token-balances" &&
        key[key.length - 1] === principal,
      patchBalanceMap,
      { revalidate: false }
    )

    const inKey = keyFor(identity, "token-balance", update.tokenInId)
    const outKey = keyFor(identity, "token-balance", update.tokenOutId)
    if (inKey) {
      mutate(inKey, (bal: bigint | undefined) => (bal ?? 0n) - tokenDebit, { revalidate: false })
    }
    if (outKey) {
      mutate(outKey, (bal: bigint | undefined) => (bal ?? 0n) + update.amountOut, {
        revalidate: false,
      })
    }

    void refreshWallet()
  }
}
