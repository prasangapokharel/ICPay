export const MIN_TRADE_USD = 1
export const MIN_TRADE_ICP = 0.05
export const MIN_TRADE_ICP_E8S = 5_000_000n

export function tokenAmountUsd(
  amount: bigint,
  decimals: number,
  priceUsd: number
): number | null {
  if (amount <= 0n || !Number.isFinite(priceUsd) || priceUsd <= 0) return null
  const human = Number(amount) / 10 ** decimals
  if (!Number.isFinite(human)) return null
  return human * priceUsd
}

export function meetsMinTradeUsd(usd: number | null, minUsd = MIN_TRADE_USD): boolean {
  return usd !== null && usd >= minUsd
}

export function meetsMinTradeIcp(amountIcpE8s: bigint | null, minIcpE8s = MIN_TRADE_ICP_E8S): boolean {
  return amountIcpE8s !== null && amountIcpE8s >= minIcpE8s
}

export function estimateTradeIcpValue(opts: {
  side: "buy" | "sell"
  amountIn: bigint | null
  tokenInDecimals: number
  priceInIcp?: number | null
  quoteOutRaw?: bigint | null
}): bigint | null {
  if (opts.amountIn == null || opts.amountIn <= 0n) return null
  if (opts.side === "buy") {
    // Buy pays ICP directly
    return opts.amountIn
  }
  // Sell receives ICP: check quoted output first, then estimate from spot rate
  if (opts.quoteOutRaw && opts.quoteOutRaw > 0n) {
    return opts.quoteOutRaw
  }
  if (opts.priceInIcp && Number.isFinite(opts.priceInIcp) && opts.priceInIcp > 0) {
    const priceScaled = BigInt(Math.max(1, Math.round(opts.priceInIcp * 100_000_000)))
    const divisor = 10n ** BigInt(Math.max(0, opts.tokenInDecimals))
    if (divisor > 0n) {
      return (opts.amountIn * priceScaled) / divisor
    }
  }
  return null
}

export function meetsMinTrade(opts: {
  side: "buy" | "sell"
  amountIn: bigint | null
  tokenInDecimals: number
  priceInIcp?: number | null
  quoteOutRaw?: bigint | null
  minIcpE8s?: bigint
}): boolean {
  if (opts.amountIn == null || opts.amountIn <= 0n) return false
  const icpValue = estimateTradeIcpValue(opts)
  if (icpValue !== null) {
    return icpValue >= (opts.minIcpE8s ?? MIN_TRADE_ICP_E8S)
  }
  // Fallback if price is unknown: allow quote to determine or allow if amount > 0
  return true
}

