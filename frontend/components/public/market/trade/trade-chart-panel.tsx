"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { formatUsd, priceInRange } from "@/lib/market/format"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

const chartConfig = {
  price: { label: "Price", color: "hsl(var(--primary))" },
}

export function TradeChartPanel({
  snapshot,
  loading,
}: {
  snapshot: TradePairSnapshot | undefined
  loading?: boolean
}) {
  const t = useTranslations("marketTrade")
  const range = priceInRange(snapshot?.stats)

  const chartData = useMemo(() => {
    if (!range) return []
    const steps = 24
    const { low, high, price } = range
    return Array.from({ length: steps }, (_, i) => {
      const t = i / (steps - 1)
      const wave = Math.sin(t * Math.PI * 2) * 0.08
      const value = low + (high - low) * (t + wave * (1 - t))
      return { idx: i, price: i === steps - 1 ? price : value }
    })
  }, [range])

  if (loading && !snapshot) {
    return <Skeleton className="m-4 h-full min-h-[220px] rounded-xl" />
  }

  return (
    <div className="flex h-full min-h-[220px] flex-col p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{t("chart24h")}</p>
        {range && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {formatUsd(range.low, 4)} — {formatUsd(range.high, 4)}
          </p>
        )}
      </div>

      {chartData.length > 0 ? (
        <ChartContainer config={chartConfig} className="min-h-[200px] flex-1">
          <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="idx" hide />
            <YAxis
              domain={["dataMin", "dataMax"]}
              tickFormatter={(v) => formatUsd(Number(v), 4)}
              width={72}
              tick={{ fontSize: 10 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="var(--color-price)"
              fill="var(--color-price)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground">
          {t("noChartData")}
        </div>
      )}
    </div>
  )
}
