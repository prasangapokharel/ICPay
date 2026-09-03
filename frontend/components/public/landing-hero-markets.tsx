"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TokenAvatar } from "@/components/public/market/trade/token-avatar"
import { useTerminalWatchlist } from "@/hooks/market/useTradeTerminal"
import { changeClass, formatPct, priceLayers } from "@/lib/market/format"
import { heroMarketLists } from "@/lib/market/overview"
import { tradePairHref } from "@/lib/market/pairSlug"
import type { TerminalPairRow } from "@/services/market/tradePairSnapshot"

const LIMIT = 5

export function LandingHeroMarkets() {
  const t = useTranslations("marketOverview")
  const { rows, isLoading } = useTerminalWatchlist()
  const lists = useMemo(() => heroMarketLists(rows, LIMIT), [rows])
  const listed = useMemo(
    () => rows.map((r) => ({ symbol: r.base.symbol, ledgerId: r.baseLedgerId })),
    [rows]
  )

  return (
    <Card size="sm" className="w-full gap-0 py-0">
      <Tabs defaultValue="popular">
        <CardHeader className="px-4 py-3">
          <TabsList variant="line" className="h-8 justify-start">
            <TabsTrigger value="popular">{t("popular")}</TabsTrigger>
            <TabsTrigger value="gainer">{t("gainer")}</TabsTrigger>
            <TabsTrigger value="loser">{t("loser")}</TabsTrigger>
          </TabsList>
          <CardAction>
            <Link
              href="/market"
              className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {t("more")}
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" strokeWidth={2} />
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="px-2 pb-3">
          {isLoading && rows.length === 0 ? (
            <div className="space-y-2 px-2 py-1">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="popular">
                <HeroTokenList rows={lists.popular} listed={listed} />
              </TabsContent>
              <TabsContent value="gainer">
                <HeroTokenList rows={lists.gainers} listed={listed} />
              </TabsContent>
              <TabsContent value="loser">
                <HeroTokenList rows={lists.losers} listed={listed} />
              </TabsContent>
            </>
          )}
        </CardContent>
      </Tabs>
    </Card>
  )
}

function HeroTokenList({
  rows,
  listed,
}: {
  rows: TerminalPairRow[]
  listed: { symbol: string; ledgerId: string }[]
}) {
  if (rows.length === 0) return null

  return (
    <ul>
      {rows.map((row) => {
        const price = priceLayers(row.stats?.priceUsd)
        const href = tradePairHref(row.base.symbol, row.baseLedgerId, listed)
        return (
          <li key={row.baseLedgerId}>
            <Link
              href={href}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/50"
            >
              <TokenAvatar
                symbol={row.base.symbol}
                ledgerId={row.baseLedgerId}
                logoUrl={row.base.logoUrl}
                className="size-8"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{row.base.symbol}</span>
                <span className="block truncate text-xs text-muted-foreground">{row.base.name}</span>
              </span>
              <span className="text-sm tabular-nums" title={price.sub ?? price.main}>
                {price.main}
              </span>
              <span
                className={`w-16 text-right text-sm font-medium tabular-nums ${changeClass(row.stats?.priceChange24h)}`}
              >
                {formatPct(row.stats?.priceChange24h)}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
