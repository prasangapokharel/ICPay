import { CANISTER, arg, dfxOut } from "../lib.ts"

// Cycles are what keep the canister alive: at zero it is deleted, taking every
// user record with it. This is the number to watch.
const status = dfxOut(["canister", "status", arg(0) ?? CANISTER])

const field = (name: string): number | undefined => {
  const raw = status.match(new RegExp(`${name}: ([\\d_]+)`))?.[1]
  return raw ? Number(raw.replace(/_/g, "")) : undefined
}

const balance = field("Balance")
const perDay = field("Idle cycles burned per day")
const freezing = field("Freezing threshold")

if (balance === undefined) {
  console.log(status)
  process.exit(1)
}

const T = (n: number): string => `${(n / 1e12).toFixed(2)}T`
console.log(`Balance   ${balance.toLocaleString("en-US")}  (${T(balance)})`)

// The freezing threshold reserves that many seconds of idle burn, and the
// canister stops accepting update calls once it falls below. So the number that
// matters is what sits above the reserve, not the raw balance.
if (perDay && freezing) {
  const reserve = (perDay / 86_400) * freezing
  const days = Math.floor((balance - reserve) / perDay)
  console.log(`Idle burn ${perDay.toLocaleString("en-US")} cycles/day`)
  console.log(`Reserved  ${T(reserve)}  (${freezing / 86_400}d freezing threshold)`)
  console.log(`Runway    ${days} days above the reserve`)
  if (days < 60) console.log(`\nLow. Top up with: npm run ci cycles:convert <ICP>`)
}
