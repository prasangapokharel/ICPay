import {
  pickAvailableAssets,
  pickPortfolioAssets,
  mergePositionBalances,
  buildPortfolioAssetRows,
  tokenBalanceUsd,
  portfolioPnl24hUsd,
  AVAILABLE_ASSET_LIMIT,
} from "../../lib/market/availableAssets"
import type { TerminalPairRow } from "../../services/market/tradePairSnapshot"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

function row(id: string, pool: boolean, price = 0, change = 0): TerminalPairRow {
  return {
    baseLedgerId: id,
    hasPool: pool,
    stats:
      price > 0
        ? {
            tokenName: id,
            tokenSymbol: id,
            priceUsd: price,
            priceChange24h: change,
            tvlUsd: 0,
            tvlChange24h: 0,
            volume24hUsd: 0,
            volume7dUsd: 0,
            totalVolumeUsd: 0,
            txCount24h: 0,
            priceLow24h: 0,
            priceHigh24h: 0,
            priceLow7d: 0,
            priceHigh7d: 0,
          }
        : null,
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

const rows = [row("a", true), row("b", false), row("c", true), row("d", true)]
const picked = pickAvailableAssets(rows, 3)
assert(AVAILABLE_ASSET_LIMIT === 12, "limit")
assert(picked.map((item) => item.baseLedgerId).join() === "a,c,d", "pool only")
assert(!picked.some((item) => item.baseLedgerId === "b"), "skip no pool")
assert(pickAvailableAssets(rows, 2).length === 2, "cap")
assert(pickAvailableAssets([], 5).length === 0, "empty")
assert(pickAvailableAssets(rows, 0).length === 0, "zero limit")

const balances = new Map<string, bigint>([
  ["a", 1n],
  ["c", 0n],
])
assert(
  pickPortfolioAssets(rows, balances).map((item) => item.baseLedgerId).join() === "a",
  "positions"
)
const merged = mergePositionBalances([{ ledgerId: "a", balance: 2n }], new Map([["a", 3n], ["z", 1n]]))
assert(merged.get("a") === 5n && merged.get("z") === 1n, "merge")

assert(tokenBalanceUsd(100_000_000n, 8, 2) === 2, "value usd")
assert(portfolioPnl24hUsd(100, 10) === 10, "pnl +10%")
assert(portfolioPnl24hUsd(100, -5) === -5, "pnl -5%")
assert(portfolioPnl24hUsd(null, 10) === null, "pnl null value")

const priced = [row("a", true, 2, 10)]
const built = buildPortfolioAssetRows(priced, new Map([["a", 100_000_000n]]))
assert(built[0]?.valueUsd === 2, "built value")
assert(built[0]?.pnl24hUsd === 0.2, "built pnl")

console.log("availableAssets ok")
