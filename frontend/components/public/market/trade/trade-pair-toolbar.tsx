"use client"

import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import { PairTokenIcon } from "@/components/public/market/trade/trade-market-watchlist"
import { changeClass, formatPct, formatUsd } from "@/lib/market/format"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

export function TradePairToolbar({
  snapshot,
  loading,
}: {
  snapshot: TradePairSnapshot | undefined
  loading?: boolean
}) {
  const t = useTranslations("marketTrade")

  if (loading && !snapshot) {
    return (
      <div className="flex flex-wrap items-center gap-4 border-b border-border/60 bg-card/30 px-4 py-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>
    )
  }

  if (!snapshot) return null

  const stats = snapshot.stats
  const pairLabel = `${snapshot.baseSymbol} / ${snapshot.quoteSymbol}`

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border/60 bg-card/30 px-4 py-3">
      <div className="flex items-center gap-3">
        <PairTokenIcon symbol={snapshot.baseSymbol} />
        <div>
          <h1 className="text-lg font-bold tracking-tight">{pairLabel}</h1>
          <p className="text-xs text-muted-foreground">{t("icpswapVenue")}</p>
        </div>
      </div>

      <Stat label={t("price")} value={formatUsd(stats?.priceUsd, 6)} large />
      <Stat
        label={t("change24h")}
        value={formatPct(stats?.priceChange24h)}
        valueClass={changeClass(stats?.priceChange24h)}
      />
      <Stat label={t("volume24h")} value={formatUsd(stats?.volume24hUsd)} />
      <Stat label={t("tvl")} value={formatUsd(stats?.tvlUsd)} />
      {snapshot.spotRate !== null && (
        <Stat
          label={t("spotRate")}
          value={`${snapshot.spotRate.toPrecision(4)} ${snapshot.quoteSymbol}`}
        />
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  large,
  valueClass,
}: {
  label: string
  value: string
  large?: boolean
  valueClass?: string
}) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={large ? "text-xl font-semibold tabular-nums" : `text-sm font-medium tabular-nums ${valueClass ?? ""}`}>
        {value}
      </p>
    </div>
  )
}
