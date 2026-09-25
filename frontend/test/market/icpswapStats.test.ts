import {
  statsFromIcpswapRow,
  listedTokenFromAllRow,
} from "../../services/market/icpswapStats"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

// Invalid and null input handling
assert(statsFromIcpswapRow(null) === null, "null returns null")
assert(statsFromIcpswapRow(undefined) === null, "undefined returns null")
assert(statsFromIcpswapRow({}) === null, "missing price returns null")

// Valid stats mapping
const validRow = {
  tokenName: "Dragon Karma Points",
  tokenSymbol: "DKP",
  price: "0.0002586",
  priceChange24H: "4.70",
  tvlUSD: "2070000",
  tvlUSDChange24H: "-0.5",
  volumeUSD24H: "2290",
  volumeUSD7D: "15000",
  totalVolumeUSD: "100000",
  txCount24H: "45",
  priceLow24H: "0.0002465",
  priceHigh24H: "0.0002708",
  priceLow7D: "0.0002000",
  priceHigh7D: "0.0003000",
}

const stats = statsFromIcpswapRow(validRow)
assert(stats !== null, "valid parsed")
assert(stats!.tokenSymbol === "DKP", "symbol mapped")
assert(stats!.priceUsd === 0.0002586, "price parsed")
assert(stats!.priceChange24h === 4.70, "change parsed")
assert(stats!.tvlUsd === 2070000, "tvl parsed")
assert(stats!.volume24hUsd === 2290, "volume parsed")

// Listed token parser
assert(listedTokenFromAllRow(null) === null, "null listed row")
assert(listedTokenFromAllRow({}) === null, "missing ledger id returns null")

const listed = listedTokenFromAllRow({
  tokenLedgerId: "zfcdd-tqaaa-aaaaq-aaaga-cai",
  ...validRow,
})
assert(listed !== null, "valid listed token")
assert(listed!.ledgerId === "zfcdd-tqaaa-aaaaq-aaaga-cai", "ledger id mapped")
assert(listed!.symbol === "DKP", "symbol mapped")

console.log("icpswap stats parser ok")
