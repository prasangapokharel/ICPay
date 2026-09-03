import type { TradeQuoteErrorKind } from "./tradeQuoteError"
import { impactPctLabel, type PriceImpactBand } from "./tradePreflight"

export type TradeOrderBlock =
  | "blocked"
  | "no_pool"
  | "empty"
  | "need_transfer"
  | "insufficient"
  | "min_usd"
  | "no_liquidity"
  | "too_small"
  | "quote_error"
  | "no_quote"
  | "ok"

export function tradeOrderBlock(opts: {
  tradingBal: bigint
  amountIn: bigint | null
  maxIn: bigint
  aboveMinUsd: boolean
  hasQuote: boolean
  blocked?: boolean
  hasPool?: boolean
  quoting?: boolean
  quoteError?: TradeQuoteErrorKind | null
  impactBand?: PriceImpactBand | null
}): TradeOrderBlock {
  if (opts.blocked) return "blocked"
  if (opts.hasPool === false) return "no_pool"
  if (opts.tradingBal <= 0n) return "need_transfer"
  if (opts.amountIn == null || opts.amountIn <= 0n) return "empty"
  if (opts.amountIn > opts.maxIn) return "insufficient"
  if (!opts.aboveMinUsd) return "min_usd"
  if (opts.impactBand === "block") return "no_liquidity"
  if (opts.quoteError === "liquidity" || opts.quoteError === "no_pool") return "no_liquidity"
  if (opts.quoteError === "too_small") return "too_small"
  if (opts.quoteError === "blocked") return "blocked"
  if (opts.quoteError) return "quote_error"
  if (opts.quoting || !opts.hasQuote) return "no_quote"
  return "ok"
}

export function tradeOrderAlert(
  block: TradeOrderBlock,
  minUsd: number,
  quoteError?: TradeQuoteErrorKind | null
): { key: string; values?: { usd: number }; destructive: boolean } | null {
  if (block === "blocked") return { key: "cannotTrade", destructive: false }
  if (block === "no_pool") return { key: "noPoolHint", destructive: false }
  if (block === "no_liquidity") return { key: "insufficientLiquidity", destructive: true }
  if (block === "too_small") return { key: "amountTooSmall", destructive: true }
  if (block === "quote_error") {
    if (quoteError === "unsupported") return { key: "unsupportedToken", destructive: true }
    return { key: "quoteUnavailable", destructive: true }
  }
  if (block === "min_usd") return { key: "minTradeUsd", values: { usd: minUsd }, destructive: true }
  return null
}

export function tradeImpactAlert(
  band: PriceImpactBand | null,
  pct: number | null
): { key: string; values?: { pct: number }; destructive: boolean } | null {
  if (band == null || pct == null) return null
  const values = { pct: impactPctLabel(pct) }
  if (band === "warn") return { key: "highPriceImpact", values, destructive: false }
  if (band === "confirm") return { key: "confirmPriceImpact", values, destructive: false }
  return null
}

export function canSubmitTrade(block: TradeOrderBlock): boolean {
  return block === "ok"
}

export function canOpenTransfer(block: TradeOrderBlock): boolean {
  return block === "need_transfer"
}
