import { createAgent } from "@/services/icp"
import {
  ICP_LEDGER_ID,
  ICPAY_LEDGER_ID,
  PINNED_LEDGER_IDS,
} from "@/services/tokens"
import { icrcTransferFee } from "@/services/ledger/icrc"
import { quoteIcpswapPool, resolveIcpswapPool, type IcpswapPoolRef } from "@/lib/swap/icpswap"
import { TERMINAL_EXTRA_BASES, TERMINAL_QUOTE_LEDGER_ID } from "@/lib/market/tradePairs"
import { fetchIcpswapTokenStats, type IcpswapTokenStats } from "@/services/market/icpswapStats"
import {
  fetchIcrcLedgerFacts,
  isSupplyFixed,
  type IcrcLedgerFacts,
} from "@/services/market/icrcLedgerFacts"

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
}

const UNIT_IN = 100_000_000n

function baseLedgerIds(): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of [...PINNED_LEDGER_IDS, ...TERMINAL_EXTRA_BASES]) {
    if (id === ICP_LEDGER_ID || id === ICPAY_LEDGER_ID) continue
    if (!seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  return out
}

export async function fetchTerminalPairs(): Promise<TerminalPairRow[]> {
  const agent = await createAgent(undefined)
  const ids = baseLedgerIds()

  const rows = await Promise.all(
    ids.map(async (baseLedgerId): Promise<TerminalPairRow | null> => {
      const [base, stats] = await Promise.all([
        fetchIcrcLedgerFacts(baseLedgerId),
        fetchIcpswapTokenStats(baseLedgerId),
      ])
      if (!base) return null

      let hasPool = false
      try {
        await resolveIcpswapPool(agent, baseLedgerId, TERMINAL_QUOTE_LEDGER_ID)
        hasPool = true
      } catch {
        hasPool = false
      }

      if (!hasPool && !stats) return null

      return { baseLedgerId, base, stats, hasPool }
    })
  )

  return rows
    .filter((r): r is TerminalPairRow => r !== null)
    .sort((a, b) => {
      const volA = a.stats?.volume24hUsd ?? 0
      const volB = b.stats?.volume24hUsd ?? 0
      if (volA !== volB) return volB - volA
      return a.base.symbol.localeCompare(b.base.symbol)
    })
}

export async function fetchTradePairSnapshot(baseLedgerId: string): Promise<TradePairSnapshot> {
  const quoteLedgerId = TERMINAL_QUOTE_LEDGER_ID
  const agent = await createAgent(undefined)

  const [base, quote, stats] = await Promise.all([
    fetchIcrcLedgerFacts(baseLedgerId),
    fetchIcrcLedgerFacts(quoteLedgerId),
    fetchIcpswapTokenStats(baseLedgerId),
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
    const feeIn = await icrcTransferFee(undefined, baseLedgerId, base.fee)
    const amountIn = UNIT_IN > feeIn ? UNIT_IN - feeIn : 0n
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
  }
}
