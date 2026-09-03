"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDataTransferHorizontalIcon } from "@hugeicons/core-free-icons"
import { useTransactions } from "@/hooks/wallet/useWalletData"
import { useTradeFills } from "@/hooks/market/useTradeFills"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { swapHashHref, swapHashLabel, truncateHash } from "@/lib/market/swapHash"
import { mergeRecentSwaps } from "@/lib/market/recentSwaps"
import { cn } from "@/lib/ui/utils"
import type { FillStatus } from "@/lib/market/tradeFillStore"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

function timeAgoMs(ms: number): string {
  const diffS = Math.floor((Date.now() - ms) / 1000)
  if (diffS < 60) return `${diffS}s`
  if (diffS < 3600) return `${Math.floor(diffS / 60)}m`
  if (diffS < 86400) return `${Math.floor(diffS / 3600)}h`
  return `${Math.floor(diffS / 86400)}d`
}

export function TradeSwapHistory({
  snapshot,
}: {
  snapshot: TradePairSnapshot
}) {
  const t = useTranslations("marketTrade")
  const { items, isLoading } = useTransactions(0, 80)
  const localFills = useTradeFills()

  const swaps = useMemo(
    () =>
      mergeRecentSwaps(localFills, items, snapshot).map((row) => ({
        ...row,
        ago: timeAgoMs(row.at),
      })),
    [items, localFills, snapshot]
  )

  return (
    <Card size="sm" className="m-1 mb-1 flex min-h-0 flex-1 flex-col overflow-hidden py-0">
      <CardHeader className="shrink-0 border-b px-4 py-3">
        <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("recentSwaps")}
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-0 pb-1">
        {isLoading && swaps.length === 0 ? (
          <div className="space-y-2 px-4 py-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-7 w-full rounded-md" />
            ))}
          </div>
        ) : swaps.length === 0 ? (
          <Empty className="border-0 py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} className="size-5" strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle className="text-sm">{t("recentSwaps")}</EmptyTitle>
              <EmptyDescription className="text-xs">{t("noRecentSwaps")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-10 w-16 px-4 text-[10px]">{t("colSide")}</TableHead>
                <TableHead className="h-10 w-36 px-4 text-[10px]">{t("colAmount")}</TableHead>
                <TableHead className="h-10 w-24 px-3 text-[10px]">{t("colHash")}</TableHead>
                <TableHead className="h-10 w-20 px-4 text-[10px]">{t("colStatus")}</TableHead>
                <TableHead className="h-10 w-16 px-4 text-right text-[10px]">{t("colTime")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {swaps.map((row) => (
                <TableRow key={row.id}>
                  <TableCell
                    className={cn(
                      "px-4 py-3.5 text-xs font-medium",
                      row.isBuy ? "text-emerald-500" : "text-rose-500"
                    )}
                  >
                    {row.isBuy ? t("swapBuy") : t("swapSell")}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-xs tabular-nums">
                    {formatTokenAmount(row.amount, row.decimals)} {row.symbol}
                  </TableCell>
                  <TableCell className="px-3 py-3.5">
                    <SwapHashCell id={row.id} blockIndex={row.blockIndex} />
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-[10px]">
                    <FillStatusCell status={row.status} filling={t("fillFilling")} filled={t("fillFilled")} failed={t("fillFailed")} />
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-right text-[10px] text-muted-foreground">
                    {row.ago}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function SwapHashCell({ id, blockIndex }: { id: string; blockIndex: bigint | null }) {
  const label = swapHashLabel(id, blockIndex)
  const href = swapHashHref(id, blockIndex)
  if (!label) {
    return <span className="text-[10px] text-muted-foreground">—</span>
  }
  const text = truncateHash(label)
  if (!href) {
    return (
      <span className="font-mono text-[10px] text-foreground" title={label}>
        {text}
      </span>
    )
  }
  const external = href.startsWith("http")
  return (
    <a
      href={href}
      title={label}
      className="font-mono text-[10px] text-primary hover:underline"
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
      <Badge variant="outline" className="h-5 gap-1 font-normal">
        <Spinner data-icon="inline-start" className="size-3" />
        {filling}
      </Badge>
    )
  }
  if (status === "failed") {
    return (
      <Badge variant="destructive" className="h-5 font-normal">
        {failed}
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="h-5 font-normal text-emerald-600 dark:text-emerald-400">
      {filled}
    </Badge>
  )
}
