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

export function priceInRange(
  stats: IcpswapTokenStats | null | undefined
): { position: number; low: number; high: number; price: number } | null {
  if (!stats) return null
  const { priceUsd: price, priceLow24h: low, priceHigh24h: high } = stats
  if (price <= 0 || high <= low) return null
  const position = Math.min(1, Math.max(0, (price - low) / (high - low)))
  return { position, low, high, price }
}
