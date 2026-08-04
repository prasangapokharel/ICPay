import { confirm, dfx, dfxOut, requireArg, step } from "../lib.ts"

// npm run ci cycles:convert <icp>
//
// Burns ICP from this identity's ledger account and mints cycles into its
// cycles-ledger account. Two steps, not one: minting and depositing are
// separate, so cycles:topup still has to run afterwards to move them into the
// canister. Rate comes from the CMC and moves with the ICP price.
const icp = requireArg(0, "npm run ci cycles:convert <icp>")

if (!/^\d+(\.\d{1,8})?$/.test(icp)) {
  console.error(`Not a valid ICP amount: ${icp}  (up to 8 decimal places)`)
  process.exit(1)
}

console.log(`ICP balance:   ${dfxOut(["ledger", "balance"])}`)
console.log(`Cycles ledger: ${dfxOut(["cycles", "balance"])}`)

confirm(`burn ${icp} ICP into cycles`)

step("CONVERT")
dfx(["cycles", "convert", "--amount", icp])

step("CYCLES LEDGER")
dfx(["cycles", "balance"])

console.log(`\nNow move them into the canister: npm run ci cycles:topup <cycles>`)
