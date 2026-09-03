import { hasMoreWatchlistRows, takeWatchlistRows, WATCHLIST_PAGE_SIZE } from "../../lib/market/watchlistPage"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

const rows = Array.from({ length: 35 }, (_, i) => i)
assert(WATCHLIST_PAGE_SIZE === 20, "page size")
assert(takeWatchlistRows(rows, 1).length === 20, "first page")
assert(takeWatchlistRows(rows, 1)[19] === 19, "last of first")
assert(takeWatchlistRows(rows, 2)[0] === 20, "second page start")
assert(takeWatchlistRows(rows, 2).length === 15, "rest")
assert(hasMoreWatchlistRows(35, 1), "more after page 1")
assert(!hasMoreWatchlistRows(20, 1), "exact page")
console.log("watchlistPage ok")
