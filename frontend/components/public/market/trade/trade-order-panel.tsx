"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { useTranslations } from "next-intl"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/components/auth/auth-provider"
import { useTokenHolding, useTransactions } from "@/hooks/wallet/useWalletData"
import { useDebounced } from "@/hooks/ui/useDebounced"
import { formatTokenAmount, parseTokenAmount } from "@/lib/wallet/utils"
import { DEFAULT_SLIPPAGE_BPS } from "@/lib/trade/fees"
import { cn } from "@/lib/ui/utils"
import { fetchTradeQuoteChecked } from "@/services/trade/trade"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

const QUICK_FILLS = [25, 50, 75, 100] as const

function timeAgo(ts: bigint): string {
  const ms = Number(ts / 1_000_000n)
  const diffS = Math.floor((Date.now() - ms) / 1000)
  if (diffS < 60) return `${diffS}s ago`
  if (diffS < 3600) return `${Math.floor(diffS / 60)}m ago`
  if (diffS < 86400) return `${Math.floor(diffS / 3600)}h ago`
  return `${Math.floor(diffS / 86400)}d ago`
}

function SwapHistory({
  snapshot,
}: {
  snapshot: TradePairSnapshot
}) {
  const t = useTranslations("marketTrade")
  const { items, isLoading } = useTransactions(0, 15)

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
    <div className="mt-auto border-t border-border/50">
      <p className="px-4 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {t("recentSwaps")}
      </p>
      {isLoading ? (
        <div className="space-y-1.5 px-4 pb-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-7 animate-pulse rounded bg-muted/40" />
          ))}
        </div>
      ) : swaps.length === 0 ? (
        <p className="px-4 pb-3 text-xs text-muted-foreground">{t("noRecentSwaps")}</p>
      ) : (
        <ul className="space-y-0.5 px-4 pb-3">
          {swaps.map((tx) => {
            const isBuy = "swapIn" in tx.txType
            const isBase = tx.ledgerId === snapshot.baseLedgerId
            const symbol = isBase ? snapshot.base.symbol : snapshot.quote.symbol
            const decimals = isBase ? snapshot.base.decimals : snapshot.quote.decimals
            return (
              <li key={tx.id} className="flex items-center justify-between text-xs">
                <span
                  className={cn(
                    "font-medium",
                    isBuy ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {isBuy ? t("swapBuy") : t("swapSell")}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatTokenAmount(tx.amount, decimals)} {symbol}
                </span>
                <span className="text-[10px] text-muted-foreground/60">{timeAgo(tx.createdAt)}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function TradeOrderPanel({
  snapshot,
  loading,
}: {
  snapshot: TradePairSnapshot | undefined
  loading?: boolean
}) {
  const t = useTranslations("marketTrade")
  const { isAuthenticated, identity } = useAuth()
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [amountText, setAmountText] = useState("")

  const tokenIn = side === "buy" ? snapshot?.quote : snapshot?.base
  const tokenOut = side === "buy" ? snapshot?.base : snapshot?.quote

  const { token: inHolding } = useTokenHolding(tokenIn?.ledgerId ?? null)
  const walletBalance = isAuthenticated ? (inHolding?.balance ?? null) : null
  const balanceHuman =
    walletBalance !== null && tokenIn
      ? formatTokenAmount(walletBalance, tokenIn.decimals)
      : null

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
        {
          skipAllowlistCheck: true,
          tokenInFee: tokenIn!.fee,
          tokenOutFee: tokenOut!.fee,
        }
      ),
    { revalidateOnFocus: false, dedupingInterval: 5_000 }
  )

  const tradeHref = useMemo(() => {
    if (!snapshot) return "/trade"
    const from = side === "buy" ? snapshot.quoteLedgerId : snapshot.baseLedgerId
    const to = side === "buy" ? snapshot.baseLedgerId : snapshot.quoteLedgerId
    return `/trade?from=${from}&to=${to}`
  }, [side, snapshot])

  function applyFill(pct: number) {
    if (!walletBalance || !tokenIn) return
    const raw = (walletBalance * BigInt(pct)) / 100n
    setAmountText(formatTokenAmount(raw, tokenIn.decimals))
  }

  if (loading && !snapshot) {
    return <div className="h-full min-h-[320px] animate-pulse bg-muted/20" />
  }

  if (!snapshot) return null

  const paySymbol = tokenIn?.symbol ?? ""
  const receiveSymbol = tokenOut?.symbol ?? ""
  const slippagePct = (Number(DEFAULT_SLIPPAGE_BPS) / 100).toFixed(0)

  return (
    <div className="flex h-full min-h-[380px] flex-col border-l border-border/60 bg-card/40">
      {/* Buy / Sell tabs */}
      <Tabs
        value={side}
        onValueChange={(v) => {
          setSide(v as "buy" | "sell")
          setAmountText("")
        }}
        className="flex h-full min-h-0 flex-col"
      >
        <TabsList className="m-3 mb-0 grid grid-cols-2 rounded-lg bg-muted/40 p-0.5">
          <TabsTrigger
            value="buy"
            className="rounded-md text-xs data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 data-[state=active]:shadow-none"
          >
            {t("buy")} {snapshot.base.symbol}
          </TabsTrigger>
          <TabsTrigger
            value="sell"
            className="rounded-md text-xs data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 data-[state=active]:shadow-none"
          >
            {t("sell")} {snapshot.base.symbol}
          </TabsTrigger>
        </TabsList>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3 pt-3">
          {/* Balance row */}
          {isAuthenticated && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t("balance")}</span>
              <span className="tabular-nums font-medium">
                {balanceHuman !== null ? `${balanceHuman} ${paySymbol}` : "—"}
              </span>
            </div>
          )}

          {/* Amount input */}
          <div className="relative">
            <Input
              id="terminal-amount"
              inputMode="decimal"
              placeholder="0.00"
              className="h-10 bg-background/70 pr-14 text-sm tabular-nums"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
              {paySymbol}
            </span>
          </div>

          {/* Quick fill */}
          {isAuthenticated && walletBalance !== null && walletBalance > 0n && (
            <div className="grid grid-cols-4 gap-1">
              {QUICK_FILLS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => applyFill(pct)}
                  className="rounded border border-border/60 bg-muted/30 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
                >
                  {pct === 100 ? "MAX" : `${pct}%`}
                </button>
              ))}
            </div>
          )}

          {/* Output */}
          <div className="rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t("youReceive")}</span>
              {quoting && <Spinner className="size-3 text-muted-foreground" />}
            </div>
            <div className="mt-1 text-base font-semibold tabular-nums">
              {quote && tokenOut
                ? `${formatTokenAmount(quote.amountOut, tokenOut.decimals)} ${receiveSymbol}`
                : <span className="text-muted-foreground">—</span>}
            </div>
          </div>

          {/* Fee / slippage */}
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

          {/* CTA */}
          {isAuthenticated ? (
            <Link
              href={tradeHref}
              className={cn(
                buttonVariants(),
                "h-10 w-full rounded-lg text-sm",
                side === "buy"
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-red-600 hover:bg-red-500"
              )}
            >
              {t("openWalletTrade")}
            </Link>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(tradeHref)}`}
              className={cn(buttonVariants({ variant: "outline" }), "h-10 w-full rounded-lg text-sm")}
            >
              {t("signInToTrade")}
            </Link>
          )}

          <p className="text-center text-[10px] leading-relaxed text-muted-foreground/60">
            {t("orderDisclaimer")}
          </p>
        </div>

        {/* Swap history — only for authenticated users */}
        {isAuthenticated && <SwapHistory snapshot={snapshot} />}
      </Tabs>
    </div>
  )
}
