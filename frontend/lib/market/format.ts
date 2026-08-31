"use client"

import type { IcpswapTokenStats } from "@/services/market/icpswapStats"

export function formatUsd(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—"
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  if (value < 0.0001 && value > 0) return `$${value.toExponential(2)}`
  return `$${value.toFixed(digits)}`
}

export function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—"
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
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
  stats: IcpswapTokenStats | null | undefined
): { low: number; high: number; price: number } | null {
  if (!stats || stats.priceUsd <= 0) return null

  const price = stats.priceUsd
  const floor = price / RANGE_MAX_RATIO
  const ceiling = price * RANGE_MAX_RATIO

  let low = stats.priceLow24h
  let high = stats.priceHigh24h

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
