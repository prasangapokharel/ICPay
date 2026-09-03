"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useTerminalWatchlist } from "@/hooks/market/useTradeTerminal"
import { changeClass, formatPct, priceLayers } from "@/lib/market/format"
import { pairVolume } from "@/lib/market/overview"
import { tradePairHref } from "@/lib/market/pairSlug"
import type { TerminalPairRow } from "@/services/market/tradePairSnapshot"

const LIMIT = 10

export function MarketRankings() {
  const { rows, isLoading } = useTerminalWatchlist()

  const hotCoins = useMemo(
    () => [...rows].sort((a, b) => pairVolume(b) - pairVolume(a)).slice(0, LIMIT),
    [rows]
  )
  const topGainers = useMemo(
    () =>
      [...rows]
        .filter((r) => (r.stats?.priceChange24h ?? 0) > 0)
        .sort((a, b) => (b.stats?.priceChange24h ?? 0) - (a.stats?.priceChange24h ?? 0))
        .slice(0, LIMIT),
    [rows]
  )
  const topLosers = useMemo(
    () =>
      [...rows]
        .filter((r) => (r.stats?.priceChange24h ?? 0) < 0)
        .sort((a, b) => (a.stats?.priceChange24h ?? 0) - (b.stats?.priceChange24h ?? 0))
        .slice(0, LIMIT),
    [rows]
  )
  const topVolume = useMemo(
    () =>
      [...rows]
        .filter((r) => pairVolume(r) > 0)
        .sort((a, b) => pairVolume(b) - pairVolume(a))
        .slice(0, LIMIT),
    [rows]
  )
  const listed = useMemo(
    () => rows.map((r) => ({ symbol: r.base.symbol, ledgerId: r.baseLedgerId })),
    [rows]
  )

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 bg-background px-4 py-8 md:px-6 md:py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Market Rankings</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Explore hot coins, top gainers, losers, and highest volume tokens
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        <RankingCard
          title="Hot Coins"
          href="/market/ranking/volume"
          rows={hotCoins}
          listed={listed}
          loading={isLoading && rows.length === 0}
        />
        <RankingCard
          title="Top Gainers"
          href="/market/ranking/gainer"
          rows={topGainers}
          listed={listed}
          loading={isLoading && rows.length === 0}
        />
        <RankingCard
          title="Top Losers"
          href="/market/ranking/looser"
          rows={topLosers}
          listed={listed}
          loading={isLoading && rows.length === 0}
        />
        <RankingCard
          title="Top Volume"
          href="/market/ranking/volume"
          rows={topVolume}
          listed={listed}
          loading={isLoading && rows.length === 0}
        />
      </div>
    </div>
  )
}

function RankingCard({
  title,
  href,
  rows,
  listed,
  loading,
}: {
  title: string
  href: string
  rows: TerminalPairRow[]
  listed: { symbol: string; ledgerId: string }[]
  loading?: boolean
}) {
  const t = useTranslations("marketOverview")

  return (
    <Card size="sm" className="gap-0 py-0">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardAction>
          <Link
            href={href}
            className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
          >
            {t("more")}
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" strokeWidth={2} />
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="px-0 pb-2">
        {loading ? (
          <div className="space-y-2 px-4 py-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader className="[&_tr]:border-0">
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="w-10 text-center text-muted-foreground">#</TableHead>
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-right text-muted-foreground">Price</TableHead>
                <TableHead className="text-right text-muted-foreground">24h Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => {
                const price = priceLayers(row.stats?.priceUsd)
                const pairHref = tradePairHref(row.base.symbol, row.baseLedgerId, listed)
                return (
                  <TableRow key={row.baseLedgerId} className="border-0">
                    <TableCell className="text-center text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <Link href={pairHref} className="flex items-center gap-2.5">
                        <TokenAvatar
                          symbol={row.base.symbol}
                          ledgerId={row.baseLedgerId}
                          logoUrl={row.base.logoUrl}
                          className="size-7"
                        />
                        <span className="font-medium">{row.base.symbol}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums" title={price.sub ?? price.main}>
                      {price.main}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium tabular-nums ${changeClass(row.stats?.priceChange24h)}`}
                    >
                      {formatPct(row.stats?.priceChange24h)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
