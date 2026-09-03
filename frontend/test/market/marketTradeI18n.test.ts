import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

const root = join(import.meta.dirname, "../../language")
const keys = [
  "tvl",
  "tvlChange24h",
  "priceUsd",
  "change24h",
  "volume24h",
  "filterAll",
  "tabToken",
  "colSide",
  "max",
] as const

for (const loc of readdirSync(root)) {
  const file = join(root, loc, "common.json")
  if (!existsSync(file)) continue
  const data = JSON.parse(readFileSync(file, "utf8")) as {
    marketTrade: Record<string, string>
    marketOverview: Record<string, string>
  }
  for (const key of keys) {
    assert(typeof data.marketTrade[key] === "string" && data.marketTrade[key].length > 0, `${loc}.${key}`)
  }
  assert(typeof data.marketOverview.colTvl === "string", `${loc}.overview.colTvl`)
  assert(typeof data.marketOverview.tabOverview === "string", `${loc}.overview.tabOverview`)
  assert(typeof data.marketOverview.tabTradingData === "string", `${loc}.overview.tabTradingData`)
  assert(typeof data.marketTrade.colCoin === "string", `${loc}.trade.colCoin`)
  assert(typeof data.marketTrade.colAvailable === "string", `${loc}.trade.colAvailable`)
  assert(typeof data.marketTrade.colPnl === "string", `${loc}.trade.colPnl`)
}

console.log("marketTradeI18n ok")
