import { tradeOrderAlert, tradeOrderBlock, canSubmitTrade, canOpenTransfer } from "../../lib/market/tradeOrderBlock"
import { classifyTradeQuoteError, classifyTradeExecError, shouldRetryTradeQuote } from "../../lib/market/tradeQuoteError"
import { showWalletLine, tradeCta } from "../../lib/market/tradeAuthUi"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

const ready = {
  tradingBal: 100n, amountIn: 50n, maxIn: 90n, aboveMinUsd: true, hasQuote: true,
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

assert(
  tradeOrderBlock({ ...ready, impactBand: "block" }) === "no_liquidity",
  "impact gate"
)

assert(tradeOrderBlock({ ...ready, blocked: true }) === "blocked", "blocked token")
assert(tradeOrderBlock({ ...ready, hasPool: false }) === "no_pool", "no pool first")
assert(
  tradeOrderBlock({ ...ready, hasQuote: false, quoteError: "liquidity" }) === "no_liquidity",
  "thin pool"
)
assert(
  tradeOrderBlock({ ...ready, hasQuote: false, quoteError: "too_small" }) === "too_small",
  "dust amount"
)
assert(
  tradeOrderBlock({ ...ready, hasQuote: false, quoting: true }) === "no_quote",
  "still quoting"
)

assert(canSubmitTrade("ok") === true, "submit ok")
assert(canSubmitTrade("no_liquidity") === false, "block thin pool")
assert(canOpenTransfer("need_transfer") === true, "open transfer")
assert(canOpenTransfer("no_pool") === false, "no transfer without pool")

assert(tradeOrderAlert("no_pool", 1)?.key === "noPoolHint", "pool alert")
assert(tradeOrderAlert("no_liquidity", 1)?.destructive === true, "liquidity destructive")
assert(tradeOrderAlert("min_usd", 1)?.values?.usd === 1, "min usd")
assert(tradeOrderAlert("quote_error", 1, "unsupported")?.key === "unsupportedToken", "unsupported")
assert(tradeOrderAlert("insufficient", 1) === null, "balance lives on the button")
assert(tradeOrderAlert("ok", 1) === null, "no alert when ready")

assert(classifyTradeQuoteError(new Error("No pool found for a / b")) === "no_pool", "pool err")
assert(classifyTradeQuoteError(new Error("Quote failed: Insufficient funds")) === "liquidity", "pool funds")
assert(classifyTradeQuoteError(new Error("ICPAY cannot be traded on ICPay")) === "blocked", "blocked err")
assert(classifyTradeQuoteError(new Error("amountIn too small after fees")) === "too_small", "dust err")
assert(shouldRetryTradeQuote(new Error("No pool liquidity")) === false, "no retry liquidity")
assert(shouldRetryTradeQuote(new Error("network down")) === true, "retry unknown")
assert(classifyTradeExecError(new Error("slippage exceeded")) === "slippage", "slippage")
assert(classifyTradeExecError(new Error("timeout")) === "timeout", "timeout")

assert(!showWalletLine(0n), "hide zero wallet")
assert(showWalletLine(1n), "show wallet with funds")
assert(tradeCta(true, true) === "wait", "auth loading")
assert(tradeCta(false, false) === "sign_in", "guest")
assert(tradeCta(false, true) === "trade", "signed in")

console.log("tradeOrderBlock ok")
