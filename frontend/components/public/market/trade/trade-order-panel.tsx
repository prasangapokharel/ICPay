"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDataTransferHorizontalIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-provider"
import { useDebounced } from "@/hooks/ui/useDebounced"
import { useApplyTradeBalances, useTradeTokens, useTradingBalance, tradeBalanceKey } from "@/hooks/trade/useTrade"
import { useRefreshWallet, useTokenHolding } from "@/hooks/wallet/useWalletData"
import { parseTokenAmount, toPlainTokenAmount } from "@/lib/wallet/utils"
import { tradeOrderBlock } from "@/lib/market/tradeOrderBlock"
import { showWalletLine, tradeCta } from "@/lib/market/tradeAuthUi"
import { formatUsd } from "@/lib/market/format"
import { cn } from "@/lib/ui/utils"
import { maxTradeInput, minAmountOut } from "@/lib/trade/fees"
import { meetsMinTradeUsd, MIN_TRADE_USD, tokenAmountUsd } from "@/lib/market/minTradeUsd"
import { mergePositionBalances } from "@/lib/market/availableAssets"
import { tradePairPath } from "@/lib/market/pairSlug"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import {
  fetchTradeQuoteChecked,
  runTrade,
  warmTradeSession,
} from "@/services/trade/trade"
import type { TerminalPairRow, TradePairSnapshot } from "@/services/market/tradePairSnapshot"
import {
  addTradeFill,
  patchTradeFill,
  setTradeFillNotice,
} from "@/lib/market/tradeFillStore"
import { TradeSwapHistory } from "./trade-swap-history"
import { TradeOrderQuote } from "./trade-order-quote"
import { TradeAvailableAssets } from "./trade-available-assets"

const QUICK_FILLS = [25, 50, 75, 100] as const

type TradeStatus = "idle" | "error"

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
  const { isAuthenticated, isLoading: authLoading, identity } = useAuth()
  const applyBalances = useApplyTradeBalances()
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
  const [amountText, setAmountText] = useState("")
  const [status, setStatus] = useState<TradeStatus>("idle")
  const [tradeError, setTradeError] = useState<string | null>(null)

  const tokenIn = side === "buy" ? snapshot?.quote : snapshot?.base
  const tokenOut = side === "buy" ? snapshot?.base : snapshot?.quote
  const tradingBal = useTradingBalance(tokenIn?.ledgerId ?? null)
  const { token: walletToken } = useTokenHolding(isAuthenticated ? (tokenIn?.ledgerId ?? null) : null)
  const walletBal = walletToken?.balance ?? 0n

  const amountIn = amountText.trim() && tokenIn
    ? parseTokenAmount(amountText, tokenIn.decimals)
    : null
  const debouncedIn = useDebounced(amountIn, 200)

  const { data: quote, isLoading: quoting } = useSWR(
    snapshot && tokenIn && tokenOut && debouncedIn && debouncedIn > 0n
      ? ["terminal-quote", side, snapshot.baseLedgerId, debouncedIn.toString()]
      : null,
    () =>
      fetchTradeQuoteChecked(
        identity,
        tokenIn!.ledgerId,
        tokenOut!.ledgerId,
        debouncedIn!,
        { skipAllowlistCheck: true, tokenInFee: tokenIn!.fee, tokenOutFee: tokenOut!.fee }
      ),
    { revalidateOnFocus: false, dedupingInterval: 15_000 }
  )

  function payTokenUsd(): number | null {
    if (!amountIn || !tokenIn || !snapshot) return null
    if (side === "buy") {
      return tokenAmountUsd(amountIn, tokenIn.decimals, icpPrice?.usd ?? 0)
    }
    const tokenUsd =
      snapshot.stats?.priceUsd && snapshot.stats.priceUsd > 0
        ? snapshot.stats.priceUsd
        : snapshot.priceInIcp && icpPrice?.usd
          ? snapshot.priceInIcp * icpPrice.usd
          : 0
    return tokenAmountUsd(amountIn, tokenIn.decimals, tokenUsd)
  }

  function applyFill(pct: number) {
    if (!tradingBal || !tokenIn) return
    const maxIn = maxTradeInput(tradingBal, tokenIn.fee)
    const raw = (maxIn * BigInt(pct)) / 100n
    setAmountText(toPlainTokenAmount(raw, tokenIn.decimals))
  }

  async function handleTrade() {
    if (!snapshot || !tokenIn || !tokenOut || !amountIn || !quote) return
    const currentTradingBal = tradingBal
    if (currentTradingBal == null || amountIn > maxTradeInput(currentTradingBal, tokenIn.fee)) {
      setStatus("error")
      setTradeError(t("insufficientForFees"))
      return
    }
    const payUsd = payTokenUsd()
    if (!meetsMinTradeUsd(payUsd)) {
      setStatus("error")
      setTradeError(t("minTradeUsd", { usd: MIN_TRADE_USD }))
      return
    }
    const now = Date.now()
    if (now - lastClick.current < 600) return
    lastClick.current = now

    const clientId = `local-${now}`
    const quotedOut = quote.amountOutRaw ?? quote.amountOut
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
    setAmountText("")
    setStatus("idle")
    setTradeError(null)

    const amountOutMin = minAmountOut(quotedOut)
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
          at: Date.now(),
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
        at: Date.now(),
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
        at: Date.now(),
      })
      setStatus("error")
      const errorMsg = e instanceof Error ? e.message : "Trade failed"
      const userMsg = errorMsg.toLowerCase().includes("slippage")
        ? t("slippageExceeded")
        : errorMsg.toLowerCase().includes("liquidity")
          ? t("insufficientLiquidity")
          : errorMsg.toLowerCase().includes("timeout") || errorMsg.toLowerCase().includes("timed out")
            ? t("tradeTimeout")
            : errorMsg
      setTradeError(userMsg)
    }
  }

  if (loading && !snapshot) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-y-auto pb-2">
        <Card size="sm" className="m-1 gap-3 p-4">
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-md" />
        </Card>
        <Card size="sm" className="m-1 mb-1 flex min-h-[180px] flex-col overflow-hidden py-0">
          <div className="shrink-0 border-b px-4 py-3">
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="space-y-2 px-4 py-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-7 w-full rounded-md" />
            ))}
          </div>
        </Card>
        {isAuthenticated ? availableAssets : null}
      </div>
    )
  }

  if (!snapshot) {
    return isAuthenticated ? availableAssets : null
  }

  const paySymbol = tokenIn?.symbol ?? ""
  const receiveSymbol = tokenOut?.symbol ?? ""
  const hasAmount = Boolean(amountIn && amountIn > 0n)
  const maxIn = tradingBal !== null && tokenIn ? maxTradeInput(tradingBal, tokenIn.fee) : 0n
  const payUsd = payTokenUsd()
  const aboveMinUsd = meetsMinTradeUsd(payUsd)
  const block = tradeOrderBlock({
    tradingBal: tradingBal ?? 0n,
    amountIn,
    maxIn,
    aboveMinUsd,
    hasQuote: !!quote,
  })
  const isBuy = side === "buy"
  const cta = tradeCta(authLoading, isAuthenticated)

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden pb-1">
      <Card size="sm" className="m-1 shrink-0 gap-0 overflow-visible py-0">
        <Tabs
          value={side}
          onValueChange={(v) => {
            setSide(v as "buy" | "sell")
            setAmountText("")
            setStatus("idle")
            setTradeError(null)
          }}
          className="flex min-h-0 flex-col"
        >
          <div className="flex items-center border-b pr-2">
            <TabsList variant="line" className="min-w-0 flex-1 justify-start border-0 px-4">
              <TabsTrigger
                value="buy"
                className="data-active:text-emerald-500 group-data-[variant=line]/tabs-list:data-active:after:bg-emerald-500"
              >
                {t("buy")} {snapshot.base.symbol}
              </TabsTrigger>
              <TabsTrigger
                value="sell"
                className="data-active:text-rose-500 group-data-[variant=line]/tabs-list:data-active:after:bg-rose-500"
              >
                {t("sell")} {snapshot.base.symbol}
              </TabsTrigger>
            </TabsList>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label={t("transfer")}
              onClick={onOpenWalletTrade}
            >
              <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} className="size-3.5" strokeWidth={2} />
            </Button>
          </div>

          <div className="flex min-h-0 flex-col gap-2 overflow-y-auto px-4 pb-3 pt-3">
            {isAuthenticated && tokenIn && (
              <div className="space-y-0.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("balance")}</span>
                  <span
                    className={cn(
                      "tabular-nums font-medium",
                      (tradingBal ?? 0n) <= 0n && "text-muted-foreground"
                    )}
                  >
                    {tradingBal !== null
                      ? `${toPlainTokenAmount(tradingBal, tokenIn.decimals)} ${paySymbol}`
                      : "—"}
                  </span>
                </div>
                {showWalletLine(walletBal) ? (
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{t("mainWallet")}</span>
                    <span className="tabular-nums">
                      {toPlainTokenAmount(walletBal, tokenIn.decimals)} {paySymbol}
                    </span>
                  </div>
                ) : null}
              </div>
            )}

            <div className="overflow-hidden rounded-md border border-border/50 bg-background/60">
              <div className="relative">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                  {t("amountLabel")}
                </span>
                <Input
                  inputMode="decimal"
                  placeholder="0.00"
                  className="h-10 border-0 bg-transparent pl-16 pr-12 text-right text-sm tabular-nums shadow-none focus-visible:ring-0"
                  value={amountText}
                  onChange={(e) => {
                    setAmountText(e.target.value)
                    setStatus("idle")
                    setTradeError(null)
                  }}
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground">
                  {paySymbol}
                </span>
              </div>
              {hasAmount ? (
                <div className="flex items-center justify-between border-t border-border/40 px-2.5 py-1.5 text-[11px]">
                  <span className="text-muted-foreground">{t("total")}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {payUsd !== null ? formatUsd(payUsd, 2) : "—"}
                  </span>
                </div>
              ) : null}
            </div>

            {isAuthenticated && tradingBal !== null && tradingBal > 0n && (
              <div className="grid grid-cols-4 gap-1">
                {QUICK_FILLS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyFill(pct)}
                    className="rounded border border-border/50 bg-muted/20 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-foreground"
                  >
                    {pct === 100 ? t("max") : `${pct}%`}
                  </button>
                ))}
              </div>
            )}

            {hasAmount && tokenIn && tokenOut ? (
              <TradeOrderQuote
                quote={quote}
                quoting={quoting}
                paySymbol={paySymbol}
                receiveSymbol={receiveSymbol}
                payDecimals={tokenIn.decimals}
                outDecimals={tokenOut.decimals}
              />
            ) : null}

            {status === "error" && tradeError ? (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-xs">{tradeError}</AlertDescription>
              </Alert>
            ) : null}

            {block === "insufficient" && (
              <p className="text-[11px] text-destructive">{t("notEnough")}</p>
            )}

            {cta === "wait" ? (
              <Skeleton className="h-10 w-full rounded-md" />
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
                  "w-full font-semibold text-white",
                  isBuy
                    ? "bg-emerald-500 hover:bg-emerald-500/90"
                    : "bg-rose-500 hover:bg-rose-500/90"
                )}
                disabled={block !== "ok" && block !== "need_transfer"}
                onClick={() => {
                  if (block === "need_transfer") {
                    onOpenWalletTrade()
                    return
                  }
                  void handleTrade()
                }}
              >
                {block === "need_transfer" ? (
                  t("notEnough")
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
        </Tabs>
      </Card>

      {isAuthenticated && (
        <div className="flex min-h-0 flex-1 flex-col">
          <TradeSwapHistory snapshot={snapshot} />
        </div>
      )}

      {isAuthenticated ? availableAssets : null}
    </div>
  )
}
