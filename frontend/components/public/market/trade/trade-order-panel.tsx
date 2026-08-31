"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { useTranslations } from "next-intl"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/components/auth/auth-provider"
import { useDebounced } from "@/hooks/ui/useDebounced"
import { formatTokenAmount, parseTokenAmount } from "@/lib/wallet/utils"
import { DEFAULT_SLIPPAGE_BPS } from "@/lib/trade/fees"
import { cn } from "@/lib/ui/utils"
import { fetchTradeQuoteChecked } from "@/services/trade/trade"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

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

  if (loading && !snapshot) {
    return <div className="h-full min-h-[320px] animate-pulse bg-muted/20" />
  }

  if (!snapshot) return null

  const paySymbol = tokenIn?.symbol ?? ""
  const receiveSymbol = tokenOut?.symbol ?? ""

  return (
    <div className="flex h-full min-h-[280px] flex-col border-l border-border/60 bg-card/40">
      <Tabs
        value={side}
        onValueChange={(v) => setSide(v as "buy" | "sell")}
        className="flex h-full flex-col"
      >
        <TabsList className="m-3 grid w-auto grid-cols-2 bg-muted/40">
          <TabsTrigger value="buy" className="data-[state=active]:bg-emerald-500/15">
            {t("buy")}
          </TabsTrigger>
          <TabsTrigger value="sell" className="data-[state=active]:bg-red-500/15">
            {t("sell")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={side} className="mt-0 flex flex-1 flex-col gap-4 px-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="terminal-amount">{t("amount", { symbol: paySymbol })}</Label>
            <Input
              id="terminal-amount"
              inputMode="decimal"
              placeholder="0"
              className="h-11 bg-background/60"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
            />
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-sm">
            <p className="text-muted-foreground">{t("youReceive")}</p>
            <div className="mt-1 flex items-center gap-2">
              {quoting && <Spinner className="size-4 text-muted-foreground" />}
              <p className="text-lg font-semibold tabular-nums">
                {quote && tokenOut
                  ? `${formatTokenAmount(quote.amountOut, tokenOut.decimals)} ${receiveSymbol}`
                  : "—"}
              </p>
            </div>
            {quote && (
              <p className="mt-2 text-xs text-muted-foreground tabular-nums">
                {t("poolFee")}: {formatTokenAmount(quote.swapFee, tokenIn?.decimals ?? 8)}{" "}
                {paySymbol}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {t("slippage")}: {(Number(DEFAULT_SLIPPAGE_BPS) / 100).toFixed(0)}%
            </p>
          </div>

          {isAuthenticated ? (
            <Link
              href={tradeHref}
              className={cn(buttonVariants(), "mt-auto h-11 w-full rounded-xl")}
            >
              {t("openWalletTrade")}
            </Link>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(tradeHref)}`}
              className={cn(buttonVariants(), "mt-auto h-11 w-full rounded-xl")}
            >
              {t("signInToTrade")}
            </Link>
          )}

          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            {t("orderDisclaimer")}
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
