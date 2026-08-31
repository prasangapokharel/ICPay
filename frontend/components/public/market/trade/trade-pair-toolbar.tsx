"use client"

import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import { TokenAvatar } from "@/components/public/market/trade/token-avatar"
import { cn } from "@/lib/ui/utils"
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
      <div className="flex flex-wrap items-center gap-4 border-b border-border/60 bg-card/40 px-4 py-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
    )
  }

  if (!snapshot) return null

  const stats = snapshot.stats
  const pairLabel = `${snapshot.base.symbol} / ${snapshot.quote.symbol}`

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-border/60 bg-card/40 px-4 py-3">
      <div className="flex items-center gap-3">
        <TokenAvatar
          symbol={snapshot.base.symbol}
          logoUrl={snapshot.base.logoUrl}
          className="size-10"
        />
        <div>
          <h1 className="text-xl font-bold tracking-tight">{pairLabel}</h1>
          <p className="text-xs text-muted-foreground">{snapshot.base.name}</p>
        </div>
      </div>

      <Metric label={t("priceUsd")} value={formatUsd(stats?.priceUsd, 6)} large />
      {snapshot.priceInIcp !== null && (
        <Metric
          label={t("priceIcp")}
          value={`${snapshot.priceInIcp.toPrecision(6)} ${snapshot.quote.symbol}`}
        />
      )}
      <Metric
        label={t("change24h")}
        value={formatPct(stats?.priceChange24h)}
        valueClass={changeClass(stats?.priceChange24h)}
      />
      <Metric label={t("volume24h")} value={formatUsd(stats?.volume24hUsd)} />
      <Metric label={t("tvl")} value={formatUsd(stats?.tvlUsd)} />
    </div>
  )
}

function Metric({
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
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={
          large
            ? "text-2xl font-semibold tabular-nums"
            : cn("text-sm font-medium tabular-nums", valueClass)
        }
      >
        {value}
      </p>
    </div>
  )
}
