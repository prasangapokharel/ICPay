import { swapHashHref, swapHashLabel, truncateHash } from "../../lib/market/swapHash"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(truncateHash("abc") === "abc", "short")
assert(truncateHash("abcdefghijklmnop") === "abcdef…mnop", "mid")
assert(swapHashLabel("local-1") === null, "hide local")
assert(swapHashLabel("trade-abc2024") === "trade-abc2024", "show trade id")
assert(swapHashLabel("trade-abc2024", 0n) === "trade-abc2024", "ignore block 0")
assert(swapHashLabel("trade-abc2024", 38100881n) === "38100881", "trade with block")
assert(swapHashLabel("tx-9", 123n) === "123", "block")
assert(swapHashHref("tx-9", 12n)?.includes("/transaction/12") === true, "dashboard")
assert(swapHashHref("trade-x", 38100881n)?.includes("/transaction/38100881") === true, "trade dash")
assert(swapHashHref("uid-1") === "/transactions/uid-1", "wallet")
assert(swapHashHref("local-1") === null, "no local link")
assert(swapHashHref("trade-abc2024") === null, "no explorer for trade id")
assert(swapHashHref("trade-x", 0n) === null, "no explorer for block 0")
console.log("swapHash ok")
