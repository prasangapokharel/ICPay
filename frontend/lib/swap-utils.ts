/** Mirrors backend Config.SWAP_PLATFORM_FEE_BPS (1%). */
export const SWAP_PLATFORM_FEE_BPS = 100n

/** Default slippage tolerance passed as amountOutMin (1%). */
export const DEFAULT_SLIPPAGE_BPS = 100n

export function platformFee(amountIn: bigint): bigint {
  return (amountIn * SWAP_PLATFORM_FEE_BPS) / 10_000n
}

/** Backend debits amountIn plus two ledger fees from the user subaccount. */
export function requiredBalance(amountIn: bigint, ledgerFee: bigint): bigint {
  return amountIn + 2n * ledgerFee
}

export function maxSwapInput(balance: bigint, ledgerFee: bigint): bigint {
  const room = balance - 2n * ledgerFee
  return room > 0n ? room : 0n
}

export function minAmountOut(amountOut: bigint, slippageBps: bigint = DEFAULT_SLIPPAGE_BPS): bigint {
  if (amountOut === 0n) return 0n
  return (amountOut * (10_000n - slippageBps)) / 10_000n
}

export function swapRate(amountIn: bigint, amountOut: bigint): string | null {
  if (amountIn === 0n || amountOut === 0n) return null
  const scaled = (amountOut * 1_000_000n) / amountIn
  const whole = scaled / 1_000_000n
  const frac = (scaled % 1_000_000n).toString().padStart(6, "0").replace(/0+$/, "")
  return frac ? `${whole}.${frac}` : whole.toString()
}
