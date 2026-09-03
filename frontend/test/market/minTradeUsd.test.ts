import { meetsMinTradeUsd, MIN_TRADE_USD, tokenAmountUsd } from "../../lib/market/minTradeUsd"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(MIN_TRADE_USD === 1, "min is $1")
const usd = tokenAmountUsd(5_361_702n, 8, 2.4)
assert(usd !== null && usd < 1, "tiny icp under $1")
assert(!meetsMinTradeUsd(usd), "reject under $1")
assert(meetsMinTradeUsd(tokenAmountUsd(100_000_000n, 8, 2.4)), "1 ICP ok")
assert(tokenAmountUsd(0n, 8, 2) === null, "zero")
console.log("minTradeUsd ok")
