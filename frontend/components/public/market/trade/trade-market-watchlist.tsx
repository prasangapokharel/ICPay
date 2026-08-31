"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { TokenAvatar } from "@/components/public/market/trade/token-avatar"
import { cn } from "@/lib/ui/utils"
import { changeClass, formatPct, formatUsd } from "@/lib/market/format"
import type { TerminalPairRow } from "@/services/market/tradePairSnapshot"

export function TradeMarketWatchlist({
  rows,
  activeBaseId,
  onSelect,
  loading,
}: {
  rows: TerminalPairRow[]
  activeBaseId: string
  onSelect: (baseLedgerId: string) => void
  loading?: boolean
}) {
  const t = useTranslations("marketTrade")
  const [query, setQuery] = useState("")

  const filtered = rows.filter((row) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      row.base.symbol.toLowerCase().includes(q) ||
      row.base.name.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-border/60 bg-card/30">
      <div className="border-b border-border/60 px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("markets")}
        </p>
        <Input
          className="mt-2 h-9 bg-background/60"
          placeholder={t("searchPairs")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-1">
        <ul className="p-1.5">
          {loading && rows.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="m-1 h-14 animate-pulse rounded-lg bg-muted/50" />
              ))
            : filtered.map((row) => (
                <li key={row.baseLedgerId}>
                  <button
                    type="button"
                    onClick={() => onSelect(row.baseLedgerId)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2 py-2.5 text-left text-sm transition-colors",
                      row.baseLedgerId === activeBaseId
                        ? "bg-primary/10 ring-1 ring-primary/20"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <TokenAvatar symbol={row.base.symbol} logoUrl={row.base.logoUrl} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="font-semibold">{row.base.symbol}</span>
                        {!row.hasPool && (
                          <Badge variant="outline" className="h-4 px-1 text-[9px]">
                            {t("noPool")}
                          </Badge>
                        )}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">/ ICP</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-xs tabular-nums">
                        {formatUsd(row.stats?.priceUsd, 4)}
                      </span>
                      <span
                        className={cn(
                          "block text-[11px] tabular-nums",
                          changeClass(row.stats?.priceChange24h)
                        )}
                      >
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
