"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { formatUsd } from "@/lib/market/format"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

const chartConfig = {
  price: { label: "USD", color: "hsl(var(--primary))" },
}

export function TradeChartPanel({
  snapshot,
  loading,
}: {
  snapshot: TradePairSnapshot | undefined
  loading?: boolean
}) {
  const t = useTranslations("marketTrade")
  const stats = snapshot?.stats

  const chartData = useMemo(() => {
    if (!stats || stats.priceUsd <= 0) return []
    const low = stats.priceLow24h > 0 ? stats.priceLow24h : stats.priceUsd
    const high = stats.priceHigh24h > low ? stats.priceHigh24h : stats.priceUsd
    const price = stats.priceUsd
    return [
      { label: t("rangeLow"), price: low },
      { label: t("rangeNow"), price },
      { label: t("rangeHigh"), price: high },
    ]
  }, [stats, t])

  if (loading && !snapshot) {
    return <Skeleton className="m-4 h-full min-h-[220px] rounded-xl" />
  }

  const hasRange =
    stats &&
    stats.priceLow24h > 0 &&
    stats.priceHigh24h > stats.priceLow24h &&
    stats.priceUsd > 0

  return (
    <div className="flex h-full min-h-[220px] flex-col p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{t("chart24h")}</p>
        {hasRange && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {formatUsd(stats.priceLow24h, 4)} — {formatUsd(stats.priceHigh24h, 4)}
          </p>
        )}
      </div>

      {hasRange ? (
        <ChartContainer config={chartConfig} className="min-h-[200px] flex-1">
          <LineChart data={chartData} margin={{ left: 4, right: 12, top: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis
              domain={[
                stats.priceLow24h * 0.995,
                stats.priceHigh24h * 1.005,
              ]}
              tickFormatter={(v) => formatUsd(Number(v), 2)}
              width={80}
              tick={{ fontSize: 10 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ReferenceLine
              y={stats.priceUsd}
              stroke="hsl(var(--primary))"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="var(--color-price)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-price)" }}
            />
          </LineChart>
        </ChartContainer>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground">
          {t("noChartData")}
        </div>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">{t("chartSourceNote")}</p>
    </div>
  )
}
