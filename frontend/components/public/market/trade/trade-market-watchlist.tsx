"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, ArrowUp01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { TokenAvatar } from "./token-avatar"
import { cn } from "@/lib/ui/utils"
import { changeClass, formatPct, formatUsd } from "@/lib/market/format"
import { marketPageCount, sortDefaultsForChangeFilter } from "@/lib/market/overview"
import { takeWatchlistRows, WATCHLIST_PAGE_SIZE } from "@/lib/market/watchlistPage"
import { pinWatchlistRows } from "@/lib/market/customWatchlist"
import { MarketPager } from "@/components/public/market/market-pager"
import { Separator } from "@/components/ui/separator"
import { CustomTokenSearch } from "@/components/public/market/custom-token-search"
import type { TerminalPairRow } from "@/services/market/tradePairSnapshot"

type SortKey = "name" | "price" | "change" | "volume"
type ChangeFilter = "all" | "up" | "down"

export function TradeMarketWatchlist({
  rows,
  activeBaseId,
  activeLogoUrl,
  onSelect,
  onAddCustomToken,
  loading,
  pinnedIds,
}: {
  rows: TerminalPairRow[]
  activeBaseId: string
  activeLogoUrl?: string | null
  onSelect: (baseLedgerId: string) => void
  onAddCustomToken?: (row: TerminalPairRow) => void
  loading?: boolean
  pinnedIds?: Iterable<string>
}) {
  const t = useTranslations("marketTrade")
  const [query, setQuery] = useState("")
  const [changeFilter, setChangeFilter] = useState<ChangeFilter>("all")
  const [sortKey, setSortKey] = useState<SortKey>("volume")
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(1)
  const filterKey = `${query}|${changeFilter}|${sortKey}|${sortAsc}`
  const [pageKey, setPageKey] = useState(filterKey)

  const resetPageIfNeeded = pageKey !== filterKey
  if (resetPageIfNeeded) {
    setPageKey(filterKey)
    setPage(1)
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v)
    else {
      setSortKey(key)
      setSortAsc(key === "name")
    }
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const lowercased = q ? rows.map(row => ({
      row,
      symbol: row.base.symbol.toLowerCase(),
      name: row.base.name.toLowerCase()
    })) : null
    const next = rows.filter((row, idx) => {
      if (q) {
        const lc = lowercased![idx]
        if (!lc.symbol.includes(q) && !lc.name.includes(q)) return false
      }
      const ch = row.stats?.priceChange24h ?? 0
      if (changeFilter === "up") return ch > 0
      if (changeFilter === "down") return ch < 0
      return true
    })
    const dir = sortAsc ? 1 : -1
    next.sort((a, b) => {
      if (sortKey === "name") return dir * a.base.symbol.localeCompare(b.base.symbol)
      if (sortKey === "price") return dir * ((a.stats?.priceUsd ?? 0) - (b.stats?.priceUsd ?? 0))
      if (sortKey === "change") {
        return dir * ((a.stats?.priceChange24h ?? 0) - (b.stats?.priceChange24h ?? 0))
      }
      return dir * (pairVolume(a) - pairVolume(b))
    })
    return pinWatchlistRows(next, pinnedIds ?? [])
  }, [rows, query, changeFilter, sortKey, sortAsc, pinnedIds])

  const pageCount = marketPageCount(visible.length, WATCHLIST_PAGE_SIZE)
  const safePage = Math.min(page, pageCount)
  const shown = takeWatchlistRows(visible, safePage)

  return (
    <Card size="sm" className="m-1 h-full min-h-0 gap-0 py-0">
      <CardHeader className="border-b py-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("markets")}
          </p>
          {onAddCustomToken && <CustomTokenSearch onTokenFound={onAddCustomToken} />}
        </div>
        <InputGroup className="mt-1.5">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} className="size-4" strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder={t("searchPairs")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
        <div className="mt-2 flex gap-1">
          {(["all", "up", "down"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setChangeFilter(key)
                const defaults = sortDefaultsForChangeFilter(key)
                if (defaults) {
                  setSortKey(defaults.sortKey as SortKey)
                  setSortAsc(defaults.sortAsc)
                }
              }}
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-medium",
                changeFilter === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {key === "all" ? t("filterAll") : key === "up" ? t("filterGainers") : t("filterLosers")}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto px-1.5 py-1">
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-1.5 pb-1 text-[9px] uppercase tracking-wide text-muted-foreground">
          <SortHead
            label={t("colName")}
            active={sortKey === "name"}
            asc={sortAsc}
            onClick={() => toggleSort("name")}
          />
          <SortHead
            label={t("price")}
            active={sortKey === "price"}
            asc={sortAsc}
            onClick={() => toggleSort("price")}
            right
          />
          <SortHead
            label={t("change24h")}
            active={sortKey === "change"}
            asc={sortAsc}
            onClick={() => toggleSort("change")}
            right
          />
        </div>
        <ul>
            {loading && rows.length === 0
              ? Array.from({ length: 8 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-2 px-1.5 py-1.5">
                    <Skeleton className="size-6 rounded-full" />
                    <Skeleton className="h-7 flex-1" />
                  </li>
                ))
              : shown.map((row) => (
                  <li key={row.baseLedgerId}>
                    <button
                      type="button"
                      onClick={() => onSelect(row.baseLedgerId)}
                      className={cn(
                        "grid w-full grid-cols-[1fr_auto_auto] items-center gap-x-3 rounded-lg px-1.5 py-1.5 text-left text-xs transition-colors",
                        row.baseLedgerId === activeBaseId
                          ? "bg-primary/10"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <TokenAvatar
                          symbol={row.base.symbol}
                          ledgerId={row.baseLedgerId}
                          logoUrl={
                            row.baseLedgerId === activeBaseId
                              ? (activeLogoUrl ?? row.base.logoUrl)
                              : row.base.logoUrl
                          }
                          className="size-6"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold leading-none">{row.base.symbol}</span>
                            <span className="text-[10px] text-muted-foreground">/ ICP</span>
                            {!row.hasPool && (
                              <Badge variant="outline" className="h-3.5 px-1 text-[8px]">
                                {t("noPool")}
                              </Badge>
                            )}
                          </span>
                        </span>
                      </div>
                      <span className="text-right text-[11px] tabular-nums leading-none">
                        {formatUsd(row.stats?.priceUsd, 6, { compact: false })}
                      </span>
                      <span
                        className={cn(
                          "text-right text-[10px] tabular-nums",
                          changeClass(row.stats?.priceChange24h)
                        )}
                      >
                        {formatPct(row.stats?.priceChange24h)}
                      </span>
                    </button>
                  </li>
                ))}
          </ul>
        {pageCount > 1 && (
          <>
            <Separator className="my-2" />
            <MarketPager compact page={safePage} pages={pageCount} onPage={setPage} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

function SortHead({
  label,
  active,
  asc,
  onClick,
  right,
}: {
  label: string
  active: boolean
  asc: boolean
  onClick: () => void
  right?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-0.5 hover:text-foreground",
        right && "justify-end",
        active && "text-foreground"
      )}
    >
      {label}
      <HugeiconsIcon
        icon={active && asc ? ArrowUp01Icon : ArrowDown01Icon}
        className="size-2.5 opacity-60"
        strokeWidth={2}
      />
    </button>
  )
}

function pairVolume(row: TerminalPairRow): number {
  const v24 = row.stats?.volume24hUsd ?? 0
  return v24 > 0 ? v24 : (row.stats?.volume7dUsd ?? 0)
}
