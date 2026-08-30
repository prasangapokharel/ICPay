/** Mirrors icpay_trade SERVICE_FEE_BPS (0.1%) and MIN_SERVICE_FEE. */
export const SERVICE_FEE_BPS = 10n
export const MIN_SERVICE_FEE = 1n

export const DEFAULT_SLIPPAGE_BPS = 100n

export function tradeServiceFee(amountIn: bigint): bigint {
  if (amountIn === 0n) return 0n
  const raw = (amountIn * SERVICE_FEE_BPS) / 10_000n
  return raw > MIN_SERVICE_FEE ? raw : MIN_SERVICE_FEE
}

export function amountAfterServiceFee(amountIn: bigint): bigint {
  if (amountIn === 0n) return 0n
  const fee = tradeServiceFee(amountIn)
  return amountIn > fee ? amountIn - fee : 0n
}

/** Wallet must cover input plus one ledger transfer to the trade canister. */
export function requiredWalletDebit(amountIn: bigint, ledgerFee: bigint): bigint {
  return amountIn + ledgerFee
}

/** Minimum input so swap amount stays positive after 0.1% service fee and deposit ledger fee. */
export function minTradeInput(ledgerFee: bigint): bigint {
  return ledgerFee * 3n + MIN_SERVICE_FEE + 1n
}

export function maxTradeInput(balance: bigint, ledgerFee: bigint): bigint {
  const room = balance - ledgerFee
  return room > 0n ? room : 0n
}

export function minAmountOut(amountOut: bigint, slippageBps: bigint = DEFAULT_SLIPPAGE_BPS): bigint {
  if (amountOut === 0n) return 0n
  return (amountOut * (10_000n - slippageBps)) / 10_000n
}

export function tradeRate(amountIn: bigint, amountOut: bigint): string | null {
  if (amountIn === 0n || amountOut === 0n) return null
  const scaled = (amountOut * 1_000_000n) / amountIn
  const whole = scaled / 1_000_000n
  const frac = (scaled % 1_000_000n).toString().padStart(6, "0").replace(/0+$/, "")
  return frac ? `${whole}.${frac}` : whole.toString()
}
