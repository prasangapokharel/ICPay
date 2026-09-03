import { createAgent } from "@/services/icp"
import { ICP_LEDGER_ID, ICPAY_LEDGER_ID } from "@/services/tokens"
import { quoteIcpswapPool, resolveIcpswapPool, type IcpswapPoolRef } from "@/lib/swap/icpswap"
import { TERMINAL_QUOTE_LEDGER_ID } from "@/lib/market/tradePairs"
import {
  fetchIcpswapTokenStats,
  type IcpswapTokenStats,
} from "@/services/market/icpswapStats"
import {
  fetchEnhancedTokenFacts,
  isSupplyFixed,
  type IcrcLedgerFacts,
} from "@/services/market/icrcLedgerFacts"
import {
  fetchIcrcTokens,
  fetchIcrcTokenDetail,
  icrcPercentChange24h,
  type IcrcApiToken,
} from "@/services/market/icrcApi"
import { fetchIcpswapTokenAll } from "@/services/market/icpswapStats"
import { rememberTokenLogo } from "@/lib/market/tokenLogo"

export type TerminalPairRow = {
  baseLedgerId: string
  base: IcrcLedgerFacts
  stats: IcpswapTokenStats | null
  hasPool: boolean
}

export type TradePairSnapshot = {
  baseLedgerId: string
  quoteLedgerId: string
  base: IcrcLedgerFacts
  quote: IcrcLedgerFacts
  pool: IcpswapPoolRef | null
  stats: IcpswapTokenStats | null
  supplyFixed: boolean | null
  /** Quote token received per 1 base token (human units). */
  spotRate: number | null
  /** On-chain quote for 1 base unit (smallest units in → gross out). */
  unitQuoteOut: bigint | null
  priceInIcp: number | null
  tokenType?: string
  holders?: number
  holdersChange24h?: number
  transactions7d?: number
  volume7d?: number
  circulatingSupply?: string
  maxSupply?: string
  fdv?: number
  urls?: {
    website?: string[]
    twitter?: string[]
    explorer?: string[]
    source_code?: string[]
    chat?: string[]
    announcement?: string[]
  }
}

function factsFromIcrcApi(token: IcrcApiToken): IcrcLedgerFacts {
  const logoUrl = token.icrc1_metadata.icrc1_logo || null
  if (logoUrl) rememberTokenLogo(token.ledger_canister_id, logoUrl)

  return {
    ledgerId: token.ledger_canister_id,
    name: token.icrc1_metadata.icrc1_name,
    symbol: token.icrc1_metadata.icrc1_symbol,
    decimals: parseInt(token.icrc1_metadata.icrc1_decimals, 10),
    fee: BigInt(token.icrc1_metadata.icrc1_fee),
    totalSupply: BigInt(token.icrc1_metadata.icrc1_total_supply),
    mintingAccount: null,
    supportedStandards: [],
    indexCanisterId: null,
    logoUrl,
  }
}

export async function fetchTerminalPairs(): Promise<TerminalPairRow[]> {
  const [tokens, listed] = await Promise.all([
    fetchIcrcTokens({ limit: 500, hasTransactions: true }),
    fetchIcpswapTokenAll(),
  ])
  const poolByLedger = new Map(listed.map((row) => [row.ledgerId, row]))

  return tokens
    .filter((t) => t.ledger_canister_id !== ICP_LEDGER_ID && t.ledger_canister_id !== ICPAY_LEDGER_ID)
    .map((t) => {
      const base = factsFromIcrcApi(t)
      const pool = poolByLedger.get(t.ledger_canister_id)
      const tv = t.token_value

      const stats: IcpswapTokenStats | null =
        pool?.stats ??
        (tv
          ? {
              tokenName: t.icrc1_metadata.icrc1_name,
              tokenSymbol: t.icrc1_metadata.icrc1_symbol,
              priceUsd: tv.price_usd,
              priceChange24h: icrcPercentChange24h(tv),
              tvlUsd: 0,
              tvlChange24h: 0,
              volume24hUsd: tv.volume_24h_usd,
              volume7dUsd: tv.volume_7d_usd,
              totalVolumeUsd: 0,
              txCount24h: 0,
              priceLow24h: 0,
              priceHigh24h: 0,
              priceLow7d: 0,
              priceHigh7d: 0,
            }
          : null)

      return {
        baseLedgerId: t.ledger_canister_id,
        base,
        stats,
        hasPool: Boolean(pool),
      }
    })
    .sort((a, b) => {
      const volA = a.stats?.volume24hUsd ?? a.stats?.volume7dUsd ?? 0
      const volB = b.stats?.volume24hUsd ?? b.stats?.volume7dUsd ?? 0
      if (volA !== volB) return volB - volA
      return a.base.symbol.localeCompare(b.base.symbol)
    })
}

export async function fetchTradePairSnapshot(
  baseLedgerId: string,
  cachedStats?: IcpswapTokenStats | null
): Promise<TradePairSnapshot> {
  const quoteLedgerId = TERMINAL_QUOTE_LEDGER_ID
  const agent = await createAgent(undefined)

  const [base, quote, stats, icrcDetail] = await Promise.all([
    fetchEnhancedTokenFacts(baseLedgerId),
    fetchEnhancedTokenFacts(quoteLedgerId),
    cachedStats ? Promise.resolve(cachedStats) : fetchIcpswapTokenStats(baseLedgerId),
    fetchIcrcTokenDetail(baseLedgerId),
  ])

  if (!base || !quote) {
    throw new Error("Failed to load ICRC ledger metadata for this pair")
  }

  let pool: IcpswapPoolRef | null = null
  let unitQuoteOut: bigint | null = null
  let spotRate: number | null = null
  let priceInIcp: number | null = null

  try {
    pool = await resolveIcpswapPool(agent, baseLedgerId, quoteLedgerId)
    const unitIn = 10n ** BigInt(Math.max(0, base.decimals))
    const amountIn = unitIn > base.fee ? unitIn - base.fee : 0n
    if (amountIn > 0n) {
      const grossOut = await quoteIcpswapPool(agent, pool, amountIn)
      unitQuoteOut = grossOut
      if (grossOut > 0n) {
        const inHuman = Number(amountIn) / 10 ** base.decimals
        const outHuman = Number(grossOut) / 10 ** quote.decimals
        spotRate = inHuman > 0 ? outHuman / inHuman : null
        priceInIcp = spotRate
      }
    }
  } catch {
    pool = null
  }

  if (base.logoUrl) rememberTokenLogo(baseLedgerId, base.logoUrl)

  return {
    baseLedgerId,
    quoteLedgerId,
    base,
    quote,
    pool,
    stats,
    supplyFixed: isSupplyFixed(base.mintingAccount),
    spotRate,
    unitQuoteOut,
    priceInIcp,
    tokenType: icrcDetail?.token_type,
    holders: icrcDetail?.unique_owners_count,
    holdersChange24h: icrcDetail?.unique_owners_count_change_24h,
    transactions7d: icrcDetail?.total_transactions_count_over_past_7d,
    volume7d: icrcDetail?.total_volume_over_past_7d ? parseFloat(icrcDetail.total_volume_over_past_7d) : undefined,
    circulatingSupply: icrcDetail?.circulating_supply,
    maxSupply: icrcDetail?.max_supply,
    fdv: icrcDetail?.token_value?.fdv_usd,
    urls: icrcDetail?.urls || undefined,
  }
}
