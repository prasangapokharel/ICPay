import type { TxTypeVariant } from "@/services/types"
import type { FillStatus, LocalFill } from "@/lib/market/tradeFillStore"

export type WalletSwapTx = {
  id: string
  txType: TxTypeVariant
  ledgerId: string
  amount: bigint
  createdAt: bigint
  blockIndex: [] | [bigint]
}

export type SwapPairMeta = {
  baseLedgerId: string
  quoteLedgerId: string
  base: { symbol: string; decimals: number }
  quote: { symbol: string; decimals: number }
}

export type RecentSwapRow = {
  id: string
  isBuy: boolean
  amount: bigint
  symbol: string
  decimals: number
  at: number
  status: FillStatus
  blockIndex: bigint | null
}

function isSwap(txType: TxTypeVariant): boolean {
  return "swapIn" in txType || "swapOut" in txType
}

function onPair(ledgerId: string, pair: SwapPairMeta): boolean {
  return ledgerId === pair.baseLedgerId || ledgerId === pair.quoteLedgerId
}

function walletRow(tx: WalletSwapTx, pair: SwapPairMeta): RecentSwapRow {
  const isBase = tx.ledgerId === pair.baseLedgerId
  return {
    id: tx.id,
    isBuy: "swapIn" in tx.txType,
    amount: tx.amount,
    symbol: isBase ? pair.base.symbol : pair.quote.symbol,
    decimals: isBase ? pair.base.decimals : pair.quote.decimals,
    at: Number(tx.createdAt / 1_000_000n),
    status: "filled",
    blockIndex: tx.blockIndex[0] ?? null,
  }
}

function localRow(fill: LocalFill): RecentSwapRow {
  return {
    id: fill.id,
    isBuy: fill.isBuy,
    amount: fill.amount,
    symbol: fill.symbol,
    decimals: fill.decimals,
    at: fill.at,
    status: fill.status,
    blockIndex: fill.blockIndex ?? null,
  }
}

function collapseWallet(rows: RecentSwapRow[], baseLedgerSymbol: string): RecentSwapRow[] {
  const byBlock = new Map<string, RecentSwapRow>()
  const rest: RecentSwapRow[] = []
  for (const row of rows) {
    if (row.blockIndex == null) {
      rest.push(row)
      continue
    }
    const key = row.blockIndex.toString()
    const prev = byBlock.get(key)
    if (!prev) {
      byBlock.set(key, row)
      continue
    }
    const prefer = row.symbol === baseLedgerSymbol && prev.symbol !== baseLedgerSymbol
    if (prefer) byBlock.set(key, row)
  }
  return [...byBlock.values(), ...rest]
}

export function mergeRecentSwaps(
  fills: LocalFill[],
  txs: WalletSwapTx[],
  pair: SwapPairMeta,
  limit = 20
): RecentSwapRow[] {
  const mapped = txs
    .filter((tx) => isSwap(tx.txType) && onPair(tx.ledgerId, pair))
    .map((tx) => walletRow(tx, pair))
  const walletRows = collapseWallet(mapped, pair.base.symbol)
  const pendingKeys = new Set(
    fills
      .filter((row) => row.status !== "filled")
      .map((row) => `${row.isBuy}:${row.amount.toString()}`)
  )
  const usedBlocks = new Set<string>()
  const usedIds = new Set<string>()
  const out: RecentSwapRow[] = []

  for (const fill of fills) {
    const row = localRow(fill)
    const blockKey = row.blockIndex?.toString()
    const walletHas = blockKey
      ? walletRows.some((w) => w.blockIndex === row.blockIndex)
      : walletRows.some((w) => w.id === row.id)
    if (walletHas && row.status === "filled") continue
    out.push(row)
    usedIds.add(row.id)
    if (blockKey) usedBlocks.add(blockKey)
  }

  for (const row of walletRows) {
    const blockKey = row.blockIndex?.toString()
    if (usedIds.has(row.id)) continue
    if (blockKey && usedBlocks.has(blockKey)) continue
    if (pendingKeys.has(`${row.isBuy}:${row.amount.toString()}`)) continue
    out.push(row)
    usedIds.add(row.id)
    if (blockKey) usedBlocks.add(blockKey)
  }

  return out.slice(0, limit)
}
