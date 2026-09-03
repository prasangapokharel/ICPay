"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useTerminalWatchlist } from "@/hooks/market/useTradeTerminal"
import { useMarketStats } from "@/hooks/market/useMarketStats"
import { cn } from "@/lib/ui/utils"
import {
  filterMarketRows,
  marketHighlights,
  marketPageCount,
  pageMarketRows,
  sortDefaultsForChangeFilter,
  sortMarketRows,
  type MarketChangeFilter,
  type MarketSortKey,
} from "@/lib/market/overview"
import { enrichFeedRows } from "@/lib/market/feedHighlights"
import { useMarketFeed } from "@/hooks/market/useMarketFeed"
import { MarketHighlightCards } from "./market-highlight-cards"
import { MarketStatsCards } from "./market-stats-cards"
import { MarketPager } from "./market-pager"
import { MarketTokenTable } from "./market-token-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function MarketOverview() {
  const t = useTranslations("marketOverview")
  const { rows, isLoading } = useTerminalWatchlist()
  const { stats, isLoading: statsLoading } = useMarketStats()
  const { feed, isLoading: feedLoading } = useMarketFeed()
  const [query, setQuery] = useState("")
  const [change, setChange] = useState<MarketChangeFilter>("all")
  const [sortKey, setSortKey] = useState<MarketSortKey>("volume")
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(1)

  const highlights = useMemo(() => marketHighlights(rows), [rows])
  const trending = useMemo(() => enrichFeedRows(feed.trending, rows), [feed.trending, rows])
  const newListings = useMemo(() => enrichFeedRows(feed.newListings, rows), [feed.newListings, rows])
  const gainers = useMemo(
    () =>
      feed.gainers.length > 0
        ? enrichFeedRows(feed.gainers, rows)
        : enrichFeedRows(
            highlights.gainers.map((row) => ({
              ledgerId: row.baseLedgerId,
              symbol: row.base.symbol,
              name: row.base.name,
              logoUrl: row.base.logoUrl,
              priceUsd: row.stats?.priceUsd ?? null,
              change24h: row.stats?.priceChange24h ?? null,
            })),
            rows
          ),
    [feed.gainers, highlights.gainers, rows]
  )
  const filtered = useMemo(() => {
    const next = sortMarketRows(filterMarketRows(rows, query, change), sortKey, sortAsc)
    return next
  }, [rows, query, change, sortKey, sortAsc])

  const pages = marketPageCount(filtered.length)
  const safePage = Math.min(page, pages)
  const pageRows = pageMarketRows(filtered, safePage)

  function onSort(key: MarketSortKey) {
    if (sortKey === key) setSortAsc((v) => !v)
    else {
      setSortKey(key)
      setSortAsc(key === "name")
    }
    setPage(1)
  }

  return (
    <div className="mx-auto w-full max-w-7xl bg-background px-4 py-8 md:px-6 md:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("title")}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      <Tabs defaultValue="overview" className="mb-10 gap-4">
        <TabsList variant="line" className="w-full justify-start border-b">
          <TabsTrigger value="overview" className="px-1 pb-2.5 text-base data-active:text-foreground">
            {t("tabOverview")}
          </TabsTrigger>
          <TabsTrigger value="trading" className="px-1 pb-2.5 text-base data-active:text-foreground">
            {t("tabTradingData")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          {(isLoading && rows.length === 0) || (feedLoading && feed.trending.length === 0) ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
          ) : (
            <MarketHighlightCards
              listed={rows}
              trending={
                trending.length > 0
                  ? trending
                  : highlights.hot.map((row) => ({
                      ledgerId: row.baseLedgerId,
                      symbol: row.base.symbol,
                      name: row.base.name,
                      logoUrl: row.base.logoUrl,
                      priceUsd: row.stats?.priceUsd ?? null,
                      change24h: row.stats?.priceChange24h ?? null,
                    }))
              }
              newListings={newListings}
              gainers={gainers}
              volume={highlights.volume}
            />
          )}
        </TabsContent>

        <TabsContent value="trading" className="mt-4">
          <MarketStatsCards stats={stats} loading={statsLoading} />
        </TabsContent>
      </Tabs>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t("tableTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("tableHint")}</p>
          </div>
          <InputGroup className="sm:max-w-xs">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} className="size-4" strokeWidth={2} />
            </InputGroupAddon>
            <InputGroupInput
              placeholder={t("search")}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
            />
          </InputGroup>
        </div>

        <div className="mb-3 flex gap-1">
          {(["all", "up", "down"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setChange(key)
                setPage(1)
                const defaults = sortDefaultsForChangeFilter(key)
                if (defaults) {
                  setSortKey(defaults.sortKey)
                  setSortAsc(defaults.sortAsc)
                }
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                change === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {key === "all" ? t("filterAll") : key === "up" ? t("filterGainers") : t("filterLosers")}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
          <MarketTokenTable
            rows={pageRows}
            listed={rows}
            sortKey={sortKey}
            sortAsc={sortAsc}
            onSort={onSort}
          />
        </div>

        <div className="mt-4">
          <MarketPager
            page={safePage}
            pages={pages}
            onPage={setPage}
            prevLabel={t("prev")}
            nextLabel={t("next")}
          />
        </div>
      </section>
    </div>
  )
}
