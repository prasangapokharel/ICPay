"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { formatUsd, sanePriceRange } from "@/lib/market/format"
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
  const range = useMemo(() => sanePriceRange(snapshot?.stats), [snapshot?.stats])

  const chartData = useMemo(() => {
    if (!range) return []
    return [
      { label: t("rangeLow"), price: range.low },
      { label: t("rangeNow"), price: range.price },
      { label: t("rangeHigh"), price: range.high },
    ]
  }, [range, t])

  if (loading && !snapshot) {
    return <Skeleton className="m-4 h-full min-h-[220px] rounded-xl" />
  }

  return (
    <div className="flex h-full min-h-[220px] flex-col overflow-hidden p-4">
      <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
        <p className="text-sm font-medium">{t("chart24h")}</p>
        {range && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {formatUsd(range.low, 4)} — {formatUsd(range.high, 4)}
          </p>
        )}
      </div>

      {range ? (
        <ChartContainer config={chartConfig} className="min-h-[180px] w-full flex-1">
          <LineChart data={chartData} margin={{ left: 4, right: 12, top: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis
              domain={[range.low * 0.998, range.high * 1.002]}
              tickFormatter={(v) => formatUsd(Number(v), 2)}
              width={72}
              tick={{ fontSize: 10 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ReferenceLine
              y={range.price}
              stroke="hsl(var(--primary))"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="var(--color-price)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-price)" }}
            />
          </LineChart>
        </ChartContainer>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground">
          {t("noChartData")}
        </div>
      )}
      <p className="mt-2 shrink-0 text-[11px] text-muted-foreground">{t("chartSourceNote")}</p>
    </div>
  )
}
