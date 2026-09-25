import {
  tradeServiceFee,
  amountAfterServiceFee,
  requiredWalletDebit,
  minTradeInput,
  maxTradeInput,
  minAmountOut,
  tradeRate,
  projectedBalancesAfterTrade,
  TAKER_FEE_BPS,
  MAKER_FEE_BPS,
} from "../../lib/trade/fees"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

// Service fee computation
assert(tradeServiceFee(0n) === 0n, "zero in has zero fee")
assert(tradeServiceFee(10_000n, false) === 15n, "15 bps taker fee")
assert(tradeServiceFee(10_000n, true) === 5n, "5 bps maker fee")
assert(tradeServiceFee(100n, false) === 1n, "min service fee applied for small amounts")

// Amount after service fee
assert(amountAfterServiceFee(10_000n, false) === 10_000n - 15n, "amount after taker fee")
assert(amountAfterServiceFee(10_000n, true) === 10_000n - 5n, "amount after maker fee")
assert(amountAfterServiceFee(0n) === 0n, "zero amount after fee")

// Wallet debit & limits
assert(requiredWalletDebit(100_000n, 10_000n) === 110_000n, "required debit includes ledger fee")
assert(minTradeInput(10_000n) > 30_000n, "min trade input covers ledger fee headroom")
assert(maxTradeInput(100_000n, 10_000n) === 90_000n, "max trade input reserves fee")
assert(maxTradeInput(5_000n, 10_000n) === 0n, "insufficient balance for fee returns 0")

// Slippage protection
assert(minAmountOut(10_000n, 100n) === 9_900n, "100 bps default slippage produces 99% min out")
assert(minAmountOut(10_000n, 50n) === 9_950n, "50 bps slippage produces 99.5% min out")
assert(minAmountOut(0n) === 0n, "zero out has zero min")

// Trade rate computation
assert(tradeRate(100_000_000n, 200_000_000n) === "2", "2x rate formatted cleanly")
assert(tradeRate(100_000_000n, 150_000_000n) === "1.5", "1.5x rate formatted cleanly")
assert(tradeRate(0n, 100n) === null, "zero in returns null rate")

// Projected balances after trade
const proj = projectedBalancesAfterTrade(1_000n, 500n, 300n, 700n)
assert(proj.afterIn === 700n, "input subtracted")
assert(proj.afterOut === 1200n, "output added")

console.log("trade fees ok")
