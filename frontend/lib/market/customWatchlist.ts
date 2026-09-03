import type { TerminalPairRow } from "@/services/market/tradePairSnapshot"
import type { IcpswapTokenStats } from "@/services/market/icpswapStats"

export const CUSTOM_WATCHLIST_KEY = "icpay:market-custom-watchlist"
export const CUSTOM_WATCHLIST_EVENT = "icpay-market-custom-watchlist"

type StoredCustomRow = {
  baseLedgerId: string
  name: string
  symbol: string
  decimals: number
  fee: string
  totalSupply: string
  logoUrl: string | null
  hasPool: boolean
  stats: IcpswapTokenStats | null
}

export function upsertCustomWatchlist(
  rows: TerminalPairRow[],
  row: TerminalPairRow
): TerminalPairRow[] {
  const rest = rows.filter((item) => item.baseLedgerId !== row.baseLedgerId)
  return [row, ...rest]
}

export function mergeWatchlistRows(
  listed: TerminalPairRow[],
  custom: TerminalPairRow[]
): TerminalPairRow[] {
  const seen = new Set(custom.map((row) => row.baseLedgerId))
  return [...custom, ...listed.filter((row) => !seen.has(row.baseLedgerId))]
}

export function pinWatchlistRows<T extends { baseLedgerId: string }>(
  rows: T[],
  pinnedIds: Iterable<string>
): T[] {
  const pinned = new Set(pinnedIds)
  if (pinned.size === 0) return rows
  const head: T[] = []
  const rest: T[] = []
  for (const row of rows) {
    if (pinned.has(row.baseLedgerId)) head.push(row)
    else rest.push(row)
  }
  return [...head, ...rest]
}

function toStored(row: TerminalPairRow): StoredCustomRow {
  return {
    baseLedgerId: row.baseLedgerId,
    name: row.base.name,
    symbol: row.base.symbol,
    decimals: row.base.decimals,
    fee: row.base.fee.toString(),
    totalSupply: row.base.totalSupply.toString(),
    logoUrl: row.base.logoUrl,
    hasPool: row.hasPool,
    stats: row.stats,
  }
}

function fromStored(row: StoredCustomRow): TerminalPairRow | null {
  if (!row.baseLedgerId || !row.symbol) return null
  let fee = 0n
  let totalSupply = 0n
  try {
    fee = BigInt(row.fee || "0")
    totalSupply = BigInt(row.totalSupply || "0")
  } catch {
    return null
  }
  return {
    baseLedgerId: row.baseLedgerId,
    hasPool: Boolean(row.hasPool),
    stats: row.stats ?? null,
    base: {
      ledgerId: row.baseLedgerId,
      name: row.name || row.symbol,
      symbol: row.symbol,
      decimals: Number.isFinite(row.decimals) ? row.decimals : 8,
      fee,
      totalSupply,
      mintingAccount: null,
      supportedStandards: [],
      indexCanisterId: null,
      logoUrl: row.logoUrl ?? null,
    },
  }
}

export function parseCustomWatchlist(raw: string): TerminalPairRow[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => fromStored(item as StoredCustomRow))
      .filter((row): row is TerminalPairRow => row != null)
  } catch {
    return []
  }
}

export function getCustomWatchlistSnapshot(): string {
  if (typeof window === "undefined") return "[]"
  return sessionStorage.getItem(CUSTOM_WATCHLIST_KEY) ?? "[]"
}

export function getCustomWatchlistServerSnapshot(): string {
  return "[]"
}

export function subscribeCustomWatchlist(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  window.addEventListener(CUSTOM_WATCHLIST_EVENT, onStoreChange)
  return () => window.removeEventListener(CUSTOM_WATCHLIST_EVENT, onStoreChange)
}

export function loadCustomWatchlist(): TerminalPairRow[] {
  return parseCustomWatchlist(getCustomWatchlistSnapshot())
}

export function saveCustomWatchlist(rows: TerminalPairRow[]): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(CUSTOM_WATCHLIST_KEY, JSON.stringify(rows.map(toStored)))
    window.dispatchEvent(new Event(CUSTOM_WATCHLIST_EVENT))
  } catch {
    // Quota / private mode must not break the terminal.
  }
}
