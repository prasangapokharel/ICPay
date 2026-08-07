import { Actor, type Identity } from "@icp-sdk/core/agent"
import type { IDL } from "@icp-sdk/core/candid"
import { createAgent } from "@/services/icp"
import { fetchTokenMetadata, ICP_LEDGER_ID } from "@/services/tokens"

// ICPay's own token. Distinct from the wallet canister, which holds custody.
export const ICPAY_LEDGER_ID = "5fsnk-rqaaa-aaaan-q6m4q-cai"

// Market data comes from ICPSwap, the only venue ICPAY trades on, so its pool is
// the price. It is the one source that answers with CORS open to any origin --
// icptokens.net has no Access-Control-Allow-Origin, and under output "export"
// there is no server to proxy a request through.
const STATS_URL = `https://api.icpswap.com/token/${ICPAY_LEDGER_ID}`

export const ICPAY_SWAP_URL = `https://app.icpswap.com/swap?input=${ICP_LEDGER_ID}&output=${ICPAY_LEDGER_ID}`
export const ICPAY_INFO_URL = `https://app.icpswap.com/info-tokens/details/${ICPAY_LEDGER_ID}`

const supplyIdl: IDL.InterfaceFactory = ({ IDL }) =>
  IDL.Service({
    icrc1_total_supply: IDL.Func([], [IDL.Nat], ["query"]),
  })

export type IcpayStats = {
  symbol: string
  name: string
  decimals: number
  fee: bigint
  logo?: string
  totalSupply: bigint
  // Null when ICPSwap is unreachable. The supply and metadata above come from
  // the ledger, so the page still renders something true without a market.
  market: IcpayMarket | null
}

export type IcpayMarket = {
  priceUsd: number
  priceChange24h: number
  tvlUsd: number
  volume24hUsd: number
  txCount24h: number
  priceLow24h: number
  priceHigh24h: number
}

// ICPSwap quotes every figure as a decimal string to avoid float drift on the
// wire. A field that will not parse is treated as absent rather than as zero,
// which would read as "no liquidity" instead of "not quoted".
function num(value: unknown): number {
  const n = typeof value === "string" || typeof value === "number" ? Number(value) : NaN
  return Number.isFinite(n) ? n : 0
}

async function fetchMarket(): Promise<IcpayMarket | null> {
  try {
    const res = await fetch(STATS_URL)
    if (!res.ok) return null
    const { data } = await res.json()
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

// Supply and decimals are read from the ledger rather than from a listing site:
// the aggregators carry a stale figure, and a wrong supply makes the fully
// diluted value below it wrong too.
async function fetchTotalSupply(identity?: Identity): Promise<bigint> {
  const agent = await createAgent(identity)
  const ledger = Actor.createActor<{ icrc1_total_supply: () => Promise<bigint> }>(supplyIdl, {
    agent,
    canisterId: ICPAY_LEDGER_ID,
  })
  return ledger.icrc1_total_supply()
}

export async function fetchIcpayStats(identity?: Identity): Promise<IcpayStats> {
  const [metadata, totalSupply, market] = await Promise.all([
    fetchTokenMetadata(ICPAY_LEDGER_ID, identity),
    fetchTotalSupply(identity),
    fetchMarket(),
  ])

  return {
    symbol: metadata?.symbol ?? "ICPAY",
    name: metadata?.name ?? "ICPay",
    decimals: metadata?.decimals ?? 8,
    fee: metadata?.fee ?? 0n,
    logo: metadata?.logo,
    totalSupply,
    market,
  }
}

// Price times supply. ICPSwap leaves its own FDV field out of the single-token
// response, and computing it here keeps it consistent with the supply shown
// directly above it on the page.
export function fullyDilutedValue(stats: IcpayStats): number | null {
  if (!stats.market) return null
  return (Number(stats.totalSupply) / 10 ** stats.decimals) * stats.market.priceUsd
}
