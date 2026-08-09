export type IcpTokenData = {
  symbol: string
  name: string
  decimals: number
  total_supply: string
  holder_count: number
  fee: string
  rank: number
  metrics: {
    price: { usd: number; icp: number }
    fully_diluted_market_cap: { usd: number; icp: number }
    volume: { usd: { "24h": number; "7d": number; "30d": number } }
    change: {
      "24h": { usd: number }
      "7d": { usd: number }
      "30d": { usd: number }
      "90d": { usd: number }
    }
    chartLast7Days: { USD: { name: string; price: number }[] }
  }
  details: { short_description: string; long_description: string | null }
  links: { id: number; url: string; link_type: { type: string; priority: number } }[]
}

const ENDPOINT = "https://icptokens.net/api/tokens/ryjl3-tyaaa-aaaaa-aaaba-cai"

export async function fetchIcpToken(): Promise<IcpTokenData> {
  const res = await fetch(ENDPOINT)
  if (!res.ok) throw new Error(`icptokens ${res.status}`)
  return res.json() as Promise<IcpTokenData>
}
