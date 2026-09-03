import { pickMarqueePairs, MARQUEE_PAIR_LIMIT } from "../../lib/market/marqueePairs"
import type { TerminalPairRow } from "../../services/market/tradePairSnapshot"
import type { IcpswapTokenStats } from "../../services/market/icpswapStats"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

function stats(priceUsd: number): IcpswapTokenStats {
  return {
    tokenName: "t",
    tokenSymbol: "T",
    priceUsd,
    priceChange24h: 0,
    tvlUsd: 1,
    tvlChange24h: 0,
    volume24hUsd: 1,
    volume7dUsd: 1,
    totalVolumeUsd: 1,
    txCount24h: 1,
    priceLow24h: priceUsd,
    priceHigh24h: priceUsd,
    priceLow7d: priceUsd,
    priceHigh7d: priceUsd,
  }
}

function row(id: string, opts: { pool: boolean; price: number | null }): TerminalPairRow {
  return {
    baseLedgerId: id,
    hasPool: opts.pool,
    stats: opts.price === null ? null : stats(opts.price),
    base: {
      ledgerId: id,
      name: id,
      symbol: id,
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

const rows = [
  row("a", { pool: true, price: 1 }),
  row("b", { pool: false, price: 2 }),
  row("c", { pool: true, price: 0 }),
  row("d", { pool: true, price: null }),
  row("e", { pool: true, price: 3 }),
]
const picked = pickMarqueePairs(rows, 10)
assert(MARQUEE_PAIR_LIMIT === 24, "limit const")
assert(picked.map((r) => r.baseLedgerId).join() === "a,e", "listed with price")
assert(pickMarqueePairs(rows, 1).length === 1, "cap")
assert(pickMarqueePairs([], 5).length === 0, "empty")
console.log("marqueePairs ok")
