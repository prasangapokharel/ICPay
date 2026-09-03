"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { TokenAvatar } from "@/components/public/market/trade/token-avatar"
import { MarketPager } from "@/components/public/market/market-pager"
import { useTerminalWatchlist } from "@/hooks/market/useTradeTerminal"
import { changeClass, formatPct, formatUsd, priceLayers } from "@/lib/market/format"
import {
  filterMarketRows,
  marketPageCount,
  pageMarketRows,
  pairTvl,
  pairVolume,
  sortMarketRows,
  type MarketChangeFilter,
  type MarketSortKey,
} from "@/lib/market/overview"
import { tradePairHref } from "@/lib/market/pairSlug"

type RankingType = "gainer" | "loser" | "volume"

const CONFIG: Record<
  RankingType,
  {
    title: string
    subtitle: string
    defaultSort: MarketSortKey
    defaultAsc: boolean
    filter: MarketChangeFilter
  }
> = {
  gainer: {
    title: "Top Gainers",
    subtitle: "Tokens with the highest 24h price gain",
    defaultSort: "change",
    defaultAsc: false,
    filter: "up",
  },
  loser: {
    title: "Top Losers",
    subtitle: "Tokens with the largest 24h price drop",
    defaultSort: "change",
    defaultAsc: true,
    filter: "down",
  },
  volume: {
    title: "Top Volume",
    subtitle: "Tokens with the highest 24h trading volume",
    defaultSort: "volume",
    defaultAsc: false,
    filter: "all",
  },
}

export function MarketRankingDetail({ type }: { type: RankingType }) {
  const t = useTranslations("marketOverview")
  const { rows, isLoading } = useTerminalWatchlist()
  const cfg = CONFIG[type]
  const [sortKey, setSortKey] = useState<MarketSortKey>(cfg.defaultSort)
  const [sortAsc, setSortAsc] = useState(cfg.defaultAsc)
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    const filtered = filterMarketRows(rows, "", cfg.filter)
    return sortMarketRows(filtered, sortKey, sortAsc)
  }, [rows, sortKey, sortAsc, cfg.filter])

  const pages = marketPageCount(sorted.length)
  const safePage = Math.min(page, pages)
  const pageRows = pageMarketRows(sorted, safePage)

  const listed = useMemo(
    () => rows.map((r) => ({ symbol: r.base.symbol, ledgerId: r.baseLedgerId })),
    [rows]
  )

  function onSort(key: MarketSortKey) {
    if (sortKey === key) setSortAsc((v) => !v)
    else {
      setSortKey(key)
      setSortAsc(key === "name")
    }
    setPage(1)
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 bg-background px-4 py-8 md:px-6 md:py-10">
      <div className="flex items-center gap-3">
        <Link
          href="/market/ranking"
          className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Back to rankings"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{cfg.title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{cfg.subtitle}</p>
        </div>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <CardContent className="p-0">
          {isLoading && rows.length === 0 ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader className="[&_tr]:border-0">
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="w-12 text-center text-muted-foreground">#</TableHead>
                  <SortHead
                    label="Name"
                    active={sortKey === "name"}
                    sortAsc={sortAsc}
                    onClick={() => onSort("name")}
                  />
                  <SortHead
                    label="Price"
                    active={sortKey === "price"}
                    sortAsc={sortAsc}
                    onClick={() => onSort("price")}
                  />
                  <SortHead
                    label={t("colChange")}
                    active={sortKey === "change"}
                    sortAsc={sortAsc}
                    onClick={() => onSort("change")}
                  />
                  <SortHead
                    label={t("colVolume")}
                    active={sortKey === "volume"}
                    sortAsc={sortAsc}
                    onClick={() => onSort("volume")}
                  />
                  <SortHead
                    label={t("colTvl")}
                    active={sortKey === "tvl"}
                    sortAsc={sortAsc}
                    onClick={() => onSort("tvl")}
                  />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((row, idx) => {
                  const price = priceLayers(row.stats?.priceUsd)
                  const href = tradePairHref(row.base.symbol, row.baseLedgerId, listed)
                  const globalIdx = (safePage - 1) * 20 + idx + 1
                  return (
                    <TableRow key={row.baseLedgerId} className="border-0">
                      <TableCell className="text-center text-muted-foreground">
                        {globalIdx}
                      </TableCell>
                      <TableCell>
                        <Link href={href} className="flex items-center gap-3">
                          <TokenAvatar
                            symbol={row.base.symbol}
                            ledgerId={row.baseLedgerId}
                            logoUrl={row.base.logoUrl}
                            className="size-8"
                          />
                          <span className="min-w-0">
                            <span className="block font-semibold">{row.base.symbol}</span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {row.base.name}
                            </span>
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="block font-medium tabular-nums">{price.main}</span>
                        {price.sub ? (
                          <span className="block text-xs tabular-nums text-muted-foreground">
                            {price.sub}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell
                        className={`font-medium tabular-nums ${changeClass(row.stats?.priceChange24h)}`}
                      >
                        {formatPct(row.stats?.priceChange24h)}
                      </TableCell>
                      <TableCell className="tabular-nums">{formatUsd(pairVolume(row))}</TableCell>
                      <TableCell className="tabular-nums">{formatUsd(pairTvl(row))}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MarketPager
        page={safePage}
        pages={pages}
        onPage={setPage}
        prevLabel={t("prev")}
        nextLabel={t("next")}
      />
    </div>
  )
}

function SortHead({
  label,
  active,
  sortAsc,
  onClick,
}: {
  label: string
  active: boolean
  sortAsc: boolean
  onClick: () => void
}) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={onClick}
        className={active ? "font-semibold text-foreground" : "text-muted-foreground"}
      >
        {label}
        {active ? (sortAsc ? " ↑" : " ↓") : ""}
      </button>
    </TableHead>
  )
}
