"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/ui/utils"
import { formatUsd } from "@/lib/market/format"
import { ohlcYPad, toChartRows, type ChartWindow } from "@/lib/market/ohlc"
import { useIcpswapOhlc } from "@/hooks/market/useTradeTerminal"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

const chartConfig = {
  price: { label: "USD", color: "var(--chart-1)" },
} satisfies ChartConfig

function tickLabel(value: string, window: ChartWindow) {
  const d = new Date(value)
  return window === "7d"
    ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

export function TradeChartPanel({
  snapshot,
  loading,
}: {
  snapshot: TradePairSnapshot | undefined
  loading?: boolean
}) {
  const t = useTranslations("marketTrade")
  const [window, setWindow] = useState<ChartWindow>("24h")
  const { bars, isLoading } = useIcpswapOhlc(snapshot?.baseLedgerId, window)
  const series = useMemo(() => toChartRows(bars), [bars])
  const domain = useMemo(() => ohlcYPad(bars), [bars])
  const waiting = (loading || isLoading) && series.length === 0

  return (
    <Card size="sm" className="m-1 flex h-full min-h-[240px] flex-col gap-0 py-0">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 border-b py-3">
        <CardTitle className="text-sm font-medium">{t("chart24h")}</CardTitle>
        <div className="flex items-center gap-3" role="tablist" aria-label={t("chart24h")}>
          {(["24h", "7d"] as const satisfies ChartWindow[]).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={window === id}
              onClick={() => setWindow(id)}
              className={cn(
                "text-xs tabular-nums",
                window === id
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {id === "24h" ? t("range24h") : t("range7d")}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col px-2 pt-3 pb-3">
        {waiting ? (
          <Skeleton className="h-full min-h-[200px] w-full rounded-xl" />
        ) : series.length > 0 ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-full min-h-[200px] w-full flex-1">
            <AreaChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 4 }}>
              <defs>
                <linearGradient id="fillTradePrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => tickLabel(value, window)}
              />
              <YAxis
                domain={domain}
                width={64}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatUsd(Number(v), 4)}
              />
              <ChartTooltip
                cursor={{
                  stroke: "hsl(var(--muted-foreground))",
                  strokeDasharray: "4 4",
                  strokeWidth: 1,
                }}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value) =>
                      new Date(String(value)).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    }
                  />
                }
              />
              <Area
                dataKey="price"
                type="natural"
                fill="url(#fillTradePrice)"
                stroke="var(--color-price)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-full min-h-[200px] flex-1 items-center justify-center text-sm text-muted-foreground">
            {t("noChartData")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
