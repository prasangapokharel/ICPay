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

export function statsFromIcpswapRow(
  data: Record<string, unknown> | null | undefined
): IcpswapTokenStats | null {
  if (!data || data.price === null || data.price === undefined) return null
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
}

export type IcpswapListedToken = {
  ledgerId: string
  name: string
  symbol: string
  stats: IcpswapTokenStats
}

export function listedTokenFromAllRow(raw: unknown): IcpswapListedToken | null {
  if (!raw || typeof raw !== "object") return null
  const rec = raw as Record<string, unknown>
  const ledgerId = String(rec.tokenLedgerId ?? "").trim()
  if (!ledgerId) return null
  const stats = statsFromIcpswapRow(rec)
  if (!stats) return null
  const symbol = stats.tokenSymbol.trim() || "TOKEN"
  return {
    ledgerId,
    name: stats.tokenName.trim() || symbol,
    symbol,
    stats,
  }
}

export async function fetchIcpswapTokenAll(): Promise<IcpswapListedToken[]> {
  try {
    const res = await fetch("https://api.icpswap.com/info/token/all")
    if (!res.ok) return []
    const body = await res.json()
    const rows = Array.isArray(body?.data) ? body.data : []
    const out: IcpswapListedToken[] = []
    for (const row of rows) {
      const listed = listedTokenFromAllRow(row)
      if (listed) out.push(listed)
    }
    return out
  } catch {
    return []
  }
}

export async function fetchIcpswapTokenStats(ledgerId: string): Promise<IcpswapTokenStats | null> {
  try {
    const res = await fetch(`https://api.icpswap.com/info/token/${ledgerId}`)
    if (!res.ok) return null
    const body = await res.json()
    return statsFromIcpswapRow(body?.data as Record<string, unknown> | undefined)
  } catch {
    return null
  }
}
