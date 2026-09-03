import type { TerminalPairRow } from "@/services/market/tradePairSnapshot"

export const MARKET_PAGE_SIZE = 20

export type MarketSortKey = "name" | "price" | "change" | "volume" | "tvl"
export type MarketChangeFilter = "all" | "up" | "down"

/** Gainers → highest % first; Losers → worst % first; All → keep volume default. */
export function sortDefaultsForChangeFilter(
  change: MarketChangeFilter
): { sortKey: MarketSortKey; sortAsc: boolean } | null {
  if (change === "up") return { sortKey: "change", sortAsc: false }
  if (change === "down") return { sortKey: "change", sortAsc: true }
  return null
}

export function pairVolume(row: TerminalPairRow): number {
  return row.stats?.volume24hUsd || row.stats?.volume7dUsd || 0
}

export function pairTvl(row: TerminalPairRow): number {
  return row.stats?.tvlUsd || 0
}

export function filterMarketRows(
  rows: TerminalPairRow[],
  query: string,
  change: MarketChangeFilter
): TerminalPairRow[] {
  const q = query.trim().toLowerCase()
  return rows.filter((row) => {
    if (q) {
      const hit =
        row.base.symbol.toLowerCase().includes(q) || row.base.name.toLowerCase().includes(q)
      if (!hit) return false
    }
    const ch = row.stats?.priceChange24h ?? 0
    if (change === "up") return ch > 0
    if (change === "down") return ch < 0
    return true
  })
}

export function sortMarketRows(
  rows: TerminalPairRow[],
  key: MarketSortKey,
  asc: boolean
): TerminalPairRow[] {
  const dir = asc ? 1 : -1
  return [...rows].sort((a, b) => {
    if (key === "name") return dir * a.base.symbol.localeCompare(b.base.symbol)
    if (key === "price") return dir * ((a.stats?.priceUsd ?? 0) - (b.stats?.priceUsd ?? 0))
    if (key === "change") {
      return dir * ((a.stats?.priceChange24h ?? 0) - (b.stats?.priceChange24h ?? 0))
    }
    if (key === "tvl") return dir * (pairTvl(a) - pairTvl(b))
    return dir * (pairVolume(a) - pairVolume(b))
  })
}

export function pageMarketRows<T>(rows: T[], page: number, pageSize = MARKET_PAGE_SIZE): T[] {
  const p = Math.max(1, page)
  const start = (p - 1) * pageSize
  return rows.slice(start, start + pageSize)
}

export function marketPageCount(total: number, pageSize = MARKET_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize))
}

export type PageItem = number | "ellipsis"

export function visiblePageItems(current: number, total: number): PageItem[] {
  const pages = Math.max(1, total)
  const page = Math.min(Math.max(1, current), pages)
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  const items: PageItem[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pages - 1, page + 1)
  if (start > 2) items.push("ellipsis")
  for (let n = start; n <= end; n++) items.push(n)
  if (end < pages - 1) items.push("ellipsis")
  items.push(pages)
  return items
}

export function heroMarketLists(rows: TerminalPairRow[], limit = 5) {
  return {
    popular: sortMarketRows(rows, "volume", false).slice(0, limit),
    gainers: sortMarketRows(filterMarketRows(rows, "", "up"), "change", false).slice(0, limit),
    losers: sortMarketRows(filterMarketRows(rows, "", "down"), "change", true).slice(0, limit),
  }
}

export function marketHighlights(rows: TerminalPairRow[]) {
  const byVol = [...rows].sort((a, b) => pairVolume(b) - pairVolume(a))
  const byGain = [...rows].sort(
    (a, b) => (b.stats?.priceChange24h ?? -Infinity) - (a.stats?.priceChange24h ?? -Infinity)
  )
  const byTvl = [...rows].sort((a, b) => pairTvl(b) - pairTvl(a))
  const byVol7d = [...rows].sort(
    (a, b) => (b.stats?.volume7dUsd ?? 0) - (a.stats?.volume7dUsd ?? 0)
  )
  return {
    hot: byVol.slice(0, 3),
    gainers: byGain.slice(0, 3),
    volume: byVol7d.slice(0, 3),
    activity: byVol.slice(0, 3),
    liquidity: byTvl.slice(0, 3),
  }
}
