import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { CmcCanister } from "@icp-sdk/canisters/cmc"
import type { IcpPrice } from "@/lib/market/icpPrice"
import { createAgent } from "@/services/icp"
import { CMC_CANISTER_ID, icpUsdFromCyclesRate } from "@/services/chainkey/constants"

const COINGECKO_ICP_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true"

const COINGECKO_XDR_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=special-drawing-rights&vs_currencies=usd"

async function fetchXdrUsd(): Promise<number> {
  const res = await fetch(COINGECKO_XDR_URL)
  if (!res.ok) throw new Error(String(res.status))
  const json = await res.json()
  const usd = json?.["special-drawing-rights"]?.usd
  if (typeof usd !== "number") throw new Error("xdr")
  return usd
}

async function fetchCoinGeckoIcp(): Promise<IcpPrice> {
  const res = await fetch(COINGECKO_ICP_URL)
  if (!res.ok) throw new Error(String(res.status))
  const json = await res.json()
  const row = json?.["internet-computer"]
  if (typeof row?.usd !== "number") throw new Error("icp")
  return {
    usd: row.usd,
    change24h: row.usd_24h_change ?? 0,
    marketCap: row.usd_market_cap ?? 0,
    volume24h: row.usd_24h_vol ?? 0,
  }
}

export async function fetchIcpPrice(identity?: Identity): Promise<IcpPrice> {
  try {
    const agent = await createAgent(identity)
    const cmc = CmcCanister.create({
      agent,
      canisterId: Principal.fromText(CMC_CANISTER_ID),
    })
    const [cyclesPerIcp, xdrUsd, market] = await Promise.all([
      cmc.getIcpToCyclesConversionRate({ certified: false }),
      fetchXdrUsd().catch(() => 1.35),
      fetchCoinGeckoIcp().catch(() => null),
    ])
    const usd = icpUsdFromCyclesRate(cyclesPerIcp, xdrUsd)
    return {
      usd,
      change24h: market?.change24h ?? 0,
      marketCap: market?.marketCap ?? 0,
      volume24h: market?.volume24h ?? 0,
    }
  } catch {
    return fetchCoinGeckoIcp()
  }
}
