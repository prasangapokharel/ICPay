import { OWNED_CANISTERS, arg, canisterIds, dfxOut, resolveOwnedCanister } from "../lib.ts"

// npm run ci cycles:balance [backend|frontend|blob]
//
// With no arg, prints balance + runway for all three owned canisters.
// Cycles are what keep a canister alive — at zero it is deleted.
const T = (n: number): string => `${(n / 1e12).toFixed(2)}T`

function printBalance(name: string, label: string): void {
  const status = dfxOut(["canister", "status", name])

  const field = (fieldName: string): number | undefined => {
    const raw = status.match(new RegExp(`${fieldName}: ([\\d_]+)`))?.[1]
    return raw ? Number(raw.replace(/_/g, "")) : undefined
  }

  const balance = field("Balance")
  const perDay = field("Idle cycles burned per day")
  const freezing = field("Freezing threshold")
  const id = canisterIds()[name]?.ic ?? name

  console.log(`\n=== ${label} (${id}) ===`)

  if (balance === undefined) {
    console.log(status)
    return
  }

  console.log(`Balance   ${balance.toLocaleString("en-US")}  (${T(balance)})`)

  if (perDay && freezing) {
    const reserve = (perDay / 86_400) * freezing
    const days = Math.floor((balance - reserve) / perDay)
    console.log(`Idle burn ${perDay.toLocaleString("en-US")} cycles/day`)
    console.log(`Reserved  ${T(reserve)}  (${freezing / 86_400}d freezing threshold)`)
    console.log(`Runway    ${days} days above the reserve`)
    if (days < 60) console.log(`Low — top up: npm run ci cycles:topup <cycles> ${name}`)
  }
}

const target = arg(0)
const resolved = resolveOwnedCanister(target)

if (target && !resolved) {
  console.error(`Unknown canister: ${target}`)
  console.error("Use: backend | frontend | blob | icp_wallet_backend | icp_wallet_frontend | icp_blob_store")
  process.exit(1)
}

if (resolved) {
  const entry = OWNED_CANISTERS.find((c) => c.name === resolved)!
  printBalance(entry.name, entry.label)
} else {
  for (const { name, label } of OWNED_CANISTERS) {
    printBalance(name, label)
  }
}
