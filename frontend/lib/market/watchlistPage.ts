export const WATCHLIST_PAGE_SIZE = 20

export function takeWatchlistRows<T>(rows: T[], page: number, pageSize = WATCHLIST_PAGE_SIZE): T[] {
  const p = Math.max(1, page)
  const start = (p - 1) * pageSize
  return rows.slice(start, start + pageSize)
}

export function hasMoreWatchlistRows(total: number, page: number, pageSize = WATCHLIST_PAGE_SIZE): boolean {
  return total > Math.max(1, page) * pageSize
}
