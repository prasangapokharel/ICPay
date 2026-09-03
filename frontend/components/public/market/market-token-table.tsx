"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartHistogramIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TokenAvatar } from "@/components/public/market/trade/token-avatar"
import { changeClass, formatPct, formatUsd, priceLayers } from "@/lib/market/format"
import { pairTvl, pairVolume, type MarketSortKey } from "@/lib/market/overview"
import { tradePairHref } from "@/lib/market/pairSlug"
import type { TerminalPairRow } from "@/services/market/tradePairSnapshot"

function listedOf(rows: TerminalPairRow[]) {
  return rows.map((row) => ({ symbol: row.base.symbol, ledgerId: row.baseLedgerId }))
}

export function MarketTokenTable({
  rows,
  listed,
  sortKey,
  sortAsc,
  onSort,
}: {
  rows: TerminalPairRow[]
  listed: TerminalPairRow[]
  sortKey: MarketSortKey
  sortAsc: boolean
  onSort: (key: MarketSortKey) => void
}) {
  const t = useTranslations("marketOverview")
  const siblings = listedOf(listed)
  return (
    <Table className="bg-background">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <SortHead
            label={t("colName")}
            active={sortKey === "name"}
            sortAsc={sortAsc}
            onClick={() => onSort("name")}
          />
          <SortHead
            label={t("colPrice")}
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
          <TableHead className="text-right text-muted-foreground">{t("colActions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const price = priceLayers(row.stats?.priceUsd)
          const href = tradePairHref(row.base.symbol, row.baseLedgerId, siblings)
          return (
            <TableRow key={row.baseLedgerId} className="border-border/50">
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
                    <span className="block truncate text-xs text-muted-foreground">{row.base.name}</span>
                  </span>
                </Link>
              </TableCell>
              <TableCell>
                <span className="block font-medium tabular-nums">{price.main}</span>
                {price.sub ? (
                  <span className="block text-xs text-muted-foreground tabular-nums">{price.sub}</span>
                ) : null}
              </TableCell>
              <TableCell className={`font-medium tabular-nums ${changeClass(row.stats?.priceChange24h)}`}>
                {formatPct(row.stats?.priceChange24h)}
              </TableCell>
              <TableCell className="tabular-nums">{formatUsd(pairVolume(row))}</TableCell>
              <TableCell className="tabular-nums">{formatUsd(pairTvl(row))}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon-sm" nativeButton={false} render={<Link href={href} />}>
                  <HugeiconsIcon icon={ChartHistogramIcon} className="size-4" strokeWidth={2} />
                  <span className="sr-only">{t("trade")}</span>
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
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
