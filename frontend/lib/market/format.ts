import type { IcpswapTokenStats } from "@/services/market/icpswapStats"

export function formatUsd(
  value: number | null | undefined,
  digits = 2,
  opts?: { compact?: boolean }
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "$0.00"
  const compact = opts?.compact ?? true
  if (compact && value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (compact && value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`
}

/** Full precision string, capped at 7 decimals, for a title/hover tooltip. */
export function formatUsdFull(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "$0.00"
  if (value === 0) return "$0.00"
  const decimals = value < 1 ? 7 : 2
  return `$${value.toFixed(decimals)}`
}

/** Compact headline + full decimals underneath when the number is long. */
export function priceLayers(
  value: number | null | undefined,
  suffix = ""
): { main: string; sub?: string } {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return { main: "—" }
  }

  const unit = suffix ? ` ${suffix}` : ""
  const fullRaw =
    value >= 1
      ? value.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")
      : value.toFixed(10).replace(/0+$/, "").replace(/\.$/, "")
  const frac = fullRaw.includes(".") ? fullRaw.split(".")[1]!.length : 0
  const full = suffix ? `${fullRaw}${unit}` : `$${fullRaw}`

  let main: string
  if (!suffix && value >= 1_000) main = formatUsd(value)
  else if (!suffix && value >= 1) main = `$${value.toFixed(2)}`
  else if (!suffix && value >= 0.01) main = `$${value.toFixed(4)}`
  else if (!suffix) main = `$${value.toPrecision(4)}`
  else main = `${value.toPrecision(4)}${unit}`

  if (frac > 4 && full !== main) return { main, sub: full }
  return { main }
}

export function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "0.00%"

  // Clamp extreme values to reasonable display range (-100% to +1000%)
  const clamped = Math.max(-100, Math.min(1000, value))

  const sign = clamped > 0 ? "+" : ""
  return `${sign}${clamped.toFixed(2)}%`
}

export function changeClass(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "text-muted-foreground"
  if (value > 0) return "text-emerald-500"
  if (value < 0) return "text-red-500"
  return "text-muted-foreground"
}

const RANGE_MAX_RATIO = 5

/** ICPSwap occasionally returns bogus 24h highs/lows — clamp around live price. */
export function sanePriceRange(
  stats: IcpswapTokenStats | null | undefined,
  window: "24h" | "7d" = "24h"
): { low: number; high: number; price: number } | null {
  if (!stats || stats.priceUsd <= 0) return null

  const price = stats.priceUsd
  const floor = price / RANGE_MAX_RATIO
  const ceiling = price * RANGE_MAX_RATIO

  let low = window === "7d" ? stats.priceLow7d : stats.priceLow24h
  let high = window === "7d" ? stats.priceHigh7d : stats.priceHigh24h

  if (low <= 0 || low < floor || low > ceiling) {
    low = price * (1 - Math.min(Math.abs(stats.priceChange24h) / 100, 0.05) || 0.02)
  }
  if (high <= low || high < floor || high > ceiling) {
    high = price * (1 + Math.min(Math.abs(stats.priceChange24h) / 100, 0.05) || 0.02)
  }
  if (high <= low) {
    low = price * 0.99
    high = price * 1.01
  }

  return { low, high, price }
}

export function priceInRange(
  stats: IcpswapTokenStats | null | undefined
): { position: number; low: number; high: number; price: number } | null {
  const range = sanePriceRange(stats)
  if (!range) return null
  const { low, high, price } = range
  const position = Math.min(1, Math.max(0, (price - low) / (high - low)))
  return { position, low, high, price }
}
