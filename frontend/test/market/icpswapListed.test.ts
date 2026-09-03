import { listedTokenFromAllRow } from "../../services/market/icpswapStats"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

const row = {
  tokenLedgerId: "2ouva-viaaa-aaaaq-aaamq-cai",
  tokenName: "CHAT",
  tokenSymbol: "CHAT",
  price: "0.0824",
  priceChange24H: "5.1",
  tvlUSD: "94720",
  tvlUSDChange24H: "1.9",
  txCount24H: "9",
  volumeUSD24H: "77.9",
  volumeUSD7D: "400",
  totalVolumeUSD: "1000",
  priceLow24H: "0.08",
  priceHigh24H: "0.09",
  priceLow7D: "0.07",
  priceHigh7D: "0.14",
}

const listed = listedTokenFromAllRow(row)
if (!listed) throw new Error("parsed")
assert(listed.ledgerId === row.tokenLedgerId, "ledger")
assert(listed.symbol === "CHAT", "symbol")
assert(listed.stats.priceUsd > 0.08, "price")
assert(listedTokenFromAllRow({}) === null, "empty")
console.log("icpswap listed ok")
