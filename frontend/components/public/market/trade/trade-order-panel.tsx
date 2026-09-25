"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDataTransferHorizontalIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ShineBorder } from "@/components/ui/shine-border"
import { useAuth } from "@/components/auth/auth-provider"
import { useDebounced } from "@/hooks/ui/useDebounced"
import { useApplyTradeBalances, useRefreshTradeBalances, useTradeTokens, useTradingBalance, tradeBalanceKey } from "@/hooks/trade/useTrade"
import { useRefreshWallet, useTokenHolding } from "@/hooks/wallet/useWalletData"
import { formatTokenAmount, parseTokenAmount, toPlainTokenAmount } from "@/lib/wallet/utils"
import { tradeOrderAlert, tradeOrderBlock, tradeImpactAlert, canSubmitTrade, canOpenTransfer } from "@/lib/market/tradeOrderBlock"
import { classifyTradeQuoteError, classifyTradeExecError, shouldRetryTradeQuote } from "@/lib/market/tradeQuoteError"
import {
  estimatePriceImpactPct,
  isTradeTokenSafe,
  priceImpactBand,
  shouldQuoteTrade,
} from "@/lib/market/tradePreflight"
import { isSwapBlocked } from "@/lib/swap/config"
import { showWalletLine, tradeCta } from "@/lib/market/tradeAuthUi"
import { formatUsd } from "@/lib/market/format"
import { cn } from "@/lib/ui/utils"
import { maxTradeInput, minAmountOut } from "@/lib/trade/fees"
import { meetsMinTrade, MIN_TRADE_ICP, MIN_TRADE_ICP_E8S, tokenAmountUsd } from "@/lib/market/minTradeUsd"
import { mergePositionBalances } from "@/lib/market/availableAssets"
import { tradePairPath } from "@/lib/market/pairSlug"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import {
  fetchTradeQuoteChecked,
  placeLimitOrder,
  runTrade,
  warmTradeSession,
} from "@/services/trade/trade"
import type { TerminalPairRow, TradePairSnapshot } from "@/services/market/tradePairSnapshot"
import {
  addTradeFill,
  patchTradeFill,
  setTradeFillNotice,
} from "@/lib/market/tradeFillStore"
import { TradeOrderQuote } from "./trade-order-quote"
import { TradeAvailableAssets } from "./trade-available-assets"
import { TradeDepositDrawer } from "./trade-deposit-drawer"
import { TokenAvatar } from "./token-avatar"
import { TradePercentageSlider } from "./trade-percentage-slider"

type TradeStatus = "idle" | "error" | "placing_limit"

function formatCalculatedAmount(num: number, maxDecimals: number = 8): string {
  if (!Number.isFinite(num) || num <= 0) return ""
  const precision = num < 0.0001 ? Math.min(maxDecimals, 8) : Math.min(maxDecimals, 6)
  const str = num.toFixed(precision)
  return str.includes(".") ? str.replace(/\.?0+$/, "") : str
}

export function TradeOrderPanel({
  snapshot,
  loading,
  rows,
  activeBaseId,
  listLoading,
  onSelectPair,
  onOpenWalletTrade,
}: {
  snapshot: TradePairSnapshot | undefined
  loading?: boolean
  rows: TerminalPairRow[]
  activeBaseId: string
  listLoading?: boolean
  onSelectPair: (baseLedgerId: string) => void
  onOpenWalletTrade: () => void
}) {
  const t = useTranslations("marketTrade")
  const tDeposit = useTranslations("deposit")
  const { isAuthenticated, isLoading: authLoading, identity } = useAuth()
  const applyBalances = useApplyTradeBalances()
  const refreshTradeBalances = useRefreshTradeBalances()
  const refreshWallet = useRefreshWallet()
  const { mutate } = useSWRConfig()
  const { price: icpPrice } = useIcpPrice()
  const lastClick = useRef(0)
  const { swapHoldings, tradeBalances } = useTradeTokens()
  const positionBalances = useMemo(
    () => mergePositionBalances(swapHoldings, tradeBalances),
    [swapHoldings, tradeBalances]
  )
  const availableAssets = (
    <TradeAvailableAssets
      rows={rows}
      balances={positionBalances}
      activeBaseId={activeBaseId}
      loading={listLoading}
      onSelect={onSelectPair}
    />
  )

  useEffect(() => {
    void warmTradeSession(identity)
  }, [identity])

  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [orderType, setOrderType] = useState<"limit" | "market">("limit")
  const [limitPriceMode, setLimitPriceMode] = useState<"quote" | "usd">("quote")

  const { price: icpPriceData } = useIcpPrice()
  const icpPriceUsd = useMemo(() => {
    if (icpPriceData?.usd && icpPriceData.usd > 0) return icpPriceData.usd
    if (snapshot?.stats?.priceUsd && snapshot?.priceInIcp && snapshot.priceInIcp > 0) {
      return snapshot.stats.priceUsd / snapshot.priceInIcp
    }
    return 0
  }, [icpPriceData, snapshot])

  // Market Mode input (In-token amount)
  const [marketAmountText, setMarketAmountText] = useState("")

  // Limit Mode inputs (Price in Quote/ICP or USD, Base Amount, and Total in Quote/ICP)
  const [limitPriceText, setLimitPriceText] = useState("")
  const [limitBaseAmountText, setLimitBaseAmountText] = useState("")
  const [limitTotalText, setLimitTotalText] = useState("")
  const lastEditedLimitField = useRef<"amount" | "total">("total")

  const [status, setStatus] = useState<TradeStatus>("idle")
  const [tradeError, setTradeError] = useState<string | null>(null)
  const [limitNotice, setLimitNotice] = useState<string | null>(null)
  const [impactConfirmed, setImpactConfirmed] = useState(false)
  const [depositDrawerOpen, setDepositDrawerOpen] = useState(false)

  const marketDefaultPrice = useMemo(() => {
    if (limitPriceMode === "usd") {
      const usdVal = snapshot?.stats?.priceUsd ?? (snapshot?.priceInIcp && icpPriceUsd > 0 ? snapshot.priceInIcp * icpPriceUsd : null)
      if (!usdVal || usdVal <= 0) return ""
      return usdVal < 0.0001
        ? usdVal.toFixed(8)
        : usdVal < 1
          ? usdVal.toFixed(6)
          : usdVal >= 1000
            ? usdVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : usdVal.toFixed(2)
    }
    if (!snapshot?.priceInIcp || snapshot.priceInIcp <= 0) return ""
    return snapshot.priceInIcp < 0.0001
      ? snapshot.priceInIcp.toFixed(8)
      : snapshot.priceInIcp < 1
        ? snapshot.priceInIcp.toFixed(6)
        : snapshot.priceInIcp >= 1000
          ? snapshot.priceInIcp.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })
          : snapshot.priceInIcp.toFixed(4)
  }, [icpPriceUsd, limitPriceMode, snapshot])

  const effectivePriceText = limitPriceText !== "" ? limitPriceText : marketDefaultPrice

  const effectivePriceInIcp = useMemo(() => {
    const rawNum = parseFloat(effectivePriceText.replace(/,/g, ""))
    if (Number.isNaN(rawNum) || rawNum <= 0) return 0
    if (limitPriceMode === "usd") {
      return icpPriceUsd > 0 ? rawNum / icpPriceUsd : 0
    }
    return rawNum
  }, [effectivePriceText, icpPriceUsd, limitPriceMode])

  const baseToken = snapshot?.base
  const quoteToken = snapshot?.quote
  const baseSymbol = baseToken?.symbol ?? ""
  const quoteSymbol = quoteToken?.symbol ?? "ICP"

  const tokenIn = side === "buy" ? quoteToken : baseToken
  const tokenOut = side === "buy" ? baseToken : quoteToken

  const tradingBal = useTradingBalance(tokenIn?.ledgerId ?? null)
  const { token: walletToken } = useTokenHolding(isAuthenticated ? (tokenIn?.ledgerId ?? null) : null)
  const walletBal = walletToken?.balance ?? 0n

  const amountIn = useMemo(() => {
    if (orderType === "market") {
      return marketAmountText.trim() && tokenIn
        ? parseTokenAmount(marketAmountText, tokenIn.decimals)
        : null
    }

    // Limit Mode amount_in
    if (side === "buy") {
      // User is paying Total (in quote currency, e.g. ICP)
      return limitTotalText.trim() && quoteToken
        ? parseTokenAmount(limitTotalText, quoteToken.decimals)
        : null
    } else {
      // User is paying Base Amount (in base currency, e.g. ckETH)
      return limitBaseAmountText.trim() && baseToken
        ? parseTokenAmount(limitBaseAmountText, baseToken.decimals)
        : null
    }
  }, [baseToken, limitBaseAmountText, limitTotalText, marketAmountText, orderType, quoteToken, side, tokenIn])

  const debouncedIn = useDebounced(amountIn, 400)
  const tokenBlocked = Boolean(
    tokenIn &&
      tokenOut &&
      (isSwapBlocked(tokenIn.ledgerId) ||
        isSwapBlocked(tokenOut.ledgerId) ||
        !isTradeTokenSafe(tokenIn) ||
        !isTradeTokenSafe(tokenOut))
  )
  const hasPool = Boolean(snapshot?.pool)

  const payUsdNow = (() => {
    if (!amountIn || !tokenIn || !snapshot) return null
    if (side === "buy") return tokenAmountUsd(amountIn, tokenIn.decimals, icpPrice?.usd ?? 0)
    const tokenUsd =
      snapshot.stats?.priceUsd && snapshot.stats.priceUsd > 0
        ? snapshot.stats.priceUsd
        : snapshot.priceInIcp && icpPrice?.usd
          ? snapshot.priceInIcp * icpPrice.usd
          : 0
    return tokenAmountUsd(amountIn, tokenIn.decimals, tokenUsd)
  })()
  const impactPct = estimatePriceImpactPct(payUsdNow, snapshot?.stats?.tvlUsd ?? null)
  const impactBand = priceImpactBand(impactPct)
  const canQuote = shouldQuoteTrade({
    hasPool,
    blocked: tokenBlocked,
    amountIn: debouncedIn,
    impactBand,
  })

  const { data: quote, error: quoteErr, isLoading: quoting } = useSWR(
    orderType === "market" && canQuote
      ? ["terminal-quote", side, snapshot!.baseLedgerId, debouncedIn!.toString()]
      : null,
    () =>
      fetchTradeQuoteChecked(
        identity,
        tokenIn!.ledgerId,
        tokenOut!.ledgerId,
        debouncedIn!,
        { skipAllowlistCheck: true, tokenInFee: tokenIn!.fee, tokenOutFee: tokenOut!.fee }
      ),
    {
      revalidateOnFocus: false,
      dedupingInterval: 15_000,
      shouldRetryOnError: shouldRetryTradeQuote,
      errorRetryCount: 1,
    }
  )
  const quoteError = quoteErr ? classifyTradeQuoteError(quoteErr) : null

  // Price conversion helper text (e.g., ≈ $2,673.98 USD or ≈ 828.1990 ICP)
  const convertedPriceSubtext = useMemo(() => {
    const rawNum = parseFloat(effectivePriceText.replace(/,/g, ""))
    if (Number.isNaN(rawNum) || rawNum <= 0) return null
    if (limitPriceMode === "quote") {
      if (icpPriceUsd > 0) {
        return `≈ ${formatUsd(rawNum * icpPriceUsd, 2, { compact: false })}`
      }
    } else {
      if (icpPriceUsd > 0) {
        const inIcp = rawNum / icpPriceUsd
        const formatted = inIcp < 0.0001
          ? inIcp.toFixed(8)
          : inIcp < 1
            ? inIcp.toFixed(6)
            : inIcp.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })
        return `≈ ${formatted} ${quoteSymbol}`
      }
    }
    return null
  }, [effectivePriceText, icpPriceUsd, limitPriceMode, quoteSymbol])

  function togglePriceMode() {
    const rawNum = parseFloat(effectivePriceText.replace(/,/g, ""))
    if (limitPriceMode === "quote") {
      if (!Number.isNaN(rawNum) && rawNum > 0 && icpPriceUsd > 0) {
        const inUsd = rawNum * icpPriceUsd
        setLimitPriceText(
          inUsd < 0.0001
            ? inUsd.toFixed(8)
            : inUsd < 1
              ? inUsd.toFixed(6)
              : inUsd >= 1000
                ? inUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : inUsd.toFixed(2)
        )
      } else if (snapshot?.stats?.priceUsd) {
        const usd = snapshot.stats.priceUsd
        setLimitPriceText(
          usd >= 1000
            ? usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : usd.toFixed(2)
        )
      } else {
        setLimitPriceText("")
      }
      setLimitPriceMode("usd")
    } else {
      if (!Number.isNaN(rawNum) && rawNum > 0 && icpPriceUsd > 0) {
        const inIcp = rawNum / icpPriceUsd
        setLimitPriceText(
          inIcp < 0.0001
            ? inIcp.toFixed(8)
            : inIcp < 1
              ? inIcp.toFixed(6)
              : inIcp >= 1000
                ? inIcp.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })
                : inIcp.toFixed(4)
        )
      } else if (snapshot?.priceInIcp) {
        const icp = snapshot.priceInIcp
        setLimitPriceText(
          icp >= 1000
            ? icp.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })
            : icp.toFixed(4)
        )
      } else {
        setLimitPriceText("")
      }
      setLimitPriceMode("quote")
    }
  }

  // Price & Amount Sync handlers for Limit Order
  function handlePriceChange(val: string) {
    setLimitPriceText(val)
    setStatus("idle")
    setTradeError(null)
    setLimitNotice(null)
    const p = parseFloat(val.replace(/,/g, ""))
    if (!Number.isNaN(p) && p > 0) {
      const pInIcp = limitPriceMode === "usd" ? (icpPriceUsd > 0 ? p / icpPriceUsd : 0) : p
      if (pInIcp > 0) {
        if (lastEditedLimitField.current === "total" || (side === "buy" && limitTotalText)) {
          const tot = parseFloat(limitTotalText.replace(/,/g, ""))
          if (!Number.isNaN(tot) && tot > 0) {
            setLimitBaseAmountText(formatCalculatedAmount(tot / pInIcp, baseToken?.decimals ?? 8))
          } else if (limitBaseAmountText) {
            const amt = parseFloat(limitBaseAmountText.replace(/,/g, ""))
            if (!Number.isNaN(amt) && amt > 0) {
              setLimitTotalText(formatCalculatedAmount(amt * pInIcp, quoteToken?.decimals ?? 8))
            }
          }
        } else {
          const amt = parseFloat(limitBaseAmountText.replace(/,/g, ""))
          if (!Number.isNaN(amt) && amt > 0) {
            setLimitTotalText(formatCalculatedAmount(amt * pInIcp, quoteToken?.decimals ?? 8))
          } else if (limitTotalText) {
            const tot = parseFloat(limitTotalText.replace(/,/g, ""))
            if (!Number.isNaN(tot) && tot > 0) {
              setLimitBaseAmountText(formatCalculatedAmount(tot / pInIcp, baseToken?.decimals ?? 8))
            }
          }
        }
      }
    }
  }

  function handleBaseAmountChange(val: string) {
    lastEditedLimitField.current = "amount"
    setLimitBaseAmountText(val)
    setStatus("idle")
    setTradeError(null)
    setLimitNotice(null)
    const amt = parseFloat(val.replace(/,/g, ""))
    const p = effectivePriceInIcp
    if (!Number.isNaN(amt) && p > 0) {
      setLimitTotalText(formatCalculatedAmount(amt * p, quoteToken?.decimals ?? 8))
    }
  }

  function handleTotalChange(val: string) {
    lastEditedLimitField.current = "total"
    setLimitTotalText(val)
    setStatus("idle")
    setTradeError(null)
    setLimitNotice(null)
    const tot = parseFloat(val.replace(/,/g, ""))
    const p = effectivePriceInIcp
    if (!Number.isNaN(tot) && p > 0) {
      setLimitBaseAmountText(formatCalculatedAmount(tot / p, baseToken?.decimals ?? 8))
    }
  }

  // Current Fill Percentage calculation (0-100)
  const currentFillPercent = useMemo(() => {
    if (!tradingBal || !tokenIn) return 0
    const maxIn = maxTradeInput(tradingBal, tokenIn.fee)
    if (maxIn <= 0n) return 0

    let currentIn: bigint | null = null
    if (orderType === "market") {
      currentIn = marketAmountText.trim() ? parseTokenAmount(marketAmountText, tokenIn.decimals) : null
    } else {
      if (side === "buy") {
        currentIn = limitTotalText.trim() && quoteToken ? parseTokenAmount(limitTotalText, quoteToken.decimals) : null
      } else {
        currentIn = limitBaseAmountText.trim() && baseToken ? parseTokenAmount(limitBaseAmountText, baseToken.decimals) : null
      }
    }

    if (!currentIn || currentIn <= 0n) return 0
    const pct = Number((currentIn * 10000n) / maxIn) / 100
    return Math.min(100, Math.max(0, Math.round(pct)))
  }, [baseToken, limitBaseAmountText, limitTotalText, marketAmountText, orderType, quoteToken, side, tokenIn, tradingBal])

  function applyFill(pct: number) {
    if (!tradingBal || !tokenIn) return
    setImpactConfirmed(false)
    if (pct <= 0) {
      if (orderType === "market") {
        setMarketAmountText("")
      } else {
        setLimitBaseAmountText("")
        setLimitTotalText("")
      }
      return
    }
    const maxIn = maxTradeInput(tradingBal, tokenIn.fee)
    const raw = (maxIn * BigInt(pct)) / 100n

    if (orderType === "market") {
      setMarketAmountText(toPlainTokenAmount(raw, tokenIn.decimals))
      return
    }

    // Limit Mode Quick-Fill
    const p = effectivePriceInIcp
    if (side === "buy") {
      lastEditedLimitField.current = "total"
      // raw is ICP Total
      const totStr = toPlainTokenAmount(raw, tokenIn.decimals)
      setLimitTotalText(totStr)
      if (p > 0) {
        const totNum = parseFloat(totStr.replace(/,/g, ""))
        setLimitBaseAmountText(formatCalculatedAmount(totNum / p, baseToken?.decimals ?? 8))
      }
    } else {
      lastEditedLimitField.current = "amount"
      // raw is Base Token Amount
      const amtStr = toPlainTokenAmount(raw, tokenIn.decimals)
      setLimitBaseAmountText(amtStr)
      if (p > 0) {
        const amtNum = parseFloat(amtStr.replace(/,/g, ""))
        setLimitTotalText(formatCalculatedAmount(amtNum * p, quoteToken?.decimals ?? 8))
      }
    }
  }

  async function handlePlaceLimitOrder() {
    if (!baseToken || !quoteToken || !identity) return

    const priceNum = parseFloat(effectivePriceText.replace(/,/g, ""))
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      setStatus("error")
      setTradeError(t("limitPrice") + " must be greater than 0")
      return
    }

    let calculatedAmountIn: bigint | null = null
    let calculatedMinAmountOut: bigint | null = null

    if (side === "buy") {
      // User is spending ICP (amount_in) to receive baseToken (min_amount_out)
      calculatedAmountIn = parseTokenAmount(limitTotalText, quoteToken.decimals)
      calculatedMinAmountOut = parseTokenAmount(limitBaseAmountText, baseToken.decimals)
    } else {
      // User is spending baseToken (amount_in) to receive ICP (min_amount_out)
      calculatedAmountIn = parseTokenAmount(limitBaseAmountText, baseToken.decimals)
      calculatedMinAmountOut = parseTokenAmount(limitTotalText, quoteToken.decimals)
    }

    if (!calculatedAmountIn || calculatedAmountIn <= 0n) {
      setStatus("error")
      setTradeError(t("amountLabel") + " is required")
      return
    }

    if (!calculatedMinAmountOut || calculatedMinAmountOut <= 0n) {
      setStatus("error")
      setTradeError(t("minReceive") + " is required")
      return
    }

    if (tradingBal === null || calculatedAmountIn > tradingBal) {
      setStatus("error")
      setTradeError(t("notEnough"))
      return
    }

    setStatus("placing_limit")
    setTradeError(null)
    setLimitNotice(null)

    try {
      const inId = side === "buy" ? quoteToken.ledgerId : baseToken.ledgerId
      const outId = side === "buy" ? baseToken.ledgerId : quoteToken.ledgerId

      const res = await placeLimitOrder(
        identity,
        inId,
        outId,
        calculatedAmountIn,
        calculatedMinAmountOut
      )

      if ("ok" in res && res.ok) {
        setStatus("idle")
        setLimitNotice(t("orderPlaced"))
        setLimitBaseAmountText("")
        setLimitTotalText("")
        await refreshTradeBalances(inId)
      } else {
        setStatus("error")
        setTradeError("err" in res ? res.err : "Failed to place limit order")
      }
    } catch (e) {
      setStatus("error")
      setTradeError(e instanceof Error ? e.message : "Failed to place limit order")
    }
  }

  async function handleTrade(now: number) {
    if (orderType === "limit") {
      void handlePlaceLimitOrder()
      return
    }

    if (!snapshot?.pool || !tokenIn || !tokenOut || !amountIn || !quote) return
    if (isSwapBlocked(tokenIn.ledgerId) || isSwapBlocked(tokenOut.ledgerId)) {
      setStatus("error")
      setTradeError(t("cannotTrade"))
      return
    }
    if (impactBand === "block") {
      setStatus("error")
      setTradeError(t("insufficientLiquidity"))
      return
    }
    const currentTradingBal = tradingBal
    if (currentTradingBal == null || amountIn > maxTradeInput(currentTradingBal, tokenIn.fee)) {
      setStatus("error")
      setTradeError(t("insufficientForFees"))
      return
    }

    const quotedOut = quote.amountOutRaw ?? quote.amountOut
    if (side === "sell") {
      if (quotedOut < MIN_TRADE_ICP_E8S) {
        setStatus("error")
        setTradeError(t("minTradeIcp", { icp: MIN_TRADE_ICP }))
        return
      }
    } else {
      if (amountIn < MIN_TRADE_ICP_E8S) {
        setStatus("error")
        setTradeError(t("minTradeIcp", { icp: MIN_TRADE_ICP }))
        return
      }
    }

    const amountOutMin = minAmountOut(quotedOut)
    if (amountOutMin <= 0n) {
      setStatus("error")
      setTradeError(t("insufficientLiquidity"))
      return
    }

    if (now - lastClick.current < 600) return
    lastClick.current = now

    const clientId = `local-${now}`
    const fillAmount = side === "buy" ? quote.amountOut : amountIn
    addTradeFill({
      id: clientId,
      isBuy: side === "buy",
      amount: fillAmount,
      ledgerId: snapshot.baseLedgerId,
      symbol: snapshot.base.symbol,
      decimals: snapshot.base.decimals,
      at: now,
      status: "filling",
    })
    applyBalances({
      tokenInId: tokenIn.ledgerId,
      tokenOutId: tokenOut.ledgerId,
      amountIn,
      amountOut: quote.amountOut,
    })
    setMarketAmountText("")
    setStatus("idle")
    setTradeError(null)

    try {
      const result = await runTrade(
        identity,
        tokenIn.ledgerId,
        tokenOut.ledgerId,
        amountIn,
        amountOutMin
      )
      if ("err" in result) {
        applyBalances({
          tokenInId: tokenOut.ledgerId,
          tokenOutId: tokenIn.ledgerId,
          amountIn: quote.amountOut,
          amountOut: amountIn,
        })
        patchTradeFill(clientId, { status: "failed" })
        setTradeFillNotice({
          kind: "failed",
          id: clientId,
          isBuy: side === "buy",
          symbol: snapshot.base.symbol,
          amount: fillAmount,
          decimals: snapshot.base.decimals,
          at: now,
        })
        setStatus("error")
        setTradeError(result.err)
        return
      }
      const inKey = tradeBalanceKey(identity, tokenIn.ledgerId)
      const outKey = tradeBalanceKey(identity, tokenOut.ledgerId)
      if (inKey) void mutate(inKey)
      if (outKey) void mutate(outKey)
      refreshWallet()
      patchTradeFill(clientId, {
        id: result.ok.txId || clientId,
        amount: side === "buy" ? result.ok.amountOut : result.ok.amountIn,
        status: "filled",
        blockIndex: result.ok.blockIndex,
      })
      setTradeFillNotice({
        kind: "filled",
        id: result.ok.txId || clientId,
        isBuy: side === "buy",
        symbol: snapshot.base.symbol,
        amount: side === "buy" ? result.ok.amountOut : result.ok.amountIn,
        decimals: snapshot.base.decimals,
        at: now,
      })
    } catch (e) {
      applyBalances({
        tokenInId: tokenOut.ledgerId,
        tokenOutId: tokenIn.ledgerId,
        amountIn: quote.amountOut,
        amountOut: amountIn,
      })
      patchTradeFill(clientId, { status: "failed" })
      setTradeFillNotice({
        kind: "failed",
        id: clientId,
        isBuy: side === "buy",
        symbol: snapshot.base.symbol,
        amount: fillAmount,
        decimals: snapshot.base.decimals,
        at: now,
      })
      setStatus("error")
      const kind = classifyTradeExecError(e)
      setTradeError(
        kind === "slippage"
          ? t("slippageExceeded")
          : kind === "liquidity"
            ? t("insufficientLiquidity")
            : kind === "timeout"
              ? t("tradeTimeout")
              : e instanceof Error
                ? e.message
                : "Trade failed"
      )
    }
  }

  if (loading && !snapshot) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center p-8">
        <Spinner className="size-7 text-muted-foreground/60" />
      </div>
    )
  }

  if (!snapshot) {
    return isAuthenticated ? (
      <div className="flex h-full min-h-0 flex-col">{availableAssets}</div>
    ) : null
  }

  const paySymbol = tokenIn?.symbol ?? ""
  const receiveSymbol = tokenOut?.symbol ?? ""
  const hasAmount = Boolean(amountIn && amountIn > 0n)
  const maxIn = tradingBal !== null && tokenIn ? maxTradeInput(tradingBal, tokenIn.fee) : 0n
  const payUsd = payUsdNow

  const aboveMinIcp = meetsMinTrade({
    side,
    amountIn,
    tokenInDecimals: tokenIn?.decimals ?? 8,
    priceInIcp: snapshot.priceInIcp,
    quoteOutRaw: quote?.amountOutRaw,
  })

  const block = tradeOrderBlock({
    tradingBal: tradingBal ?? 0n,
    amountIn,
    maxIn,
    aboveMinIcp,
    hasQuote: !!quote,
    blocked: tokenBlocked,
    hasPool,
    quoting,
    quoteError,
    impactBand,
  })

  const guard =
    tradeOrderAlert(block, MIN_TRADE_ICP, quoteError) ??
    (canSubmitTrade(block) ? tradeImpactAlert(impactBand, impactPct) : null)
  const needsImpactConfirm = impactBand === "confirm" && !impactConfirmed
  const isBuy = side === "buy"
  const cta = tradeCta(authLoading, isAuthenticated)

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden pb-1">
      <Card size="sm" className="relative m-1 shrink-0 gap-0 overflow-hidden py-0">
        <ShineBorder
          borderWidth={1}
          duration={14}
          shineColor={
            side === "buy"
              ? ["#10b981", "#3b82f6", "#059669"]
              : ["#ef4444", "#f97316", "#dc2626"]
          }
          className="opacity-30 dark:opacity-40"
        />
        <div className="relative z-10 flex min-h-0 flex-col">
          {/* 1. Professional Solid Buy / Sell Toggle Buttons (KuCoin / Binance Style) */}
          <div className="p-3 pb-2">
            <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => {
                  setSide("buy")
                  setMarketAmountText("")
                  setStatus("idle")
                  setTradeError(null)
                  setLimitNotice(null)
                  setImpactConfirmed(false)
                }}
                className={cn(
                  "rounded-lg py-2 text-center text-xs font-bold transition-all active:scale-[0.98]",
                  side === "buy"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {t("buy")} {baseSymbol}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSide("sell")
                  setMarketAmountText("")
                  setStatus("idle")
                  setTradeError(null)
                  setLimitNotice(null)
                  setImpactConfirmed(false)
                }}
                className={cn(
                  "rounded-lg py-2 text-center text-xs font-bold transition-all active:scale-[0.98]",
                  side === "sell"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {t("sell")} {baseSymbol}
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-2.5 overflow-y-auto px-4 pb-3 pt-0">
            {/* 2. Order Mode Sub-Tabs: Limit vs Market */}
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="flex items-center gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setOrderType("limit")
                    setTradeError(null)
                    setLimitNotice(null)
                  }}
                  className={cn(
                    "relative pb-1 font-semibold transition-colors",
                    orderType === "limit"
                      ? "text-foreground after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("limit")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrderType("market")
                    setTradeError(null)
                    setLimitNotice(null)
                  }}
                  className={cn(
                    "relative pb-1 font-semibold transition-colors",
                    orderType === "market"
                      ? "text-foreground after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("market")}
                </button>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  className="h-6 px-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all cursor-pointer"
                  onClick={() => setDepositDrawerOpen(true)}
                  title={tDeposit("title")}
                >
                  <span>{tDeposit("title")}</span>
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label={t("transfer")}
                  title={t("transfer")}
                  onClick={onOpenWalletTrade}
                >
                  <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} className="size-3.5" strokeWidth={2} />
                </Button>
              </div>
            </div>

            {/* Trading Balance Display */}
            {isAuthenticated && tokenIn && (
              <div className="space-y-0.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("balance")}</span>
                  <span
                    className={cn(
                      "tabular-nums font-medium",
                      (tradingBal ?? 0n) <= 0n && "text-muted-foreground"
                    )}
                    title={
                      tradingBal !== null
                        ? `${toPlainTokenAmount(tradingBal, tokenIn.decimals)} ${paySymbol}`
                        : undefined
                    }
                  >
                    {tradingBal !== null
                      ? `${formatTokenAmount(tradingBal, tokenIn.decimals, 8)} ${paySymbol}`
                      : "—"}
                  </span>
                </div>
                {showWalletLine(walletBal) ? (
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{t("mainWallet")}</span>
                    <span
                      className="tabular-nums"
                      title={`${toPlainTokenAmount(walletBal, tokenIn.decimals)} ${paySymbol}`}
                    >
                      {formatTokenAmount(walletBal, tokenIn.decimals, 8)} {paySymbol}
                    </span>
                  </div>
                ) : null}
              </div>
            )}

            {/* LIMIT MODE INPUTS (Price, Amount, Total) */}
            {orderType === "limit" ? (
              <div className="space-y-2">
                {/* 1. Price Input */}
                <div className="overflow-hidden rounded-lg border border-border/60 bg-background/80 transition-colors focus-within:border-ring">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">
                      {t("limitPrice")}
                    </span>
                    <Input
                      inputMode="decimal"
                      placeholder="0.00"
                      className="h-10 border-0 bg-transparent pl-20 pr-24 text-right text-sm tabular-nums shadow-none focus-visible:ring-0"
                      value={effectivePriceText}
                      onChange={(e) => handlePriceChange(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={togglePriceMode}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[11px] font-semibold text-foreground transition-all hover:bg-muted hover:border-border active:scale-95 cursor-pointer"
                      title={limitPriceMode === "quote" ? t("switchToUsd") : t("switchToToken", { symbol: quoteSymbol })}
                    >
                      {limitPriceMode === "quote" && (
                        <TokenAvatar
                          symbol={quoteSymbol}
                          ledgerId={quoteToken?.ledgerId}
                          logoUrl={quoteToken?.logoUrl}
                          className="size-3.5"
                        />
                      )}
                      <span>{limitPriceMode === "quote" ? quoteSymbol : "USD"}</span>
                      <HugeiconsIcon
                        icon={ArrowDataTransferHorizontalIcon}
                        className="size-3 text-muted-foreground"
                        strokeWidth={2}
                      />
                    </button>
                  </div>
                  {convertedPriceSubtext ? (
                    <div className="flex items-center justify-between border-t border-border/40 px-3 py-1 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        {limitPriceMode === "quote" ? (
                          "USD"
                        ) : (
                          <>
                            <TokenAvatar
                              symbol={quoteSymbol}
                              ledgerId={quoteToken?.ledgerId}
                              logoUrl={quoteToken?.logoUrl}
                              className="size-3"
                            />
                            <span>{quoteSymbol}</span>
                          </>
                        )}
                      </span>
                      <span className="tabular-nums font-medium text-foreground/80">
                        {convertedPriceSubtext}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* 2. Amount Input (Base Currency) */}
                <div className="overflow-hidden rounded-lg border border-border/60 bg-background/80 transition-colors focus-within:border-ring">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">
                      {t("amountLabel")}
                    </span>
                    <Input
                      inputMode="decimal"
                      placeholder="0.00"
                      className="h-10 border-0 bg-transparent pl-16 pr-22 text-right text-sm tabular-nums shadow-none focus-visible:ring-0"
                      value={limitBaseAmountText}
                      onChange={(e) => handleBaseAmountChange(e.target.value)}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <TokenAvatar
                        symbol={baseSymbol}
                        ledgerId={baseToken?.ledgerId}
                        logoUrl={baseToken?.logoUrl}
                        className="size-4"
                      />
                      <span>{baseSymbol}</span>
                    </span>
                  </div>
                </div>

                {/* Amount Percentage Slider */}
                <TradePercentageSlider
                  value={currentFillPercent}
                  onChange={applyFill}
                  disabled={!isAuthenticated || !tradingBal || tradingBal <= 0n}
                />

                {/* 3. Total Input (Quote Currency) */}
                <div className="overflow-hidden rounded-lg border border-border/60 bg-background/80 transition-colors focus-within:border-ring">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">
                      {t("total")}
                    </span>
                    <Input
                      inputMode="decimal"
                      placeholder="0.00"
                      className="h-10 border-0 bg-transparent pl-14 pr-20 text-right text-sm tabular-nums shadow-none focus-visible:ring-0"
                      value={limitTotalText}
                      onChange={(e) => handleTotalChange(e.target.value)}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <TokenAvatar
                        symbol={quoteSymbol}
                        ledgerId={quoteToken?.ledgerId}
                        logoUrl={quoteToken?.logoUrl}
                        className="size-4"
                      />
                      <span>{quoteSymbol}</span>
                    </span>
                  </div>
                  {limitTotalText && parseFloat(limitTotalText) > 0 && icpPriceUsd > 0 ? (
                    <div className="flex items-center justify-between border-t border-border/40 px-3 py-1 text-[10px] text-muted-foreground">
                      <span>USD</span>
                      <span className="tabular-nums font-medium text-foreground/80">
                        ≈ {formatUsd(parseFloat(limitTotalText) * icpPriceUsd, 2, { compact: false })}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Maker Fee Transparency Line */}
                <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
                  <span>{t("makerFee")}</span>
                  <span className="font-medium text-foreground">
                    0.05% ({t("maker")})
                  </span>
                </div>
              </div>
            ) : (
              /* MARKET MODE INPUT */
              <div className="space-y-2">
                <div className="overflow-hidden rounded-lg border border-border/60 bg-background/80 transition-colors focus-within:border-ring">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">
                      {t("amountLabel")}
                    </span>
                    <Input
                      inputMode="decimal"
                      placeholder="0.00"
                      className="h-10 border-0 bg-transparent pl-16 pr-20 text-right text-sm tabular-nums shadow-none focus-visible:ring-0"
                      value={marketAmountText}
                      onChange={(e) => {
                        setMarketAmountText(e.target.value)
                        setStatus("idle")
                        setTradeError(null)
                        setImpactConfirmed(false)
                      }}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <TokenAvatar
                        symbol={paySymbol}
                        ledgerId={tokenIn?.ledgerId}
                        logoUrl={tokenIn?.logoUrl}
                        className="size-4"
                      />
                      <span>{paySymbol}</span>
                    </span>
                  </div>
                  {hasAmount ? (
                    <div className="flex items-center justify-between border-t border-border/40 px-3 py-1.5 text-[11px]">
                      <span className="text-muted-foreground">{t("total")}</span>
                      <span className="tabular-nums font-medium text-foreground/80">
                        {payUsd !== null ? formatUsd(payUsd, 2) : "—"}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Amount Percentage Slider */}
                <TradePercentageSlider
                  value={currentFillPercent}
                  onChange={applyFill}
                  disabled={!isAuthenticated || !tradingBal || tradingBal <= 0n}
                />

                {hasAmount && tokenIn && tokenOut && canQuote ? (
                  <TradeOrderQuote
                    quote={quote}
                    quoting={quoting}
                    paySymbol={paySymbol}
                    receiveSymbol={receiveSymbol}
                    payDecimals={tokenIn.decimals}
                    outDecimals={tokenOut.decimals}
                    payLedgerId={tokenIn.ledgerId}
                    payLogoUrl={tokenIn.logoUrl}
                    receiveLedgerId={tokenOut.ledgerId}
                    receiveLogoUrl={tokenOut.logoUrl}
                  />
                ) : null}
              </div>
            )}

            {/* Success & Error Notices */}
            {limitNotice ? (
              <div className="flex items-center gap-1.5 px-0.5 py-0.5 text-emerald-600 dark:text-emerald-400">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 shrink-0" />
                <span className="text-xs font-medium">{limitNotice}</span>
              </div>
            ) : null}

            {orderType === "market" && guard ? (
              <div className="px-0.5 py-0.5 text-xs text-muted-foreground">
                {guard.values && "pct" in guard.values
                  ? t(guard.key as "highPriceImpact", guard.values)
                  : guard.values && "icp" in guard.values
                    ? t("minTradeIcp", guard.values)
                    : guard.values && "usd" in guard.values
                      ? t("minTradeUsd", guard.values)
                      : t(guard.key as "cannotTrade")}
              </div>
            ) : status === "error" && tradeError ? (
              <div className="px-0.5 py-0.5 text-xs text-destructive">
                {tradeError}
              </div>
            ) : null}

            {/* Action CTA Button */}
            {cta === "wait" ? (
              <Button variant="outline" size="lg" className="w-full" disabled>
                <Spinner className="size-4" />
              </Button>
            ) : cta === "sign_in" ? (
              <Button
                variant="default"
                size="lg"
                className="w-full"
                nativeButton={false}
                render={
                  <a
                    href={`/login?next=${encodeURIComponent(tradePairPath(snapshot.base.symbol))}`}
                  />
                }
              >
                {t("signIn")}
              </Button>
            ) : (
              <Button
                variant="default"
                size="lg"
                className={cn(
                  "w-full font-semibold text-white shadow-xs transition-all active:scale-[0.99]",
                  isBuy
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-rose-600 hover:bg-rose-500"
                )}
                disabled={
                  orderType === "limit"
                    ? status === "placing_limit" || !effectivePriceText.trim() || !limitBaseAmountText.trim() || !limitTotalText.trim()
                    : !canOpenTransfer(block) && !canSubmitTrade(block)
                }
                onClick={() => {
                  if (orderType === "limit") {
                    void handlePlaceLimitOrder()
                    return
                  }
                  if (canOpenTransfer(block)) {
                    onOpenWalletTrade()
                    return
                  }
                  if (needsImpactConfirm) {
                    setImpactConfirmed(true)
                    return
                  }
                  void handleTrade(Date.now())
                }}
              >
                {orderType === "limit" ? (
                  status === "placing_limit" ? (
                    t("placingOrder")
                  ) : (
                    t("placeLimitOrder")
                  )
                ) : block === "need_transfer" || block === "insufficient" ? (
                  t("notEnough")
                ) : needsImpactConfirm ? (
                  t("confirmImpact")
                ) : isBuy ? (
                  `${t("buy")} ${snapshot.base.symbol}`
                ) : (
                  `${t("sell")} ${snapshot.base.symbol}`
                )}
              </Button>
            )}

            <p className="text-center text-[10px] leading-snug text-muted-foreground/50">
              {t("orderDisclaimer")}
            </p>
          </div>
        </div>
      </Card>

      {isAuthenticated ? (
        <div className="flex min-h-0 flex-1 flex-col">{availableAssets}</div>
      ) : null}

      <TradeDepositDrawer
        open={depositDrawerOpen}
        onOpenChange={setDepositDrawerOpen}
        onOpenTransfer={onOpenWalletTrade}
      />
    </div>
  )
}
