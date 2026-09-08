"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { useDebounced } from "@/hooks/ui/useDebounced"
import { useTokenHoldings } from "@/hooks/wallet/useWalletData"
import { filterSwapTokens, sortSwapTokens } from "@/lib/swap/tokens"
import { fetchSwapQuote, type SwapQuoteOpts } from "@/services/swap/swap"

const keyFor = (identity: { getPrincipal(): { toText(): string } } | undefined, ...parts: string[]) =>
  identity ? ([...parts, identity.getPrincipal().toText()] as const) : null

export function useSwapTokens() {
  const { holdings, isLoading } = useTokenHoldings()
  const tokens = sortSwapTokens(filterSwapTokens(holdings))
  return { tokens, isLoading }
}

export function useSwapQuote(
  tokenIn: string | null,
  tokenOut: string | null,
  amountIn: bigint,
  opts: SwapQuoteOpts = {}
) {
  const { identity } = useAuth()
  const debouncedAmount = useDebounced(amountIn, 300)

  const enabled =
    tokenIn &&
    tokenOut &&
    tokenIn !== tokenOut &&
    debouncedAmount > 0n

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    enabled ? keyFor(identity, "swap-quote", tokenIn, tokenOut, debouncedAmount.toString()) : null,
    () =>
      fetchSwapQuote(identity, tokenIn!, tokenOut!, debouncedAmount, {
        skipAllowlistCheck: true,
        ...opts,
      }),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 3_000,
      errorRetryCount: 1,
    }
  )

  return { quote: data, error, isLoading: isLoading || isValidating, refresh: mutate }
}

export { useTradeTokens, useTradeQuote, useApplyTradeBalances } from "@/hooks/trade/useTrade"
