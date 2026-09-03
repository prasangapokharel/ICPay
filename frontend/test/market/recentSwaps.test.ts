import { mergeRecentSwaps } from "../../lib/market/recentSwaps"
import type { LocalFill } from "../../lib/market/tradeFillStore"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

const pair = {
  baseLedgerId: "gold",
  quoteLedgerId: "icp",
  base: { symbol: "GOLD", decimals: 8 },
  quote: { symbol: "ICP", decimals: 8 },
}

const local: LocalFill = {
  id: "trade-latest",
  isBuy: true,
  amount: 10n,
  ledgerId: "gold",
  symbol: "GOLD",
  decimals: 8,
  at: 9,
  status: "filled",
  blockIndex: 99n,
}

const empty = mergeRecentSwaps([local], [], pair)
assert(empty[0]?.id === "trade-latest", "persist when wallet empty")
assert(empty[0]?.blockIndex === 99n, "block kept")

const walletBoth = mergeRecentSwaps(
  [local],
  [
    {
      id: "in",
      txType: { swapIn: null },
      ledgerId: "gold",
      amount: 10n,
      createdAt: 9_000_000n,
      blockIndex: [99n],
    },
    {
      id: "out",
      txType: { swapOut: null },
      ledgerId: "icp",
      amount: 1n,
      createdAt: 8_000_000n,
      blockIndex: [99n],
    },
  ],
  pair
)
assert(walletBoth.length === 1, "one row per block")
assert(walletBoth[0]?.id === "in", "prefer wallet base leg")
assert(walletBoth[0]?.symbol === "GOLD", "base symbol")

const older = mergeRecentSwaps(
  [],
  [
    {
      id: "old",
      txType: { swapOut: null },
      ledgerId: "icp",
      amount: 2n,
      createdAt: 1_000_000n,
      blockIndex: [1n],
    },
  ],
  pair
)
assert(older[0]?.id === "old", "older wallet stays")

console.log("recentSwaps ok")
