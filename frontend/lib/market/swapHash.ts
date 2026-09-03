import { explorerTxUrl } from "@/lib/wallet/utils"

export function truncateHash(value: string): string {
  const text = value.trim()
  if (text.length <= 12) return text
  return `${text.slice(0, 6)}…${text.slice(-4)}`
}

function usableBlock(blockIndex?: bigint | null): bigint | null {
  if (blockIndex == null) return null
  if (blockIndex <= 0n) return null
  return blockIndex
}

/** Prefer a real ledger block; otherwise show the trade/wallet id clearly. */
export function swapHashLabel(id: string, blockIndex?: bigint | null): string | null {
  const block = usableBlock(blockIndex)
  if (block != null) return block.toString()
  const text = id.trim()
  if (!text || text.startsWith("local-")) return null
  return text
}

export function swapHashHref(id: string, blockIndex?: bigint | null): string | null {
  const block = usableBlock(blockIndex)
  if (block != null) return explorerTxUrl(block)
  const text = id.trim()
  if (!text || text.startsWith("local-") || text.startsWith("trade-")) return null
  return `/transactions/${encodeURIComponent(text)}`
}
