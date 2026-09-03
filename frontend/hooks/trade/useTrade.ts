"use client"

import { useMemo } from "react"
import type { Identity } from "@icp-sdk/core/agent"
import useSWR, { useSWRConfig } from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { useDebounced } from "@/hooks/ui/useDebounced"
import { useTokenHolding, useTokenHoldings, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { filterSwapTokens, sortSwapTokens } from "@/lib/swap/tokens"
import { mergeSpendable } from "@/lib/market/spendable"
import {
  nextTradeBalanceAfterInternal,
  walletDeltaAfterInternal,
  withLedgerBalance,
} from "@/lib/trade/fees"
import { patchHoldings } from "@/lib/wallet/holdingsCache"
import { walletKey } from "@/lib/wallet/walletCache"
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

  return { tokens, swapHoldings, tradeBalances: tradeBalances ?? new Map(), isLoading: holdingsLoading || tradeLoading }
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

    const tradeInKey = tradeBalanceKey(identity, update.tokenInId)
    if (tradeInKey) {
      mutate(
        tradeInKey,
        (bal: bigint | undefined) => {
          const cur = bal ?? 0n
          return cur > update.amountIn ? cur - update.amountIn : 0n
        },
        { revalidate: false }
      )
    }

    const tradeOutKey = tradeBalanceKey(identity, update.tokenOutId)
    if (tradeOutKey) {
      mutate(tradeOutKey, (bal: bigint | undefined) => (bal ?? 0n) + update.amountOut, {
        revalidate: false,
      })
    }

    void refreshWallet()
  }
}

export type InternalTransferUpdate = {
  ledgerId: string
  amount: bigint
  toWallet: boolean
  ledgerFee: bigint
  tradeBefore: bigint
  walletBefore: bigint
}

export function useApplyInternalTransfer() {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()
  const refreshWallet = useRefreshWallet()

  return (update: InternalTransferUpdate) => {
    if (!identity) return
    const principal = identity.getPrincipal().toText()
    const nextTrade = nextTradeBalanceAfterInternal(
      update.tradeBefore,
      update.amount,
      update.toWallet
    )
    const walletDelta = walletDeltaAfterInternal(
      update.amount,
      update.ledgerFee,
      update.toWallet
    )

    const tradeKey = tradeBalanceKey(identity, update.ledgerId)
    if (tradeKey) {
      mutate(tradeKey, nextTrade, { revalidate: false })
    }

    mutate(
      (key) =>
        Array.isArray(key) &&
        key[0] === "trade-balances" &&
        key[key.length - 1] === principal,
      (map: Map<string, bigint> | undefined) =>
        withLedgerBalance(map, update.ledgerId, nextTrade),
      { revalidate: false }
    )

    const balanceKey = walletKey(identity, "token-balance", update.ledgerId)
    if (balanceKey) {
      mutate(
        balanceKey,
        (bal: bigint | undefined) => (bal ?? update.walletBefore) + walletDelta,
        { revalidate: false }
      )
    }

    mutate(
      (key) =>
        Array.isArray(key) &&
        key[0] === "token-balances" &&
        key[key.length - 1] === principal,
      (map: Map<string, bigint> | undefined) => {
        if (!map) return map
        const next = new Map(map)
        next.set(update.ledgerId, (next.get(update.ledgerId) ?? update.walletBefore) + walletDelta)
        return next
      },
      { revalidate: false }
    )

    patchHoldings(principal, [{ ledgerId: update.ledgerId, delta: walletDelta }])
    refreshWallet()
  }
}

export function useTradingBalance(ledgerId: string | null) {
  const { isAuthenticated, identity } = useAuth()
  const { data: tradeBal } = useSWR(
    identity && ledgerId ? tradeBalanceKey(identity, ledgerId) : null,
    () => getTradingBalance(identity, ledgerId!),
    { revalidateOnFocus: false, dedupingInterval: 8_000 }
  )
  if (!isAuthenticated || !ledgerId) return null
  if (tradeBal === undefined) return null
  return tradeBal
}

export function useSpendableBalance(ledgerId: string | null) {
  const { isAuthenticated } = useAuth()
  const { token } = useTokenHolding(ledgerId)
  const tradeBal = useTradingBalance(ledgerId)
  if (!isAuthenticated || !ledgerId) return null
  return mergeSpendable(token?.balance, tradeBal)
}
