"use client"

import { useMemo, useRef, useState } from "react"
import useSWR from "swr"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-provider"
import {
  useTokenHolding,
  useTransactions,
  useRefreshWallet,
} from "@/hooks/wallet/useWalletData"
import { useDebounced } from "@/hooks/ui/useDebounced"
import { formatTokenAmount, parseTokenAmount } from "@/lib/wallet/utils"
import { DEFAULT_SLIPPAGE_BPS, minAmountOut } from "@/lib/trade/fees"
import { cn } from "@/lib/ui/utils"
import {
  fetchTradeQuoteChecked,
  runTrade,
  warmTradeSession,
} from "@/services/trade/trade"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

const QUICK_FILLS = [25, 50, 75, 100] as const

function timeAgo(ts: bigint): string {
  const diffS = Math.floor((Date.now() - Number(ts / 1_000_000n)) / 1000)
  if (diffS < 60) return `${diffS}s`
  if (diffS < 3600) return `${Math.floor(diffS / 60)}m`
  if (diffS < 86400) return `${Math.floor(diffS / 3600)}h`
  return `${Math.floor(diffS / 86400)}d`
}

function SwapHistory({ snapshot }: { snapshot: TradePairSnapshot }) {
  const t = useTranslations("marketTrade")
  const { items, isLoading } = useTransactions(0, 20)

  const swaps = useMemo(
    () =>
      items
        .filter(
          (tx) =>
            ("swapIn" in tx.txType || "swapOut" in tx.txType) &&
            (tx.ledgerId === snapshot.baseLedgerId ||
              tx.ledgerId === snapshot.quoteLedgerId)
        )
        .slice(0, 4),
    [items, snapshot.baseLedgerId, snapshot.quoteLedgerId]
  )

  return (
    <div className="border-t border-border/40 px-3 py-2.5">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {t("recentSwaps")}
      </p>
      {isLoading ? (
        <div className="space-y-1.5">
          {[0, 1].map((i) => (
            <div key={i} className="h-6 animate-pulse rounded bg-muted/40" />
          ))}
        </div>
      ) : swaps.length === 0 ? (
        <p className="text-xs text-muted-foreground/60">{t("noRecentSwaps")}</p>
      ) : (
        <ul className="space-y-1">
          {swaps.map((tx) => {
            const isBuy = "swapIn" in tx.txType
            const isBase = tx.ledgerId === snapshot.baseLedgerId
            const sym = isBase ? snapshot.base.symbol : snapshot.quote.symbol
            const dec = isBase ? snapshot.base.decimals : snapshot.quote.decimals
            return (
              <li key={tx.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-xs">
                <span
                  className={cn(
                    "w-10 font-semibold",
                    isBuy ? "text-primary" : "text-destructive"
                  )}
                >
                  {isBuy ? t("swapBuy") : t("swapSell")}
                </span>
                <span className="truncate tabular-nums text-foreground/80">
                  {formatTokenAmount(tx.amount, dec)} {sym}
                </span>
                <span className="text-[10px] text-muted-foreground/50">
                  {timeAgo(tx.createdAt)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

type TradeStatus = "idle" | "trading" | "success" | "error"

export function TradeOrderPanel({
  snapshot,
  loading,
}: {
  snapshot: TradePairSnapshot | undefined
  loading?: boolean
}) {
  const t = useTranslations("marketTrade")
  const { isAuthenticated, identity } = useAuth()
  const refresh = useRefreshWallet()
  const tradeLock = useRef(false)

  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [amountText, setAmountText] = useState("")
  const [status, setStatus] = useState<TradeStatus>("idle")
  const [tradeError, setTradeError] = useState<string | null>(null)

  const tokenIn = side === "buy" ? snapshot?.quote : snapshot?.base
  const tokenOut = side === "buy" ? snapshot?.base : snapshot?.quote

  const { token: inHolding } = useTokenHolding(tokenIn?.ledgerId ?? null)
  const walletBalance = isAuthenticated ? (inHolding?.balance ?? null) : null

  const amountIn = useMemo(() => {
    if (!tokenIn || !amountText.trim()) return null
    return parseTokenAmount(amountText, tokenIn.decimals)
  }, [amountText, tokenIn])

  const debouncedIn = useDebounced(amountIn, 400)

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
    { revalidateOnFocus: false, dedupingInterval: 5_000 }
  )

  function applyFill(pct: number) {
    if (!walletBalance || !tokenIn) return
    const raw = (walletBalance * BigInt(pct)) / 100n
    setAmountText(formatTokenAmount(raw, tokenIn.decimals))
  }

  async function handleTrade() {
    if (!snapshot || !tokenIn || !tokenOut || !amountIn || !quote) return
    if (tradeLock.current) return
    tradeLock.current = true
    setStatus("trading")
    setTradeError(null)
    void warmTradeSession(identity)
    try {
      const amountOutMin = minAmountOut(quote.amountOutRaw ?? quote.amountOut)
      const result = await runTrade(
        identity,
        tokenIn.ledgerId,
        tokenOut.ledgerId,
        amountIn,
        amountOutMin
      )
      if ("err" in result) {
        setStatus("error")
        setTradeError(result.err)
      } else {
        setStatus("success")
        setAmountText("")
        refresh()
        setTimeout(() => setStatus("idle"), 4000)
      }
    } catch (e) {
      setStatus("error")
      setTradeError(e instanceof Error ? e.message : "Trade failed")
    } finally {
      tradeLock.current = false
    }
  }

  if (loading && !snapshot) {
    return <div className="h-full min-h-[340px] animate-pulse rounded-none bg-muted/20" />
  }

  if (!snapshot) return null

  const paySymbol = tokenIn?.symbol ?? ""
  const receiveSymbol = tokenOut?.symbol ?? ""
  const slippagePct = (Number(DEFAULT_SLIPPAGE_BPS) / 100).toFixed(0)
  const hasAmount = amountIn && amountIn > 0n
  const canTrade = isAuthenticated && hasAmount && !!quote && status !== "trading"
  const isBuy = side === "buy"

  return (
    <div className="flex h-full flex-col border-l border-border/60 bg-card/30">
      <Tabs
        value={side}
        onValueChange={(v) => {
          setSide(v as "buy" | "sell")
          setAmountText("")
          setStatus("idle")
          setTradeError(null)
        }}
        className="flex h-full min-h-0 flex-col"
      >
        {/* Tab bar */}
        <div className="px-3 pt-3">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-0.5">
            <TabsTrigger
              value="buy"
              className="rounded text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
            >
              {t("buy")} {snapshot.base.symbol}
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              className="rounded text-xs font-medium data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground data-[state=active]:shadow-none"
            >
              {t("sell")} {snapshot.base.symbol}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3 pt-2.5">
          {/* Balance */}
          {isAuthenticated && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t("balance")}</span>
              <span className="tabular-nums font-medium">
                {walletBalance !== null && tokenIn
                  ? `${formatTokenAmount(walletBalance, tokenIn.decimals)} ${paySymbol}`
                  : "—"}
              </span>
            </div>
          )}

          {/* Amount */}
          <div className="relative">
            <Input
              inputMode="decimal"
              placeholder="0.00"
              className="h-10 bg-background/60 pr-14 text-sm tabular-nums"
              value={amountText}
              onChange={(e) => {
                setAmountText(e.target.value)
                setStatus("idle")
                setTradeError(null)
              }}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground">
              {paySymbol}
            </span>
          </div>

          {/* Quick fills */}
          {isAuthenticated && walletBalance !== null && walletBalance > 0n && (
            <div className="grid grid-cols-4 gap-1">
              {QUICK_FILLS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => applyFill(pct)}
                  className="rounded border border-border/50 bg-muted/20 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-foreground"
                >
                  {pct === 100 ? "MAX" : `${pct}%`}
                </button>
              ))}
            </div>
          )}

          {/* Estimated output */}
          <div className="rounded-md border border-border/40 bg-muted/10 px-2.5 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">{t("youReceive")}</span>
              {quoting && <Spinner className="size-3 text-muted-foreground" />}
            </div>
            <div className="mt-0.5 text-sm font-semibold tabular-nums">
              {quote && tokenOut ? (
                `${formatTokenAmount(quote.amountOut, tokenOut.decimals)} ${receiveSymbol}`
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>

          {/* Fee row */}
          <div className="space-y-1 text-[11px] text-muted-foreground">
            {quote && (
              <div className="flex justify-between">
                <span>{t("poolFee")}</span>
                <span className="tabular-nums">
                  {formatTokenAmount(quote.swapFee, tokenIn?.decimals ?? 8)} {paySymbol}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{t("slippage")}</span>
              <span>{slippagePct}%</span>
            </div>
          </div>

          {/* Status alerts */}
          {status === "success" && (
            <Alert className="border-primary/30 bg-primary/10 py-2">
              <AlertDescription className="text-xs text-primary">
                {t("tradeSuccess")}
              </AlertDescription>
            </Alert>
          )}
          {status === "error" && tradeError && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-xs">
                {tradeError}
              </AlertDescription>
            </Alert>
          )}

          {/* CTA */}
          {isAuthenticated ? (
            <Button
              className={cn(
                "mt-auto h-10 w-full rounded-lg text-sm font-medium",
                isBuy
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
              disabled={!canTrade}
              onClick={handleTrade}
            >
              {status === "trading" ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-3.5" />
                  {t("trading")}
                </span>
              ) : isBuy ? (
                `${t("buy")} ${snapshot.base.symbol}`
              ) : (
                `${t("sell")} ${snapshot.base.symbol}`
              )}
            </Button>
          ) : (
            <a
              href={`/login?next=${encodeURIComponent(`/market/trade?base=${snapshot.baseLedgerId}`)}`}
              className={cn(
                "mt-auto flex h-10 w-full items-center justify-center rounded-lg border border-border/60 bg-muted/20 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
              )}
            >
              {t("signInToTrade")}
            </a>
          )}

          <p className="text-center text-[10px] text-muted-foreground/50">
            {t("orderDisclaimer")}
          </p>
        </div>

        {/* Swap history */}
        {isAuthenticated && <SwapHistory snapshot={snapshot} />}
      </Tabs>
    </div>
  )
}
