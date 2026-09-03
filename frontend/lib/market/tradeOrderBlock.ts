export type TradeOrderBlock =
  | "empty"
  | "need_transfer"
  | "insufficient"
  | "min_usd"
  | "no_quote"
  | "ok"

export function tradeOrderBlock(opts: {
  tradingBal: bigint
  amountIn: bigint | null
  maxIn: bigint
  aboveMinUsd: boolean
  hasQuote: boolean
}): TradeOrderBlock {
  if (opts.tradingBal <= 0n) return "need_transfer"
  if (opts.amountIn == null || opts.amountIn <= 0n) return "empty"
  if (opts.amountIn > opts.maxIn) return "insufficient"
  if (!opts.aboveMinUsd) return "min_usd"
  if (!opts.hasQuote) return "no_quote"
  return "ok"
}
