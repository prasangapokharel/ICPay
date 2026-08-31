export type IcpswapTokenStats = {
  priceUsd: number
  priceChange24h: number
  tvlUsd: number
  volume24hUsd: number
  txCount24h: number
  priceLow24h: number
  priceHigh24h: number
}

function num(value: unknown): number {
  const n = typeof value === "string" || typeof value === "number" ? Number(value) : NaN
  return Number.isFinite(n) ? n : 0
}

export async function fetchIcpswapTokenStats(ledgerId: string): Promise<IcpswapTokenStats | null> {
  try {
    const res = await fetch(`https://api.icpswap.com/token/${ledgerId}`)
    if (!res.ok) return null
    const body = await res.json()
    const data = body?.data
    if (!data || typeof data.price !== "string") return null
    return {
      priceUsd: num(data.price),
      priceChange24h: num(data.priceChange24H),
      tvlUsd: num(data.tvlUSD),
      volume24hUsd: num(data.volumeUSD24H),
      txCount24h: num(data.txCount24H),
      priceLow24h: num(data.priceLow24H),
      priceHigh24h: num(data.priceHigh24H),
    }
  } catch {
    return null
  }
}
