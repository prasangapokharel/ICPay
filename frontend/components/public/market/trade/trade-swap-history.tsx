"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDataTransferHorizontalIcon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import { useTokenHoldings, useTransactions } from "@/hooks/wallet/useWalletData"
import { useTradeFills } from "@/hooks/market/useTradeFills"
import { useOpenLimitOrders, useRefreshTradeBalances, useUserLimitOrders, useUserTrades } from "@/hooks/trade/useTrade"
import { cancelLimitOrder } from "@/services/trade/trade"
import { ICP_LEDGER_ID } from "@/services/tokens"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { swapHashHref, swapHashLabel, truncateHash } from "@/lib/market/swapHash"
import { mergeRecentSwaps } from "@/lib/market/recentSwaps"
import { cn } from "@/lib/ui/utils"
import type { FillStatus } from "@/lib/market/tradeFillStore"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

function timeAgoNs(ns: bigint): string {
  const ms = Number(ns / 1_000_000n)
  const diffS = Math.floor((Date.now() - ms) / 1000)
  if (diffS < 60) return `${diffS}s`
  if (diffS < 3600) return `${Math.floor(diffS / 60)}m`
  if (diffS < 86400) return `${Math.floor(diffS / 3600)}h`
  return `${Math.floor(diffS / 86400)}d`
}

function timeAgoMs(ms: number): string {
  const diffS = Math.floor((Date.now() - ms) / 1000)
  if (diffS < 60) return `${diffS}s`
  if (diffS < 3600) return `${Math.floor(diffS / 60)}m`
  if (diffS < 86400) return `${Math.floor(diffS / 3600)}h`
  return `${Math.floor(diffS / 86400)}d`
}

function formatOrderPrice(price: number): string {
  if (price === 0) return "0.00"
  if (price < 0.000001) return price.toExponential(4)
  if (price < 0.0001) return price.toFixed(8)
  if (price < 1) return price.toFixed(6)
  if (price < 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function TradeSwapHistory({
  snapshot,
}: {
  snapshot: TradePairSnapshot | undefined
}) {
  const t = useTranslations("marketTrade")
  const { isAuthenticated, identity } = useAuth()
  const [activeTab, setActiveTab] = useState<"swaps" | "openOrders" | "orderHistory" | "audit">("swaps")
  const [cancellingId, setCancellingId] = useState<bigint | null>(null)

  const { items, isLoading: txLoading } = useTransactions(0, 80)
  const { holdings } = useTokenHoldings()
  const localFills = useTradeFills()
  const { openOrders, isLoading: openLoading, refresh: refreshOpen } = useOpenLimitOrders(true)
  const { orders: allOrders, isLoading: allLoading, refresh: refreshAll } = useUserLimitOrders(50)
  const { trades, isLoading: tradesLoading, refresh: refreshTrades } = useUserTrades(50)
  const refreshTradeBalances = useRefreshTradeBalances()

  const findToken = useMemo(() => {
    return (ledgerId: string): { symbol: string; decimals: number } => {
      if (snapshot?.base && snapshot.baseLedgerId === ledgerId) {
        return { symbol: snapshot.base.symbol, decimals: snapshot.base.decimals }
      }
      if (snapshot?.quote && snapshot.quoteLedgerId === ledgerId) {
        return { symbol: snapshot.quote.symbol, decimals: snapshot.quote.decimals }
      }
      const found = holdings.find((h) => h.ledgerId === ledgerId)
      if (found) return { symbol: found.symbol, decimals: found.decimals }
      if (ledgerId === ICP_LEDGER_ID) return { symbol: "ICP", decimals: 8 }
      return { symbol: "Token", decimals: 8 }
    }
  }, [holdings, snapshot])

  const swaps = useMemo(
    () =>
      snapshot
        ? mergeRecentSwaps(localFills, items, snapshot).map((row) => ({
            ...row,
            ago: timeAgoMs(row.at),
          }))
        : [],
    [items, localFills, snapshot]
  )

  async function handleCancelOrder(orderId: bigint) {
    if (!identity || cancellingId !== null) return
    setCancellingId(orderId)
    try {
      const res = await cancelLimitOrder(identity, orderId)
      if ("ok" in res) {
        await Promise.all([
          refreshOpen(),
          refreshAll(),
          refreshTrades(),
          refreshTradeBalances(),
        ])
      }
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <Card size="sm" className="m-1 mb-1 flex min-h-[240px] flex-1 flex-col overflow-hidden py-0">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="flex h-full min-h-0 flex-1 flex-col"
      >
        <CardHeader className="shrink-0 border-b px-3 py-1.5">
          <div className="flex items-center justify-between">
            <TabsList variant="line" className="h-7 border-0 p-0">
              <TabsTrigger value="swaps" className="h-7 text-xs font-semibold">
                {t("recentSwaps")}
              </TabsTrigger>
              {isAuthenticated ? (
                <>
                  <TabsTrigger value="openOrders" className="h-7 text-xs font-semibold">
                    {t("tabOpenOrders")}
                    {openOrders.length > 0 && (
                      <span className="ml-1 text-[11px] font-semibold text-primary">
                        ({openOrders.length})
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="orderHistory" className="h-7 text-xs font-semibold">
                    {t("tabOrderHistory")}
                  </TabsTrigger>
                  <TabsTrigger value="audit" className="h-7 text-xs font-semibold">
                    {t("tabTrades")}
                  </TabsTrigger>
                </>
              ) : null}
            </TabsList>
          </div>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-0 pb-1">
          {/* 1. Recent Swaps Tab */}
          <TabsContent value="swaps" className="m-0 h-full p-0">
            {!snapshot || (txLoading && swaps.length === 0) ? (
              <div className="flex h-36 items-center justify-center p-6">
                <Spinner className="size-6 text-muted-foreground/60" />
              </div>
            ) : swaps.length === 0 ? (
              <Empty className="border-0 py-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} className="size-5" strokeWidth={2} />
                  </EmptyMedia>
                  <EmptyTitle className="text-sm">{t("recentSwaps")}</EmptyTitle>
                  <EmptyDescription className="text-xs">{t("noRecentSwaps")}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="h-7.5 border-b border-border/40 hover:bg-transparent">
                    <TableHead className="h-7.5 w-[75px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("colSide")}</TableHead>
                    <TableHead className="h-7.5 w-[140px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("colAmount")}</TableHead>
                    <TableHead className="h-7.5 w-[100px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("colHash")}</TableHead>
                    <TableHead className="h-7.5 w-[90px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("colStatus")}</TableHead>
                    <TableHead className="h-7.5 px-2.5 text-right text-[11px] font-semibold text-muted-foreground">{t("colTime")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {swaps.map((row) => (
                    <TableRow key={row.id} className="h-7.5 border-b border-border/20 hover:bg-muted/30">
                      <TableCell
                        className={cn(
                          "py-1.5 px-2.5 text-xs font-semibold",
                          row.isBuy ? "text-emerald-500" : "text-rose-500"
                        )}
                      >
                        {row.isBuy ? t("swapBuy") : t("swapSell")}
                      </TableCell>
                      <TableCell className="py-1.5 px-2.5 font-mono text-xs tabular-nums font-medium text-foreground">
                        {formatTokenAmount(row.amount, row.decimals)}{" "}
                        <span className="font-sans text-[11px] text-muted-foreground">{row.symbol}</span>
                      </TableCell>
                      <TableCell className="py-1.5 px-2.5">
                        <SwapHashCell id={row.id} blockIndex={row.blockIndex} />
                      </TableCell>
                      <TableCell className="py-1.5 px-2.5">
                        <FillStatusCell status={row.status} filling={t("fillFilling")} filled={t("fillFilled")} failed={t("fillFailed")} />
                      </TableCell>
                      <TableCell className="py-1.5 px-2.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                        {row.ago}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* 2. Open Limit Orders Tab */}
          <TabsContent value="openOrders" className="m-0 h-full p-0">
            {openLoading && openOrders.length === 0 ? (
              <div className="flex h-36 items-center justify-center p-6">
                <Spinner className="size-6 text-muted-foreground/60" />
              </div>
            ) : openOrders.length === 0 ? (
              <Empty className="border-0 py-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} className="size-5" strokeWidth={2} />
                  </EmptyMedia>
                  <EmptyTitle className="text-sm">{t("tabOpenOrders")}</EmptyTitle>
                  <EmptyDescription className="text-xs">{t("noOpenOrders")}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="h-7.5 border-b border-border/40 hover:bg-transparent">
                    <TableHead className="h-7.5 w-[80px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("colSide")}</TableHead>
                    <TableHead className="h-7.5 w-[130px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("price")}</TableHead>
                    <TableHead className="h-7.5 w-[130px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("colAmount")}</TableHead>
                    <TableHead className="h-7.5 w-[130px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("total")}</TableHead>
                    <TableHead className="h-7.5 w-[85px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("colStatus")}</TableHead>
                    <TableHead className="h-7.5 w-[65px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("colTime")}</TableHead>
                    <TableHead className="h-7.5 px-2.5 text-right text-[11px] font-semibold text-muted-foreground">{t("cancelOrder")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openOrders.map((order) => {
                    const inTok = findToken(order.tokenIn)
                    const outTok = findToken(order.tokenOut)

                    const isBuy = order.tokenIn === ICP_LEDGER_ID
                    const baseTok = isBuy ? outTok : inTok
                    const quoteTok = isBuy ? inTok : outTok
                    const baseAmount = isBuy ? order.minAmountOut : order.amountIn
                    const quoteTotal = isBuy ? order.amountIn : order.minAmountOut

                    const baseUnits = Number(baseAmount) / Math.pow(10, baseTok.decimals)
                    const quoteUnits = Number(quoteTotal) / Math.pow(10, quoteTok.decimals)
                    const pricePerUnit = baseUnits > 0 ? quoteUnits / baseUnits : 0

                    return (
                      <TableRow key={order.id.toString()} className="h-7.5 border-b border-border/20 hover:bg-muted/30">
                        <TableCell className="py-1.5 px-2.5">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "font-semibold text-[10px] px-1.5 py-0",
                              isBuy
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {isBuy ? t("buy") : t("sell")} {baseTok.symbol}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 font-mono text-xs tabular-nums font-semibold text-foreground">
                          {formatOrderPrice(pricePerUnit)}{" "}
                          <span className="font-sans text-[11px] text-muted-foreground">{quoteTok.symbol}</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 font-mono text-xs tabular-nums font-medium text-foreground">
                          {formatTokenAmount(baseAmount, baseTok.decimals)}{" "}
                          <span className="font-sans text-[11px] text-muted-foreground">{baseTok.symbol}</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 font-mono text-xs tabular-nums font-medium text-muted-foreground">
                          {formatTokenAmount(quoteTotal, quoteTok.decimals)}{" "}
                          <span className="font-sans text-[11px] text-muted-foreground/70">{quoteTok.symbol}</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5">
                          <Badge variant="outline" className="text-amber-600 border-amber-500/40 text-[10px] px-1.5 py-0">
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 font-mono text-xs tabular-nums text-muted-foreground">
                          {timeAgoNs(order.createdAtNs)}
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 text-right">
                          <Button
                            size="xs"
                            variant="destructive"
                            className="h-5 px-1.5 text-[11px] font-semibold"
                            disabled={cancellingId === order.id}
                            onClick={() => void handleCancelOrder(order.id)}
                          >
                            {cancellingId === order.id ? (
                              <Spinner className="size-3" />
                            ) : (
                              <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                            )}
                            <span className="ml-1">{t("cancelOrder")}</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* 3. Limit Order History Tab */}
          <TabsContent value="orderHistory" className="m-0 h-full p-0">
            {allLoading && allOrders.length === 0 ? (
              <div className="flex h-36 items-center justify-center p-6">
                <Spinner className="size-6 text-muted-foreground/60" />
              </div>
            ) : allOrders.length === 0 ? (
              <Empty className="border-0 py-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} className="size-5" strokeWidth={2} />
                  </EmptyMedia>
                  <EmptyTitle className="text-sm">{t("tabOrderHistory")}</EmptyTitle>
                  <EmptyDescription className="text-xs">{t("noOrderHistory")}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="h-7.5 border-b border-border/40 hover:bg-transparent">
                    <TableHead className="h-7.5 w-[80px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("colSide")}</TableHead>
                    <TableHead className="h-7.5 w-[130px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("price")}</TableHead>
                    <TableHead className="h-7.5 w-[130px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("colAmount")}</TableHead>
                    <TableHead className="h-7.5 w-[130px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("total")}</TableHead>
                    <TableHead className="h-7.5 w-[85px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("colStatus")}</TableHead>
                    <TableHead className="h-7.5 px-2.5 text-right text-[11px] font-semibold text-muted-foreground">{t("colTime")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allOrders.map((order) => {
                    const inTok = findToken(order.tokenIn)
                    const outTok = findToken(order.tokenOut)

                    const isBuy = order.tokenIn === ICP_LEDGER_ID
                    const baseTok = isBuy ? outTok : inTok
                    const quoteTok = isBuy ? inTok : outTok
                    const baseAmount = isBuy ? order.minAmountOut : order.amountIn
                    const quoteTotal = isBuy ? order.amountIn : order.minAmountOut

                    const baseUnits = Number(baseAmount) / Math.pow(10, baseTok.decimals)
                    const quoteUnits = Number(quoteTotal) / Math.pow(10, quoteTok.decimals)
                    const pricePerUnit = baseUnits > 0 ? quoteUnits / baseUnits : 0

                    return (
                      <TableRow key={order.id.toString()} className="h-7.5 border-b border-border/20 hover:bg-muted/30">
                        <TableCell className="py-1.5 px-2.5">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "font-semibold text-[10px] px-1.5 py-0",
                              isBuy
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {isBuy ? t("buy") : t("sell")} {baseTok.symbol}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 font-mono text-xs tabular-nums font-semibold text-foreground">
                          {formatOrderPrice(pricePerUnit)}{" "}
                          <span className="font-sans text-[11px] text-muted-foreground">{quoteTok.symbol}</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 font-mono text-xs tabular-nums font-medium text-foreground">
                          {formatTokenAmount(baseAmount, baseTok.decimals)}{" "}
                          <span className="font-sans text-[11px] text-muted-foreground">{baseTok.symbol}</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 font-mono text-xs tabular-nums font-medium text-muted-foreground">
                          {formatTokenAmount(quoteTotal, quoteTok.decimals)}{" "}
                          <span className="font-sans text-[11px] text-muted-foreground/70">{quoteTok.symbol}</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5">
                          <Badge
                            variant={
                              order.status === "Filled"
                                ? "secondary"
                                : order.status === "Cancelled"
                                  ? "destructive"
                                  : "outline"
                            }
                            className={cn(
                              "text-[10px] px-1.5 py-0",
                              order.status === "Filled" && "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
                              order.status === "Open" && "text-amber-600 border-amber-500/40"
                            )}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                          {timeAgoNs(order.createdAtNs)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* 4. On-chain Audit Log Tab */}
          <TabsContent value="audit" className="m-0 h-full p-0">
            {tradesLoading && trades.length === 0 ? (
              <div className="flex h-36 items-center justify-center p-6">
                <Spinner className="size-6 text-muted-foreground/60" />
              </div>
            ) : trades.length === 0 ? (
              <Empty className="border-0 py-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} className="size-5" strokeWidth={2} />
                  </EmptyMedia>
                  <EmptyTitle className="text-sm">{t("tabTrades")}</EmptyTitle>
                  <EmptyDescription className="text-xs">{t("noTradeAudit")}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="h-7.5 border-b border-border/40 hover:bg-transparent">
                    <TableHead className="h-7.5 w-[140px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("colAmount")}</TableHead>
                    <TableHead className="h-7.5 w-[140px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("youReceive")}</TableHead>
                    <TableHead className="h-7.5 w-[100px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("fee")}</TableHead>
                    <TableHead className="h-7.5 w-[110px] px-2.5 text-[11px] font-semibold text-muted-foreground">{t("colHash")}</TableHead>
                    <TableHead className="h-7.5 px-2.5 text-right text-[11px] font-semibold text-muted-foreground">{t("colTime")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((tr, idx) => {
                    const inTok = findToken(tr.tokenIn)
                    const outTok = findToken(tr.tokenOut)

                    return (
                      <TableRow key={`${tr.txId}-${idx}`} className="h-7.5 border-b border-border/20 hover:bg-muted/30">
                        <TableCell className="py-1.5 px-2.5 font-mono text-xs tabular-nums font-medium text-rose-500">
                          -{formatTokenAmount(tr.amountIn, inTok.decimals)}{" "}
                          <span className="font-sans text-[11px] text-rose-500/80">{inTok.symbol}</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 font-mono text-xs tabular-nums font-medium text-emerald-500">
                          +{formatTokenAmount(tr.amountOut, outTok.decimals)}{" "}
                          <span className="font-sans text-[11px] text-emerald-500/80">{outTok.symbol}</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 font-mono text-xs tabular-nums text-muted-foreground">
                          {formatTokenAmount(tr.serviceFee, 8)}{" "}
                          <span className="font-sans text-[11px] text-muted-foreground/80">ICP</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5">
                          <span className="font-mono text-xs font-medium text-foreground/90" title={tr.txId}>
                            {truncateHash(tr.txId)}
                          </span>
                        </TableCell>
                        <TableCell className="py-1.5 px-2.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                          {timeAgoNs(tr.timestampNs)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}

function SwapHashCell({ id, blockIndex }: { id: string; blockIndex: bigint | null }) {
  const label = swapHashLabel(id, blockIndex)
  const href = swapHashHref(id, blockIndex)
  if (!label) {
    return <span className="font-mono text-xs text-muted-foreground/60">—</span>
  }
  const text = truncateHash(label)
  if (!href) {
    return (
      <span className="font-mono text-xs font-medium text-foreground/90" title={label}>
        {text}
      </span>
    )
  }
  const external = href.startsWith("http")
  return (
    <a
      href={href}
      title={label}
      className="font-mono text-xs font-medium text-primary hover:underline"
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {text}
    </a>
  )
}

function FillStatusCell({
  status,
  filling,
  filled,
  failed,
}: {
  status: FillStatus
  filling: string
  filled: string
  failed: string
}) {
  if (status === "filling") {
    return (
      <Badge variant="outline" className="gap-1 font-normal text-[11px]">
        <Spinner data-icon="inline-start" className="size-3" />
        {filling}
      </Badge>
    )
  }
  if (status === "failed") {
    return (
      <Badge variant="destructive" className="font-normal text-[11px]">
        {failed}
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="font-normal text-emerald-600 dark:text-emerald-400 text-[11px]">
      {filled}
    </Badge>
  )
}
