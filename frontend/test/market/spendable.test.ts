import { mergeSpendable } from "../../lib/market/spendable"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(mergeSpendable(0n, 1777074325n) === 1777074325n, "trade-only")
assert(mergeSpendable(100n, 50n) === 150n, "wallet plus trade")
assert(mergeSpendable(null, null) === 0n, "empty")
console.log("spendable ok")
