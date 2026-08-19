/** Mirrors backend Config.SWAP_ICP_SERVICE_FEE_E8S (0.1 ICP). */
export const SWAP_ICP_SERVICE_FEE_E8S = 10_000_000n

/** Default slippage tolerance passed as amountOutMin (1%). */
export const DEFAULT_SLIPPAGE_BPS = 100n

export function icpServiceFee(): bigint {
  return SWAP_ICP_SERVICE_FEE_E8S
}

/** ICP subaccount needs service fee plus one ledger transfer fee. */
export function icpServiceDebit(icpLedgerFee: bigint): bigint {
  return SWAP_ICP_SERVICE_FEE_E8S + icpLedgerFee
}

/** Backend debits amountIn plus three ledger fees from the user subaccount. */
export function requiredBalance(amountIn: bigint, ledgerFee: bigint): bigint {
  return amountIn + 3n * ledgerFee
}

/** When swapping ICP, the same subaccount also pays the ICP service fee. */
export function requiredIcpSwapBalance(
  amountIn: bigint,
  icpFee: bigint,
  serviceDebit: bigint
): bigint {
  return amountIn + 3n * icpFee + serviceDebit
}

/** Max swappable input after ledger fees; ICP-in swaps also reserve the service fee. */
export function maxSwapInput(
  balance: bigint,
  ledgerFee: bigint,
  icpServiceDebit?: bigint
): bigint {
  let reserve = 3n * ledgerFee
  if (icpServiceDebit !== undefined) {
    reserve += icpServiceDebit
  }
  const room = balance - reserve
  return room > 0n ? room : 0n
}

export function minAmountOut(amountOut: bigint, slippageBps: bigint = DEFAULT_SLIPPAGE_BPS): bigint {
  if (amountOut === 0n) return 0n
  return (amountOut * (10_000n - slippageBps)) / 10_000n
}

/** Pool gross output minus pool withdraw fee and final ledger transfer fee. */
export function netSwapOutput(grossOut: bigint, tokenOutFee: bigint): bigint {
  const fees = 2n * tokenOutFee
  return grossOut > fees ? grossOut - fees : 0n
}

/** Backend message when an open failed-swap escrow blocks a new attempt. */
export function isSwapRecoverError(message: string): boolean {
  return message.includes("Recover your previous failed swap")
}

export function swapRate(amountIn: bigint, amountOut: bigint): string | null {
  if (amountIn === 0n || amountOut === 0n) return null
  const scaled = (amountOut * 1_000_000n) / amountIn
  const whole = scaled / 1_000_000n
  const frac = (scaled % 1_000_000n).toString().padStart(6, "0").replace(/0+$/, "")
  return frac ? `${whole}.${frac}` : whole.toString()
}
