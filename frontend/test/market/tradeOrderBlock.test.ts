import { tradeOrderBlock } from "../../lib/market/tradeOrderBlock"
import { showWalletLine, tradeCta } from "../../lib/market/tradeAuthUi"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(tradeOrderBlock({
  tradingBal: 0n, amountIn: 1n, maxIn: 0n, aboveMinUsd: true, hasQuote: true,
}) === "need_transfer", "zero trading")

assert(tradeOrderBlock({
  tradingBal: 100n, amountIn: null, maxIn: 90n, aboveMinUsd: true, hasQuote: false,
}) === "empty", "no amount")

assert(tradeOrderBlock({
  tradingBal: 100n, amountIn: 91n, maxIn: 90n, aboveMinUsd: true, hasQuote: true,
}) === "insufficient", "over max")

assert(tradeOrderBlock({
  tradingBal: 100n, amountIn: 50n, maxIn: 90n, aboveMinUsd: false, hasQuote: true,
}) === "min_usd", "under $1")

assert(tradeOrderBlock({
  tradingBal: 100n, amountIn: 50n, maxIn: 90n, aboveMinUsd: true, hasQuote: false,
}) === "no_quote", "waiting quote")

assert(tradeOrderBlock({
  tradingBal: 100n, amountIn: 50n, maxIn: 90n, aboveMinUsd: true, hasQuote: true,
}) === "ok", "ready")

assert(!showWalletLine(0n), "hide zero wallet")
assert(showWalletLine(1n), "show wallet with funds")
assert(tradeCta(true, true) === "wait", "auth loading")
assert(tradeCta(false, false) === "sign_in", "guest")
assert(tradeCta(false, true) === "trade", "signed in")

console.log("tradeOrderBlock ok")
