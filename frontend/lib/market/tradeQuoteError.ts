export type TradeQuoteErrorKind =
  | "blocked"
  | "no_pool"
  | "liquidity"
  | "too_small"
  | "unsupported"
  | "same_token"
  | "unknown"

export function classifyTradeQuoteError(err: unknown): TradeQuoteErrorKind {
  const msg = (err instanceof Error ? err.message : String(err ?? "")).toLowerCase()
  if (msg.includes("cannot be traded") || msg.includes("icpay cannot")) return "blocked"
  if (msg.includes("no pool found") || msg.includes("pool not found") || msg.includes("no pool for")) return "no_pool"
  if (
    msg.includes("liquidity") ||
    msg.includes("insufficient funds") ||
    msg.includes("insufficientfunds") ||
    msg.includes("commonerror") ||
    msg.includes("common error") ||
    msg.includes("insufficient liquidity") ||
    msg.includes("pool liquidity")
  ) {
    return "liquidity"
  }
  if (msg.includes("too small")) return "too_small"
  if (msg.includes("unsupported")) return "unsupported"
  if (msg.includes("sametoken") || msg.includes("same token")) return "same_token"
  return "unknown"
}

export function classifyTradeExecError(err: unknown): "slippage" | "liquidity" | "timeout" | "unknown" {
  const msg = (err instanceof Error ? err.message : String(err ?? "")).toLowerCase()
  if (
    msg.includes("slippage") ||
    msg.includes("less than amountoutminimum") ||
    msg.includes("amountout is less") ||
    msg.includes("amountoutminimum")
  ) {
    return "slippage"
  }
  if (
    msg.includes("liquidity") ||
    msg.includes("no pool") ||
    msg.includes("insufficient funds") ||
    msg.includes("insufficientfunds") ||
    msg.includes("commonerror") ||
    msg.includes("common error")
  ) {
    return "liquidity"
  }
  if (msg.includes("timeout") || msg.includes("timed out")) return "timeout"
  return "unknown"
}

export function shouldRetryTradeQuote(err: unknown): boolean {
  return classifyTradeQuoteError(err) === "unknown"
}

