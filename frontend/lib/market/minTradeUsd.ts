export const MIN_TRADE_USD = 1

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
