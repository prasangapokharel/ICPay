import { fillNoticeDescription, formatFillClock } from "../../lib/market/fillNoticeCopy"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

const clock = formatFillClock(1_704_067_200_000)
assert(clock.length > 0, "clock")
const copy = fillNoticeDescription({
  side: "Sell",
  amount: 266_447_000_000n,
  decimals: 8,
  symbol: "YUKU",
  at: 1_704_067_200_000,
})
assert(copy.startsWith("Sell "), "side")
assert(copy.includes("YUKU"), "symbol")
assert(copy.includes(" · "), "time sep")
assert(!copy.includes("Filled"), "no status in description")
console.log("fillNoticeCopy ok")
