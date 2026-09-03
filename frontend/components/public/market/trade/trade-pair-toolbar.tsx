"use client"

import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { TokenAvatar } from "@/components/public/market/trade/token-avatar"
import { cn } from "@/lib/ui/utils"
import { changeClass, formatPct, formatUsd, priceLayers, sanePriceRange } from "@/lib/market/format"
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
      <Card size="sm" className="m-1 flex flex-row flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3">
        <div className="flex items-center gap-3 pr-2">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="min-w-0 space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="min-w-0 space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="min-w-0 space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="min-w-0 space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="min-w-0 space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </Card>
    )
  }

  if (!snapshot) return null

  const stats = snapshot.stats
  const range = sanePriceRange(stats)
  const usd = priceLayers(stats?.priceUsd)
  const icp = priceLayers(snapshot.priceInIcp, snapshot.quote.symbol)

  return (
    <Card
      size="sm"
      className="m-1 flex flex-row flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3"
    >
      <div className="flex items-center gap-3 pr-2">
        <TokenAvatar
          symbol={snapshot.base.symbol}
          ledgerId={snapshot.baseLedgerId}
          logoUrl={snapshot.base.logoUrl}
          className="size-10"
        />
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            {snapshot.base.symbol}/{snapshot.quote.symbol}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("tokenPriceLine", { name: snapshot.base.name })}
          </p>
        </div>
      </div>

      <Metric
        label={t("priceUsd")}
        value={usd.main}
        detail={usd.sub}
        large
        valueClass={changeClass(stats?.priceChange24h)}
      />
      {snapshot.priceInIcp !== null && (
        <Metric label={t("priceIcp")} value={icp.main} detail={icp.sub} />
      )}
      <Metric
        label={t("change24h")}
        value={formatPct(stats?.priceChange24h)}
        valueClass={changeClass(stats?.priceChange24h)}
      />
      {range && (
        <>
          <Metric label={t("rangeHigh")} value={priceLayers(range.high).main} />
          <Metric label={t("rangeLow")} value={priceLayers(range.low).main} />
        </>
      )}
      <Metric label={t("volume24h")} value={formatUsd(stats?.volume24hUsd)} />
      {snapshot.fdv && <Metric label={t("fdv")} value={formatUsd(snapshot.fdv)} />}
      {snapshot.holders !== undefined && (
        <Metric
          label={t("holders")}
          value={snapshot.holders.toLocaleString()}
          detail={snapshot.holdersChange24h !== undefined ? formatPct((snapshot.holdersChange24h / (snapshot.holders || 1)) * 100) : undefined}
        />
      )}
    </Card>
  )
}

function Metric({
  label,
  value,
  detail,
  large,
  valueClass,
}: {
  label: string
  value: string
  detail?: string
  large?: boolean
  valueClass?: string
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "tabular-nums",
          large ? "text-xl font-semibold" : "text-sm font-medium",
          valueClass
        )}
      >
        {value}
      </p>
      {detail && detail !== value && (
        <p className="text-[10px] tabular-nums text-muted-foreground">{detail}</p>
      )}
    </div>
  )
}
