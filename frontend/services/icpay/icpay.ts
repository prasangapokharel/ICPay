import type { Identity } from "@icp-sdk/core/agent"
import { fromNullable } from "@dfinity/utils"
import { fetchTokenMetadata, ICP_LEDGER_ID, ICPAY_LEDGER_ID } from "@/services/tokens"
import { icrcLedger } from "@/services/ledger/icrc"

export { ICPAY_LEDGER_ID }

// Market data comes from ICPSwap, the only venue ICPAY trades on, so its pool is
// the price. ICPSwap answers with CORS open under static export.
const STATS_URL = `https://api.icpswap.com/token/${ICPAY_LEDGER_ID}`

export const ICPAY_SWAP_URL = `https://app.icpswap.com/swap?input=${ICP_LEDGER_ID}&output=${ICPAY_LEDGER_ID}`
export const ICPAY_INFO_URL = `https://app.icpswap.com/info-tokens/details/${ICPAY_LEDGER_ID}`

// The management canister. It has no caller, so nothing can ever transfer out
// of it -- and in ICRC-1 a transfer *from* the minting account is what mints.
// A ledger that names it can therefore never issue new supply again.
export const NULL_MINTING_PRINCIPAL = "aaaaa-aa"

export type IcpayStats = {
  symbol: string
  name: string
  decimals: number
  fee: bigint
  logo?: string
  totalSupply: bigint
  // Read from the ledger rather than asserted, because the whole point is that
  // a holder can check it. Null when the ledger does not answer the call.
  mintingAccount: string | null
  // Null when the minting account is unknown -- absence of proof is not proof.
  supplyFixed: boolean | null
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
async function fetchLedgerFacts(
  identity?: Identity
): Promise<{ totalSupply: bigint; mintingAccount: string | null }> {
  const ledger = await icrcLedger(identity, ICPAY_LEDGER_ID)

  const [totalSupply, minting] = await Promise.all([
    ledger.totalTokensSupply({ certified: false }),
    ledger.getMintingAccount({ certified: false }).catch((): [] => []),
  ])
  const account = fromNullable(minting)

  return {
    totalSupply,
    mintingAccount: account?.owner.toText() ?? null,
  }
}

export async function fetchIcpayStats(identity?: Identity): Promise<IcpayStats> {
  const [metadata, ledger, market] = await Promise.all([
    fetchTokenMetadata(ICPAY_LEDGER_ID, identity),
    fetchLedgerFacts(identity),
    fetchMarket(),
  ])

  return {
    symbol: metadata?.symbol ?? "ICPAY",
    name: metadata?.name ?? "ICPay",
    decimals: metadata?.decimals ?? 8,
    fee: metadata?.fee ?? 0n,
    logo: metadata?.logo,
    totalSupply: ledger.totalSupply,
    mintingAccount: ledger.mintingAccount,
    supplyFixed:
      ledger.mintingAccount === null ? null : ledger.mintingAccount === NULL_MINTING_PRINCIPAL,
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
