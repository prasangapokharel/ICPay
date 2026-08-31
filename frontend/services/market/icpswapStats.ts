export type IcpswapTokenStats = {
  tokenName: string
  tokenSymbol: string
  priceUsd: number
  priceChange24h: number
  tvlUsd: number
  tvlChange24h: number
  volume24hUsd: number
  volume7dUsd: number
  totalVolumeUsd: number
  txCount24h: number
  priceLow24h: number
  priceHigh24h: number
  priceLow7d: number
  priceHigh7d: number
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
      tokenName: String(data.tokenName ?? ""),
      tokenSymbol: String(data.tokenSymbol ?? ""),
      priceUsd: num(data.price),
      priceChange24h: num(data.priceChange24H),
      tvlUsd: num(data.tvlUSD),
      tvlChange24h: num(data.tvlUSDChange24H),
      volume24hUsd: num(data.volumeUSD24H),
      volume7dUsd: num(data.volumeUSD7D),
      totalVolumeUsd: num(data.totalVolumeUSD),
      txCount24h: num(data.txCount24H),
      priceLow24h: num(data.priceLow24H),
      priceHigh24h: num(data.priceHigh24H),
      priceLow7d: num(data.priceLow7D),
      priceHigh7d: num(data.priceHigh7D),
    }
  } catch {
    return null
  }
}
