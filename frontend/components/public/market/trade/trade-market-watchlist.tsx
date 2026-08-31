"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/ui/utils"
import { changeClass, formatPct, formatUsd } from "@/lib/market/format"
import type { TerminalPairSeed } from "@/lib/market/tradePairs"
import type { IcpswapTokenStats } from "@/services/market/icpswapStats"

type WatchRow = TerminalPairSeed & { stats: IcpswapTokenStats | null }

export function TradeMarketWatchlist({
  rows,
  activeBaseId,
  onSelect,
  loading,
}: {
  rows: WatchRow[]
  activeBaseId: string
  onSelect: (baseLedgerId: string) => void
  loading?: boolean
}) {
  const t = useTranslations("marketTrade")
  const [query, setQuery] = useState("")

  const filtered = rows.filter((row) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return row.symbol.toLowerCase().includes(q) || row.name.toLowerCase().includes(q)
  })

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-border/60 bg-card/40">
      <div className="border-b border-border/60 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("markets")}
        </p>
        <Input
          className="mt-2 h-9"
          placeholder={t("searchPairs")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-1">
        <ul className="p-1">
          {loading && rows.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="m-1 h-12 animate-pulse rounded-lg bg-muted/60" />
              ))
            : filtered.map((row) => (
                <li key={row.baseLedgerId}>
                  <button
                    type="button"
                    onClick={() => onSelect(row.baseLedgerId)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      row.baseLedgerId === activeBaseId
                        ? "bg-primary/10 text-foreground"
                        : "hover:bg-muted/60"
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold">{row.symbol}</span>
                      <span className="block truncate text-xs text-muted-foreground">/ ICP</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block tabular-nums">{formatUsd(row.stats?.priceUsd, 4)}</span>
                      <span className={cn("block text-xs tabular-nums", changeClass(row.stats?.priceChange24h))}>
                        {formatPct(row.stats?.priceChange24h)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
        </ul>
      </ScrollArea>
    </div>
  )
}

export function PairTokenIcon({ symbol }: { symbol: string }) {
  const letter = symbol.slice(0, 1).toUpperCase()
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
      {letter}
    </span>
  )
}
