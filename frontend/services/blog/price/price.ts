import {
  fetchIcrcTokenDetail,
  fetchIcrcTokenValues,
  icrcPercentChange24h,
} from "@/services/market/icrcApi"

const ICP_LEDGER = "ryjl3-tyaaa-aaaaa-aaaba-cai"

export type IcpTokenData = {
  symbol: string
  name: string
  decimals: number
  total_supply: string
  holder_count: number
  fee: string
  metrics: {
    price: { usd: number }
    fully_diluted_market_cap: { usd: number }
    volume: { usd: { "24h": number; "7d": number } }
    change: { "24h": { usd: number } }
    chartLast7Days: { USD: { name: string; price: number }[] }
  }
}

export async function fetchIcpToken(): Promise<IcpTokenData> {
  const end = Math.floor(Date.now() / 1000)
  const start = end - 7 * 24 * 60 * 60
  const [detail, values] = await Promise.all([
    fetchIcrcTokenDetail(ICP_LEDGER),
    fetchIcrcTokenValues(ICP_LEDGER, start, end, 200),
  ])
  if (!detail?.token_value) throw new Error("icrc ICP detail unavailable")

  const tv = detail.token_value
  const decimals = Number(detail.icrc1_metadata.icrc1_decimals || 8)
  const chart = values.map((point) => ({
    name: new Date(point.timestamp * 1000).toISOString(),
    price: point.price_usd,
  }))

  return {
    symbol: detail.icrc1_metadata.icrc1_symbol,
    name: detail.icrc1_metadata.icrc1_name,
    decimals,
    total_supply: detail.icrc1_metadata.icrc1_total_supply,
    holder_count: detail.unique_owners_count ?? 0,
    fee: detail.icrc1_metadata.icrc1_fee,
    metrics: {
      price: { usd: tv.price_usd },
      fully_diluted_market_cap: { usd: tv.fdv_usd },
      volume: { usd: { "24h": tv.volume_24h_usd, "7d": tv.volume_7d_usd } },
      change: { "24h": { usd: icrcPercentChange24h(tv) } },
      chartLast7Days: { USD: chart },
    },
  }
}
