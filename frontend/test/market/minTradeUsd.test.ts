import {
  estimateTradeIcpValue,
  meetsMinTrade,
  meetsMinTradeIcp,
  meetsMinTradeUsd,
  MIN_TRADE_ICP,
  MIN_TRADE_ICP_E8S,
  MIN_TRADE_USD,
  tokenAmountUsd,
} from "../../lib/market/minTradeUsd"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(MIN_TRADE_USD === 1, "min is $1")
assert(MIN_TRADE_ICP === 0.05, "min is 0.05 ICP")
assert(MIN_TRADE_ICP_E8S === 5_000_000n, "min is 5M e8s")

const usd = tokenAmountUsd(5_361_702n, 8, 2.4)
assert(usd !== null && usd < 1, "tiny icp under $1")
assert(!meetsMinTradeUsd(usd), "reject under $1")
assert(meetsMinTradeUsd(tokenAmountUsd(100_000_000n, 8, 2.4)), "1 ICP ok")
assert(tokenAmountUsd(0n, 8, 2) === null, "zero")

// ICP tests
assert(!meetsMinTradeIcp(1_000_000n), "0.01 ICP under 0.05 ICP")
assert(meetsMinTradeIcp(5_000_000n), "0.05 ICP ok")
assert(meetsMinTradeIcp(100_000_000n), "1 ICP ok")

// Buy meetsMinTrade
assert(
  meetsMinTrade({ side: "buy", amountIn: 5_000_000n, tokenInDecimals: 8 }),
  "buy 0.05 ICP ok"
)
assert(
  !meetsMinTrade({ side: "buy", amountIn: 1_000_000n, tokenInDecimals: 8 }),
  "buy 0.01 ICP rejects"
)

// Sell meetsMinTrade with quote
assert(
  meetsMinTrade({
    side: "sell",
    amountIn: 100_000_000n,
    tokenInDecimals: 8,
    quoteOutRaw: 6_000_000n,
  }),
  "sell yielding 0.06 ICP ok"
)
assert(
  !meetsMinTrade({
    side: "sell",
    amountIn: 100_000_000n,
    tokenInDecimals: 8,
    quoteOutRaw: 2_000_000n,
  }),
  "sell yielding 0.02 ICP rejects"
)

// Sell estimation via priceInIcp
assert(
  meetsMinTrade({
    side: "sell",
    amountIn: 10_000_000n,
    tokenInDecimals: 8,
    priceInIcp: 1.0,
  }),
  "sell 0.1 tokens @ 1 ICP/token ok"
)

console.log("minTradeUsd ok")

