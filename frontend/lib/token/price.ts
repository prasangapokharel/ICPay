export function tokenUsdValue(
  amount: bigint,
  decimals: number,
  priceUsd: number | undefined
): number | null {
  if (priceUsd === undefined || amount <= 0n) return null
  return (Number(amount) / 10 ** decimals) * priceUsd
}
