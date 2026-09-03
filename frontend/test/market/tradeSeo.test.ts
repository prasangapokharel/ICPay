import {
  ledgerForPairSlug,
  pairSlug,
  parsePairSlug,
  tradePairHref,
  tradePairPath,
} from "../../lib/market/pairSlug"
import { liveTradeTitle, seoPriceLabel, uniquePairSlugs } from "../../lib/market/tradeSeo"
import type { IcpswapListedToken } from "../../services/market/icpswapStats"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(pairSlug("ckBTC") === "CKBTC_ICP", "slug")
assert(pairSlug("sGLDT") === "SGLDT_ICP", "alnum")
assert(parsePairSlug("ICS_ICP")?.base === "ICS", "parse")
assert(parsePairSlug("bad") === null, "bad slug")
assert(tradePairPath("CHAT") === "/market/trade/CHAT_ICP", "path")

const listed = [
  { symbol: "ICS", ledgerId: "a" },
  { symbol: "ICS", ledgerId: "b" },
  { symbol: "CHAT", ledgerId: "c" },
]
assert(tradePairHref("CHAT", "c", listed) === "/market/trade/CHAT_ICP", "unique href")
assert(tradePairHref("ICS", "b", listed).includes("base=b"), "clash query")
assert(ledgerForPairSlug("CHAT_ICP", listed) === "c", "resolve")
assert(ledgerForPairSlug("ICS_ICP", listed, "b") === "b", "prefer")

assert(seoPriceLabel(58.21) === "58.21", "price")
assert(
  liveTradeTitle({
    symbol: "ICS",
    quoteSymbol: "ICP",
    name: "ICPSwap Token",
    priceUsd: 0.002351,
  }).includes("Trade ICS/ICP Spot"),
  "title"
)

const tokens: IcpswapListedToken[] = [
  {
    ledgerId: "mxzaz-hqaaa-aaaar-qaada-cai",
    name: "ckBTC",
    symbol: "ckBTC",
    stats: {
      tokenName: "ckBTC",
      tokenSymbol: "ckBTC",
      priceUsd: 1,
      priceChange24h: 0,
      tvlUsd: 1,
      tvlChange24h: 0,
      volume24hUsd: 1,
      volume7dUsd: 1,
      totalVolumeUsd: 1,
      txCount24h: 1,
      priceLow24h: 1,
      priceHigh24h: 1,
      priceLow7d: 1,
      priceHigh7d: 1,
    },
  },
]
assert(uniquePairSlugs(tokens)[0] === "CKBTC_ICP", "unique slugs")
console.log("tradeSeo ok")
