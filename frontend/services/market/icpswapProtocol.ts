export type IcpswapProtocolStats = {
  volumeUsd: number
  volumeUsd24h: number
  feesUsd: number
  txCount: number
  tvlUsd: number
  totalTradingPairs: number
  totalUsers: number
}

function num(value: unknown): number {
  const n = typeof value === "string" || typeof value === "number" ? Number(value) : NaN
  return Number.isFinite(n) ? n : 0
}

export async function fetchIcpswapProtocolStats(): Promise<IcpswapProtocolStats | null> {
  try {
    const res = await fetch("https://api.icpswap.com/info/global/protocol")
    if (!res.ok) return null
    const body = await res.json()
    const data = body?.data
    if (!data || typeof data !== "object") return null
    return {
      volumeUsd: num(data.volumeUSD),
      volumeUsd24h: num(data.volumeUSD24H),
      feesUsd: num(data.feesUSD),
      txCount: num(data.txCount),
      tvlUsd: num(data.tvlUSD),
      totalTradingPairs: num(data.totalTradingPairs),
      totalUsers: num(data.totalUsers),
    }
  } catch {
    return null
  }
}
