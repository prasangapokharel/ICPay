import { marketRankImage, MARKET_RANK_IMAGES } from "../../lib/market/rankBadge"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(MARKET_RANK_IMAGES.length === 3, "three ranks")
assert(marketRankImage(1)?.endsWith("/1.png") === true, "rank 1")
assert(marketRankImage(4) === null, "out of range")
console.log("rankBadge ok")
