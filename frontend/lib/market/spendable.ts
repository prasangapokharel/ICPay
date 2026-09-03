export function mergeSpendable(wallet?: bigint | null, trade?: bigint | null): bigint {
  return (wallet ?? 0n) + (trade ?? 0n)
}
