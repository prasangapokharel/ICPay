"use client"

import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { formatUsd, formatPct } from "@/lib/market/format"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/ui/utils"
import type { MarketStats } from "@/services/market/marketStats"

export function MarketStatsCards({ stats, loading }: { stats: MarketStats | null; loading?: boolean }) {
  const t = useTranslations("marketOverview")

  if (loading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    )
  }

  const cards = [
    {
      label: t("totalVolume24h"),
      value: formatUsd(stats.totalVolume24h, 2),
      change: null,
      description: t("totalVolume24hDesc"),
    },
    {
      label: t("totalTvl"),
      value: formatUsd(stats.totalTvl, 2),
      change: null,
      description: t("totalTvlDesc"),
    },
    {
      label: t("avgChange24h"),
      value: formatPct(stats.avgPriceChange24h),
      change: stats.avgPriceChange24h,
      description: t("avgChange24hDesc"),
    },
    {
      label: t("totalTokens"),
      value: stats.totalTokens.toLocaleString(),
      change: null,
      description: t("totalTokensDesc"),
    },
    {
      label: t("totalHolders"),
      value: stats.totalHolders.toLocaleString(),
      change: null,
      description: t("totalHoldersDesc"),
    },
    {
      label: t("totalTx7d"),
      value: stats.totalTransactions7d.toLocaleString(),
      change: null,
      description: t("totalTx7dDesc"),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, idx) => (
        <Card
          key={idx}
          className="flex flex-col justify-between border-0 bg-gradient-to-br from-card via-card to-muted/20 p-5"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {card.label}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-bold tabular-nums">{card.value}</p>
              {card.change !== null && (
                <span
                  className={cn(
                    "text-sm font-medium tabular-nums",
                    card.change > 0 ? "text-emerald-500" : card.change < 0 ? "text-red-500" : "text-muted-foreground"
                  )}
                >
                  {card.change > 0 ? "↑" : card.change < 0 ? "↓" : ""}
                </span>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{card.description}</p>
        </Card>
      ))}
    </div>
  )
}
