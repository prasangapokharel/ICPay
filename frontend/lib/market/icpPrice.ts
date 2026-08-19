export type IcpPrice = {
  usd: number
  change24h: number
  marketCap: number
  volume24h: number
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  })
}

// Micro-balances (a fraction of a cent) must not collapse to "$0.00", which
// reads as "worthless". Sub-cent values show extra precision instead.
export function formatUsdPrecise(value: number): string {
  if (value > 0 && value < 0.01) {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumSignificantDigits: 3,
    })
  }
  return formatUsd(value)
}
