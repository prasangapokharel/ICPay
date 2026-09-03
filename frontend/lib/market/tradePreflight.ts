export const IMPACT_WARN_PCT = 1
export const IMPACT_CONFIRM_PCT = 5
export const IMPACT_BLOCK_PCT = 15

export type PriceImpactBand = "ok" | "warn" | "confirm" | "block"

export function isTradeTokenSafe(token: { symbol: string; decimals: number } | null | undefined): boolean {
  if (!token) return false
  if (!token.symbol.trim()) return false
  return Number.isFinite(token.decimals) && token.decimals >= 0 && token.decimals <= 18
}

export function estimatePriceImpactPct(
  tradeUsd: number | null,
  tvlUsd: number | null
): number | null {
  if (tradeUsd == null || !Number.isFinite(tradeUsd) || tradeUsd <= 0) return null
  if (tvlUsd == null || !Number.isFinite(tvlUsd)) return null
  if (tvlUsd <= 0) return 100
  return (tradeUsd / tvlUsd) * 100
}

export function priceImpactBand(pct: number | null): PriceImpactBand | null {
  if (pct == null || !Number.isFinite(pct)) return null
  if (pct > IMPACT_BLOCK_PCT) return "block"
  if (pct > IMPACT_CONFIRM_PCT) return "confirm"
  if (pct > IMPACT_WARN_PCT) return "warn"
  return "ok"
}

export function impactPctLabel(pct: number): number {
  if (!Number.isFinite(pct) || pct <= 0) return 0
  return Math.min(99, Math.max(1, Math.round(pct)))
}

export function shouldQuoteTrade(opts: {
  hasPool: boolean
  blocked: boolean
  amountIn: bigint | null
  impactBand: PriceImpactBand | null
}): boolean {
  if (!opts.hasPool || opts.blocked) return false
  if (opts.amountIn == null || opts.amountIn <= 0n) return false
  if (opts.impactBand === "block") return false
  return true
}
