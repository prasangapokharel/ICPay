import {
  filterMarketRows,
  heroMarketLists,
  marketHighlights,
  marketPageCount,
  pageMarketRows,
  pairVolume,
  sortDefaultsForChangeFilter,
  sortMarketRows,
  visiblePageItems,
} from "../../lib/market/overview"
import type { TerminalPairRow } from "../../services/market/tradePairSnapshot"

function row(symbol: string, vol: number, ch: number, tvl = 0): TerminalPairRow {
  return {
    baseLedgerId: symbol,
    hasPool: true,
    stats: {
      tokenName: symbol,
      tokenSymbol: symbol,
      priceUsd: 1,
      priceChange24h: ch,
      tvlUsd: tvl,
      tvlChange24h: 0,
      volume24hUsd: vol,
      volume7dUsd: vol,
      totalVolumeUsd: vol,
      txCount24h: vol,
      priceLow24h: 1,
      priceHigh24h: 1,
      priceLow7d: 1,
      priceHigh7d: 1,
    },
    base: {
      ledgerId: symbol,
      name: symbol,
      symbol,
      decimals: 8,
      fee: 0n,
      totalSupply: 0n,
      mintingAccount: null,
      supportedStandards: [],
      indexCanisterId: null,
      logoUrl: null,
    },
  }
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

const rows = [row("A", 10, 1, 5), row("B", 50, -2, 9), row("C", 20, 8, 1)]
assert(pairVolume(rows[1]!) === 50, "vol")
assert(sortMarketRows(rows, "volume", false)[0]?.base.symbol === "B", "sort vol")
assert(filterMarketRows(rows, "c", "all").length === 1, "search")
assert(filterMarketRows(rows, "", "up").length === 2, "gainers")
assert(pageMarketRows(rows, 1, 2).length === 2, "page")
assert(marketPageCount(21, 20) === 2, "pages")
assert(JSON.stringify(visiblePageItems(1, 3)) === "[1,2,3]", "few pages")
assert(visiblePageItems(5, 20)[0] === 1, "start")
assert(visiblePageItems(5, 20).includes("ellipsis"), "ellipsis")
assert(visiblePageItems(5, 20).at(-1) === 20, "end")
assert(marketHighlights(rows).gainers[0]?.base.symbol === "C", "top gainer")
const lists = heroMarketLists(rows, 2)
assert(lists.popular[0]?.base.symbol === "B", "popular by volume")
assert(lists.gainers[0]?.base.symbol === "C", "hero gainer")
assert(lists.losers[0]?.base.symbol === "B", "hero loser")
assert(sortDefaultsForChangeFilter("up")?.sortAsc === false, "gainers desc")
assert(sortDefaultsForChangeFilter("down")?.sortAsc === true, "losers asc")
assert(sortDefaultsForChangeFilter("all") === null, "all keeps prior")
assert(sortMarketRows(filterMarketRows(rows, "", "up"), "change", false)[0]?.base.symbol === "C", "gainer first")
assert(sortMarketRows(filterMarketRows(rows, "", "down"), "change", true)[0]?.base.symbol === "B", "loser first")
console.log("overview ok")
