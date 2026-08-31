import { createAgent } from "@/services/icp"
import { fetchTokenMetadata } from "@/services/tokens"
import { icrcTransferFee } from "@/services/ledger/icrc"
import { quoteIcpswapPool, resolveIcpswapPool } from "@/lib/swap/icpswap"
import { TERMINAL_QUOTE_LEDGER_ID } from "@/lib/market/tradePairs"
import { fetchIcpswapTokenStats, type IcpswapTokenStats } from "@/services/market/icpswapStats"

export type TradePairSnapshot = {
  baseLedgerId: string
  quoteLedgerId: string
  baseSymbol: string
  quoteSymbol: string
  baseDecimals: number
  quoteDecimals: number
  poolId: string | null
  poolFeeTier: number | null
  stats: IcpswapTokenStats | null
  /** How much quote token you get for 1 base unit (human-scale). */
  spotRate: number | null
  sampleQuoteOut: bigint | null
  sampleAmountIn: bigint
}

const SAMPLE_IN = 100_000_000n

export async function fetchTradePairSnapshot(baseLedgerId: string): Promise<TradePairSnapshot> {
  const quoteLedgerId = TERMINAL_QUOTE_LEDGER_ID
  const agent = await createAgent(undefined)

  const [baseMeta, quoteMeta, stats] = await Promise.all([
    fetchTokenMetadata(baseLedgerId),
    fetchTokenMetadata(quoteLedgerId),
    fetchIcpswapTokenStats(baseLedgerId),
  ])

  const baseSymbol = baseMeta?.symbol ?? "TOKEN"
  const quoteSymbol = quoteMeta?.symbol ?? "ICP"
  const baseDecimals = baseMeta?.decimals ?? 8
  const quoteDecimals = quoteMeta?.decimals ?? 8

  let poolId: string | null = null
  let poolFeeTier: number | null = null
  let sampleQuoteOut: bigint | null = null
  let spotRate: number | null = null

  try {
    const pool = await resolveIcpswapPool(agent, baseLedgerId, quoteLedgerId)
    poolId = pool.poolId
    poolFeeTier = pool.fee

    const [feeIn, grossOut] = await Promise.all([
      icrcTransferFee(undefined, baseLedgerId),
      quoteIcpswapPool(agent, pool, SAMPLE_IN),
    ])

    const amountIn = SAMPLE_IN > feeIn ? SAMPLE_IN - feeIn : 0n
    if (amountIn > 0n) {
      sampleQuoteOut = grossOut
      if (grossOut > 0n) {
        const inHuman = Number(amountIn) / 10 ** baseDecimals
        const outHuman = Number(grossOut) / 10 ** quoteDecimals
        spotRate = inHuman > 0 ? outHuman / inHuman : null
      }
    }
  } catch {
    poolId = null
  }

  return {
    baseLedgerId,
    quoteLedgerId,
    baseSymbol,
    quoteSymbol,
    baseDecimals,
    quoteDecimals,
    poolId,
    poolFeeTier,
    stats,
    spotRate,
    sampleQuoteOut,
    sampleAmountIn: SAMPLE_IN,
  }
}
