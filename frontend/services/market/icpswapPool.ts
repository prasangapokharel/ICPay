export type IcpswapPool = {
  poolId: string
  poolFee: number
  token0LedgerId: string
  token0Symbol: string
  token1LedgerId: string
  token1Symbol: string
  tvlUSD: string
  tvlUSDChange24H: string
  volumeUSD24H: string
  volumeUSD7D: string
  txCount24H: string
  feesUSD24H: string
  priceLow24H: string
  priceHigh24H: string
  priceLow7D: string
  priceHigh7D: string
}

export type IcpswapPoolResponse = {
  code: number
  message: string | null
  data: IcpswapPool[]
}

const POOL_CACHE_TTL = 2 * 60_000 // 2 minutes
let poolCache: { at: number; data: IcpswapPool[] } | null = null

export async function fetchIcpswapPools(): Promise<IcpswapPool[]> {
  if (poolCache && Date.now() - poolCache.at < POOL_CACHE_TTL) {
    return poolCache.data
  }

  try {
    const res = await fetch('https://api.icpswap.com/info/pool/all')
    if (!res.ok) return []

    const body: IcpswapPoolResponse = await res.json()
    const pools = body.data || []

    poolCache = { at: Date.now(), data: pools }
    return pools
  } catch (err) {
    console.error('[icpswapPool] Failed to fetch pools:', err)
    return []
  }
}

export async function fetchPoolsByToken(tokenLedgerId: string): Promise<IcpswapPool[]> {
  const allPools = await fetchIcpswapPools()
  return allPools.filter(
    (pool) =>
      pool.token0LedgerId === tokenLedgerId || pool.token1LedgerId === tokenLedgerId
  )
}

export async function fetchPoolById(poolId: string): Promise<IcpswapPool | null> {
  const allPools = await fetchIcpswapPools()
  return allPools.find((pool) => pool.poolId === poolId) || null
}
