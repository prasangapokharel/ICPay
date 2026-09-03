import {
  estimatePriceImpactPct,
  impactPctLabel,
  isTradeTokenSafe,
  priceImpactBand,
  shouldQuoteTrade,
} from "../../lib/market/tradePreflight"
import { tradeOrderBlock, tradeImpactAlert } from "../../lib/market/tradeOrderBlock"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(isTradeTokenSafe({ symbol: "ckBTC", decimals: 8 }) === true, "safe")
assert(isTradeTokenSafe({ symbol: "", decimals: 8 }) === false, "no symbol")
assert(isTradeTokenSafe({ symbol: "X", decimals: 99 }) === false, "bad decimals")

assert(estimatePriceImpactPct(null, 100) === null, "no trade")
assert(estimatePriceImpactPct(10, null) === null, "unknown tvl defers")
assert(estimatePriceImpactPct(10, 0) === 100, "empty pool is max impact")
assert(Math.abs((estimatePriceImpactPct(3.74, 74.7) ?? 0) - 5) < 0.1, "5% of thin pool")

assert(priceImpactBand(0.4) === "ok", "tiny")
assert(priceImpactBand(2) === "warn", "warn")
assert(priceImpactBand(8) === "confirm", "confirm")
assert(priceImpactBand(20) === "block", "block")
assert(priceImpactBand(null) === null, "unknown")
assert(impactPctLabel(7.4) === 7, "label")

assert(
  shouldQuoteTrade({ hasPool: true, blocked: false, amountIn: 1n, impactBand: "warn" }) === true,
  "quote warn"
)
assert(
  shouldQuoteTrade({ hasPool: true, blocked: false, amountIn: 1n, impactBand: "block" }) === false,
  "skip quote when too large"
)
assert(
  shouldQuoteTrade({ hasPool: false, blocked: false, amountIn: 1n, impactBand: "ok" }) === false,
  "skip quote without pool"
)

assert(
  tradeOrderBlock({
    tradingBal: 100n, amountIn: 50n, maxIn: 90n, aboveMinUsd: true, hasQuote: true, impactBand: "block",
  }) === "no_liquidity",
  "impact blocks submit"
)
assert(
  tradeOrderBlock({
    tradingBal: 100n, amountIn: 50n, maxIn: 90n, aboveMinUsd: true, hasQuote: true, impactBand: "confirm",
  }) === "ok",
  "confirm still ok"
)
assert(tradeImpactAlert("warn", 2)?.key === "highPriceImpact", "warn alert")
assert(tradeImpactAlert("confirm", 8)?.values?.pct === 8, "confirm pct")
assert(tradeImpactAlert("ok", 0.2) === null, "no alert under 1%")

console.log("tradePreflight ok")
