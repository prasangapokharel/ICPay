import assert from "node:assert/strict"
import {
  estimateCyclesFromE8s,
  formatCycles,
  maxTopUpAmount,
  walletCostForTopUp,
  walletShortfall,
} from "@/services/cycles/topUp"

const rate = 15_278n
const oneIcp = 100_000_000n
const fee = 10_000n
const cycles = estimateCyclesFromE8s(oneIcp, rate)
assert.equal(cycles, oneIcp * rate)
assert.equal(estimateCyclesFromE8s(0n, rate), 0n)
assert.ok(formatCycles(cycles).includes("T"))

assert.equal(walletShortfall(oneIcp, 0n, fee), oneIcp + fee)
assert.equal(walletShortfall(oneIcp, oneIcp + fee, fee), 0n)
assert.equal(walletShortfall(oneIcp, oneIcp, fee), fee)
assert.equal(walletCostForTopUp(oneIcp, 0n, fee), oneIcp + fee + fee)
assert.equal(walletCostForTopUp(oneIcp, oneIcp + fee, fee), 0n)

assert.equal(maxTopUpAmount(40_980_000n, 0n, fee), 40_980_000n - fee * 2n)
assert.equal(maxTopUpAmount(0n, oneIcp, fee), oneIcp - fee)
assert.ok(maxTopUpAmount(5_000_000_000n, 0n, fee) <= 5_000_000_000n)

console.log("PASS: cycles estimate + wallet shortfall helpers")

