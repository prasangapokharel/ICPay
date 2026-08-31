"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth/auth-provider"
import { formatTokenAmount, parseTokenAmount } from "@/lib/wallet/utils"
import { DEFAULT_SLIPPAGE_BPS } from "@/lib/trade/fees"
import { cn } from "@/lib/ui/utils"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

export function TradeOrderPanel({
  snapshot,
  loading,
}: {
  snapshot: TradePairSnapshot | undefined
  loading?: boolean
}) {
  const t = useTranslations("marketTrade")
  const { isAuthenticated } = useAuth()
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [amountText, setAmountText] = useState("")

  const amountIn = useMemo(() => {
    if (!snapshot || !amountText.trim()) return null
    const decimals = side === "buy" ? snapshot.quoteDecimals : snapshot.baseDecimals
    return parseTokenAmount(amountText, decimals)
  }, [amountText, side, snapshot])

  const estimatedOut = useMemo(() => {
    if (!snapshot || amountIn === null || amountIn <= 0n || !snapshot.sampleQuoteOut) return null
    if (snapshot.sampleAmountIn <= 0n) return null
    const scaled = (amountIn * snapshot.sampleQuoteOut) / snapshot.sampleAmountIn
    return scaled > 0n ? scaled : null
  }, [amountIn, snapshot])

  const tradeHref = useMemo(() => {
    if (!snapshot) return "/trade"
    const from = side === "buy" ? snapshot.quoteLedgerId : snapshot.baseLedgerId
    const to = side === "buy" ? snapshot.baseLedgerId : snapshot.quoteLedgerId
    return `/trade?from=${from}&to=${to}`
  }, [side, snapshot])

  if (loading && !snapshot) {
    return <div className="h-full min-h-[320px] animate-pulse bg-muted/30" />
  }

  if (!snapshot) return null

  const paySymbol = side === "buy" ? snapshot.quoteSymbol : snapshot.baseSymbol
  const receiveSymbol = side === "buy" ? snapshot.baseSymbol : snapshot.quoteSymbol
  const receiveDecimals = side === "buy" ? snapshot.baseDecimals : snapshot.quoteDecimals

  return (
    <div className="flex h-full min-h-0 flex-col border-l border-border/60 bg-card/50">
      <Tabs
        value={side}
        onValueChange={(v) => setSide(v as "buy" | "sell")}
        className="flex h-full flex-col"
      >
        <TabsList className="m-3 grid w-auto grid-cols-2">
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
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
            />
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-sm">
            <p className="text-muted-foreground">{t("youReceive")}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {estimatedOut !== null
                ? `${formatTokenAmount(estimatedOut, receiveDecimals)} ${receiveSymbol}`
                : "—"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
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

          <p className="text-center text-[11px] text-muted-foreground">{t("orderDisclaimer")}</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
