import { CANISTER, arg, dfxOut } from "../lib.ts"

// Cycles are what keep the canister alive: at zero it is deleted, taking every
// user record with it. This is the number to watch.
const status = dfxOut(["canister", "status", arg(0) ?? CANISTER])
const cycles = status.match(/Balance: ([\d_]+) Cycles/)?.[1]

if (!cycles) {
  console.log(status)
  process.exit(1)
}

const raw = Number(cycles.replace(/_/g, ""))
console.log(`${cycles} cycles  (${(raw / 1e12).toFixed(2)}T)`)
