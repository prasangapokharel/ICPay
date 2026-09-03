"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { TokenAvatar } from "@/components/public/market/trade/token-avatar"
import { changeClass, formatPct, formatUsd } from "@/lib/market/format"
import { pickMarqueePairs } from "@/lib/market/marqueePairs"
import { cn } from "@/lib/ui/utils"
import type { TerminalPairRow } from "@/services/market/tradePairSnapshot"

export function TradePairMarquee({
  rows,
  quoteSymbol,
  loading,
  onSelect,
}: {
  rows: TerminalPairRow[]
  quoteSymbol: string
  loading?: boolean
  onSelect: (baseLedgerId: string) => void
}) {
  const items = useMemo(() => pickMarqueePairs(rows), [rows])
  if (loading && items.length === 0) {
    return (
      <Card size="sm" className="m-1 py-0">
        <Skeleton className="h-9 w-full rounded-none" />
      </Card>
    )
  }
  if (items.length === 0) return null

  const loop = items.length >= 6

  return (
    <Card size="sm" className="group m-1 overflow-hidden py-0">
      <div className="overflow-hidden">
        <div
          className={cn(
            "flex w-max items-stretch",
            loop && "motion-safe:animate-market-marquee motion-safe:group-hover:[animation-play-state:paused]"
          )}
        >
          {(loop ? [0, 1] : [0]).flatMap((copy) =>
            items.map((row) => (
              <MarqueeItem
                key={`${copy}-${row.baseLedgerId}`}
                row={row}
                quoteSymbol={quoteSymbol}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      </div>
    </Card>
  )
}

function MarqueeItem({
  row,
  quoteSymbol,
  onSelect,
}: {
  row: TerminalPairRow
  quoteSymbol: string
  onSelect: (baseLedgerId: string) => void
}) {
  const change = row.stats?.priceChange24h
  return (
    <div className="flex shrink-0 items-center">
      <button
        type="button"
        onClick={() => onSelect(row.baseLedgerId)}
        className="flex items-center gap-2 px-4 py-2 text-left hover:bg-muted/40"
      >
        <TokenAvatar
          symbol={row.base.symbol}
          ledgerId={row.baseLedgerId}
          logoUrl={row.base.logoUrl}
          className="size-6"
        />
        <span className="text-sm font-semibold tabular-nums">
          {row.base.symbol}/{quoteSymbol}
        </span>
        <span className={cn("text-sm tabular-nums", changeClass(change))}>
          {formatUsd(row.stats?.priceUsd, 4)}
        </span>
        <span className={cn("text-xs tabular-nums", changeClass(change))}>
          {formatPct(change)}
        </span>
      </button>
      <Separator orientation="vertical" className="h-6" />
    </div>
  )
}
