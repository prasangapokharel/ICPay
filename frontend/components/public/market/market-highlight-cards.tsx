"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { TokenAvatar } from "@/components/public/market/trade/token-avatar"
import { changeClass, formatPct, formatUsd } from "@/lib/market/format"
import { marketRankImage } from "@/lib/market/rankBadge"
import type { MarketFeedRow } from "@/lib/market/feedHighlights"
import { tradePairHref } from "@/lib/market/pairSlug"
import type { TerminalPairRow } from "@/services/market/tradePairSnapshot"

export function MarketHighlightCards({
  listed,
  trending,
  newListings,
  gainers,
  volume,
}: {
  listed: TerminalPairRow[]
  trending: MarketFeedRow[]
  newListings: MarketFeedRow[]
  gainers: MarketFeedRow[]
  volume: TerminalPairRow[]
}) {
  const t = useTranslations("marketOverview")
  const siblings = listed.map((row) => ({ symbol: row.base.symbol, ledgerId: row.baseLedgerId }))
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <FeedCard title={t("trending")} rows={trending} siblings={siblings} moreHref="/market/ranking/volume" />
      <FeedCard title={t("newListing")} rows={newListings} siblings={siblings} moreHref="/market/trade" />
      <FeedCard title={t("topGainer")} rows={gainers} siblings={siblings} moreHref="/market/ranking/gainer" />
      <PairCard title={t("topVolume")} rows={volume} siblings={siblings} moreHref="/market/ranking/volume" />
    </div>
  )
}

function FeedCard({
  title,
  rows,
  siblings,
  moreHref,
}: {
  title: string
  rows: MarketFeedRow[]
  siblings: { symbol: string; ledgerId: string }[]
  moreHref: string
}) {
  const t = useTranslations("marketOverview")
  return (
    <Card size="sm" className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link href={moreHref} className="text-xs text-muted-foreground hover:text-foreground">
          {t("more")}
        </Link>
      </div>
      <ul className="space-y-3">
        {rows.map((row, index) => (
          <li key={row.ledgerId}>
            <Link
              href={tradePairHref(row.symbol, row.ledgerId, siblings)}
              className="flex items-center gap-2"
            >
              <RankBadge rank={index + 1} />
              <TokenAvatar
                symbol={row.symbol}
                ledgerId={row.ledgerId}
                logoUrl={row.logoUrl}
                className="size-7"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{row.symbol}</span>
              <span className="text-sm tabular-nums">
                {row.priceUsd != null ? formatUsd(row.priceUsd) : (row.meta ?? "—")}
              </span>
              <span
                className={`w-16 text-right text-xs tabular-nums ${
                  row.change24h != null ? changeClass(row.change24h) : "text-muted-foreground"
                }`}
              >
                {row.change24h != null ? formatPct(row.change24h) : "—"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function PairCard({
  title,
  rows,
  siblings,
  moreHref,
}: {
  title: string
  rows: TerminalPairRow[]
  siblings: { symbol: string; ledgerId: string }[]
  moreHref: string
}) {
  const t = useTranslations("marketOverview")
  return (
    <Card size="sm" className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link href={moreHref} className="text-xs text-muted-foreground hover:text-foreground">
          {t("more")}
        </Link>
      </div>
      <ul className="space-y-3">
        {rows.map((row, index) => (
          <li key={row.baseLedgerId}>
            <Link
              href={tradePairHref(row.base.symbol, row.baseLedgerId, siblings)}
              className="flex items-center gap-2"
            >
              <RankBadge rank={index + 1} />
              <TokenAvatar
                symbol={row.base.symbol}
                ledgerId={row.baseLedgerId}
                logoUrl={row.base.logoUrl}
                className="size-7"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{row.base.symbol}</span>
              <span className="text-sm tabular-nums">{formatUsd(row.stats?.priceUsd)}</span>
              <span
                className={`w-16 text-right text-xs tabular-nums ${changeClass(row.stats?.priceChange24h)}`}
              >
                {formatPct(row.stats?.priceChange24h)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const src = marketRankImage(rank)
  if (!src) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="size-8 shrink-0 object-contain"
      width={32}
      height={32}
      aria-hidden
    />
  )
}
