export type IcpswapChartLevel = "h1" | "d1"
export type ChartWindow = "1h" | "1d" | "1w"

export const CHART_INTERVALS: ChartWindow[] = ["1h", "1d", "1w"]

export function ohlcWindowQuery(window: ChartWindow): { level: IcpswapChartLevel; limit: number } {
  if (window === "1d") return { level: "d1", limit: 90 }
  if (window === "1w") return { level: "d1", limit: 180 }
  return { level: "h1", limit: 48 }
}

export function ohlcTickIsTime(window: ChartWindow): boolean {
  return window === "1h"
}

export type OhlcBar = {
  time: number
  open: number
  high: number
  low: number
  close: number
  volumeUsd: number
}

function num(value: unknown): number {
  const n = typeof value === "string" || typeof value === "number" ? Number(value) : NaN
  return Number.isFinite(n) ? n : NaN
}

export function parseIcpswapChartBody(body: unknown): OhlcBar[] {
  const data = (body as { data?: { content?: unknown } })?.data
  const rows = Array.isArray(data?.content) ? data.content : []
  const bars: OhlcBar[] = []
  for (const row of rows) {
    const rec = row as Record<string, unknown>
    const time = num(rec.beginTime) || num(rec.snapshotTime)
    const open = num(rec.open)
    const high = num(rec.high)
    const low = num(rec.low)
    const close = num(rec.close) || num(rec.price)
    if (!Number.isFinite(time) || !Number.isFinite(close)) continue
    bars.push({
      time,
      open: Number.isFinite(open) ? open : close,
      high: Number.isFinite(high) ? high : close,
      low: Number.isFinite(low) ? low : close,
      close,
      volumeUsd: num(rec.volumeUSD) || 0,
    })
  }
  return sortOhlcAsc(bars)
}

export function sortOhlcAsc(bars: OhlcBar[]): OhlcBar[] {
  return [...bars].sort((a, b) => a.time - b.time)
}

export function ohlcYPad(bars: OhlcBar[]): [number, number] {
  if (bars.length === 0) return [0, 1]
  const lows = bars.map((b) => b.low)
  const highs = bars.map((b) => b.high)
  const min = Math.min(...lows)
  const max = Math.max(...highs)
  const mid = (min + max) / 2
  const pad = Math.max((max - min) * 0.12, Math.abs(mid) * 0.004, 1e-9)
  return [min - pad, max + pad]
}

export type OhlcChartRow = OhlcBar & { date: string; price: number; up: boolean }

export function toChartRows(bars: OhlcBar[]): OhlcChartRow[] {
  return bars.map((b) => ({
    ...b,
    date: new Date(b.time).toISOString(),
    price: b.close,
    up: b.close >= b.open,
  }))
}
