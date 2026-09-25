"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type AreaData,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
  AreaSeries,
} from "lightweight-charts"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/ui/utils"
import { formatUsd } from "@/lib/market/format"
import {
  CHART_INTERVALS,
  type ChartWindow,
  type OhlcBar,
} from "@/lib/market/ohlc"
import { useIcpswapOhlc } from "@/hooks/market/useTradeTerminal"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

interface CursorDiffInfo {
  x: number
  y: number
  cursorPrice: number
  basePrice: number
  diff: number
  diffPct: number
  isAbove: boolean
}

type ChartType = "candle" | "area"

function cleanOhlcData(bars: OhlcBar[]): {
  candles: CandlestickData[]
  volumes: HistogramData[]
  areas: AreaData[]
} {
  const seen = new Set<number>()
  const candles: CandlestickData[] = []
  const volumes: HistogramData[] = []
  const areas: AreaData[] = []

  const sorted = [...bars].sort((a, b) => a.time - b.time)

  for (const b of sorted) {
    if (!Number.isFinite(b.close) || b.close <= 0) continue
    const rawTime = b.time > 10_000_000_000 ? Math.floor(b.time / 1000) : Math.floor(b.time)
    if (!Number.isFinite(rawTime) || rawTime <= 0) continue

    if (seen.has(rawTime)) continue
    seen.add(rawTime)

    const open = Number.isFinite(b.open) && b.open > 0 ? b.open : b.close
    const high = Number.isFinite(b.high) && b.high > 0 ? Math.max(b.high, open, b.close) : b.close
    const low = Number.isFinite(b.low) && b.low > 0 ? Math.min(b.low, open, b.close) : b.close
    const close = b.close
    const isUp = close >= open

    candles.push({
      time: rawTime as CandlestickData["time"],
      open,
      high,
      low,
      close,
    })

    volumes.push({
      time: rawTime as HistogramData["time"],
      value: Number(b.volumeUsd || 0),
      color: isUp ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)",
    })

    areas.push({
      time: rawTime as AreaData["time"],
      value: close,
    })
  }

  return { candles, volumes, areas }
}

export function TradeChartPanel({
  snapshot,
  loading,
  bare,
}: {
  snapshot: TradePairSnapshot | undefined
  loading?: boolean
  bare?: boolean
}) {
  const t = useTranslations("marketTrade")
  const [window, setWindow] = useState<ChartWindow>("1w")
  const [chartType, setChartType] = useState<ChartType>("candle")
  const [cursorDiff, setCursorDiff] = useState<CursorDiffInfo | null>(null)

  const { bars, isLoading } = useIcpswapOhlc(snapshot?.baseLedgerId, window)

  const { candles, volumes, areas } = useMemo(() => cleanOhlcData(bars), [bars])
  const waiting = (loading || isLoading) && candles.length === 0

  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const areaSeriesRef = useRef<ISeriesApi<"Area"> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const latestPriceRef = useRef<number>(0)

  const latestCandle = candles[candles.length - 1] ?? null
  const currentPrice = snapshot?.stats?.priceUsd ?? latestCandle?.close ?? 0

  useEffect(() => {
    if (currentPrice > 0) {
      latestPriceRef.current = currentPrice
    } else if (candles.length > 0) {
      latestPriceRef.current = Number(candles[candles.length - 1].close)
    }
  }, [currentPrice, candles])

  // 1. Initialize chart on mount
  useEffect(() => {
    if (!containerRef.current) return

    const initialHeight = containerRef.current.clientHeight || 340
    const initialWidth = containerRef.current.clientWidth || 600

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94a3b8",
        fontSize: 11,
        fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.04)" },
        horzLines: { color: "rgba(255, 255, 255, 0.04)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(148, 163, 184, 0.35)",
          width: 1,
          style: 3,
        },
        horzLine: {
          color: "rgba(148, 163, 184, 0.35)",
          width: 1,
          style: 3,
        },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.22 },
        autoScale: true,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      width: initialWidth,
      height: initialHeight,
    })

    // Volume Subseries
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    })
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    })

    // Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    })

    // Area Series
    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: "rgba(34, 197, 94, 0.35)",
      bottomColor: "rgba(34, 197, 94, 0.01)",
      lineColor: "#22c55e",
      lineWidth: 2,
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    areaSeriesRef.current = areaSeries
    volumeSeriesRef.current = volumeSeries

    // Crosshair Delta Tooltip
    chart.subscribeCrosshairMove((param) => {
      if (!param.point || !containerRef.current) {
        setCursorDiff(null)
        return
      }

      const activeSeries = candleSeriesRef.current?.options().visible
        ? candleSeriesRef.current
        : areaSeriesRef.current
      if (!activeSeries) {
        setCursorDiff(null)
        return
      }

      const { x, y } = param.point
      const container = containerRef.current
      if (x < 0 || y < 0 || x > container.clientWidth || y > container.clientHeight) {
        setCursorDiff(null)
        return
      }

      const cursorPrice = activeSeries.coordinateToPrice(y)
      const basePrice = latestPriceRef.current

      if (cursorPrice === null || isNaN(cursorPrice) || cursorPrice <= 0 || basePrice <= 0) {
        setCursorDiff(null)
        return
      }

      const diff = cursorPrice - basePrice
      const diffPct = (diff / basePrice) * 100

      setCursorDiff({
        x,
        y,
        cursorPrice,
        basePrice,
        diff,
        diffPct,
        isAbove: diff >= 0,
      })
    })

    // Auto-Resize with ResizeObserver
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry && chartRef.current) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          chartRef.current.applyOptions({ width, height })
        }
      }
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      areaSeriesRef.current = null
      volumeSeriesRef.current = null
    }
  }, [])

  // 2. Reactively feed data and toggle series visibility
  useEffect(() => {
    if (!chartRef.current) return

    const isCandle = chartType === "candle"

    if (candleSeriesRef.current) {
      candleSeriesRef.current.applyOptions({ visible: isCandle })
      if (isCandle && candles.length > 0) {
        candleSeriesRef.current.setData(candles)
      } else if (!isCandle) {
        candleSeriesRef.current.setData([])
      }
    }

    if (areaSeriesRef.current) {
      areaSeriesRef.current.applyOptions({ visible: !isCandle })
      if (!isCandle && areas.length > 0) {
        areaSeriesRef.current.setData(areas)
      } else if (isCandle) {
        areaSeriesRef.current.setData([])
      }
    }

    if (volumeSeriesRef.current) {
      if (volumes.length > 0) {
        volumeSeriesRef.current.setData(volumes)
      } else {
        volumeSeriesRef.current.setData([])
      }
    }

    if (candles.length > 0) {
      requestAnimationFrame(() => {
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent()
        }
      })
    }
  }, [candles, volumes, areas, chartType, snapshot?.baseLedgerId])

  const body = (
    <div className="flex h-full min-h-[220px] flex-col">
      <div
        className="flex shrink-0 items-center justify-between border-b px-4 py-2"
        role="tablist"
        aria-label={t("tabChart")}
      >
        <div className="flex items-center gap-1">
          {CHART_INTERVALS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={window === id}
              onClick={() => setWindow(id)}
              className={cn(
                "rounded px-2.5 py-0.5 text-xs font-semibold tabular-nums transition-colors",
                window === id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {id === "1d" ? t("interval1d") : t("interval1w")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-border/60 bg-muted/30 p-0.5 text-[10px] font-medium">
            <button
              type="button"
              onClick={() => setChartType("candle")}
              className={cn(
                "rounded px-2 py-0.5 transition-colors",
                chartType === "candle"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Candles
            </button>
            <button
              type="button"
              onClick={() => setChartType("area")}
              className={cn(
                "rounded px-2 py-0.5 transition-colors",
                chartType === "area"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Line
            </button>
          </div>
          {snapshot && (
            <span className="hidden text-xs font-mono font-medium text-muted-foreground sm:inline-block">
              {snapshot.base.symbol}/{snapshot.quote.symbol}
            </span>
          )}
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden p-1">
        {/* Loading overlay */}
        {waiting && (
          <div className="absolute inset-1 z-20 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-xs">
            <Skeleton className="size-full rounded-xl" />
          </div>
        )}

        {/* Empty state overlay */}
        {!waiting && candles.length === 0 && (
          <div className="absolute inset-1 z-10 flex size-full items-center justify-center text-sm text-muted-foreground">
            {t("noChartData")}
          </div>
        )}

        {/* Chart canvas is permanently mounted */}
        <div className="relative size-full">
          <div
            ref={containerRef}
            className="absolute inset-0 size-full"
            onMouseLeave={() => setCursorDiff(null)}
          />

          {/* Floating Crosshair Delta Badge */}
          {cursorDiff && (
            <div
              className="pointer-events-none absolute z-30 transition-[top,left] duration-75"
              style={{
                left: `${Math.min(cursorDiff.x + 14, (containerRef.current?.clientWidth || 600) - 170)}px`,
                top: `${Math.max(10, Math.min(cursorDiff.y - 14, (containerRef.current?.clientHeight || 300) - 32))}px`,
              }}
            >
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 border-border/80 bg-background/95 px-2.5 py-1 text-xs font-mono font-medium shadow-md backdrop-blur-md",
                  cursorDiff.isAbove ? "text-emerald-500" : "text-rose-500"
                )}
              >
                <span>
                  {cursorDiff.isAbove ? "+" : ""}
                  {cursorDiff.diffPct.toFixed(2)}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  ({cursorDiff.isAbove ? "+" : "-"}
                  {formatUsd(Math.abs(cursorDiff.diff), 4)})
                </span>
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (bare) return body
  return (
    <Card size="sm" className="m-1 flex h-full min-h-[240px] flex-col gap-0 py-0">
      <CardContent className="flex min-h-0 flex-1 flex-col p-0">{body}</CardContent>
    </Card>
  )
}
