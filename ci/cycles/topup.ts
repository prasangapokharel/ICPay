import { CANISTER, arg, confirm, dfx, dfxOut, requireArg, resolveOwnedCanister, step } from "../lib.ts"

// npm run ci cycles:topup <cycles> [backend|trade|frontend|blob|icp_*|icpay_*]
//
// Sends cycles from this identity's cycles-ledger account to the canister.
// Deliberately not `dfx canister deposit-cycles`: that needs a cycles wallet
// canister and this project has none -- the cycles ledger is the wallet-free
// path. Run cycles:convert first if the ledger account is empty.
const amount = requireArg(0, "npm run ci cycles:topup <cycles> [backend|trade|frontend|blob]")
const targetArg = arg(1)
const target = targetArg ? (resolveOwnedCanister(targetArg) ?? targetArg) : CANISTER

if (targetArg && !resolveOwnedCanister(targetArg) && !targetArg.startsWith("icp_") && !targetArg.startsWith("icpay_")) {
  console.error(`Unknown canister: ${targetArg}`)
  console.error("Use: backend | trade | frontend | blob")
  process.exit(1)
}

console.log(`Cycles ledger holds: ${dfxOut(["cycles", "balance"])}`)

confirm(`send ${amount} cycles to ${target}`)

step("TOPUP")
dfx(["cycles", "top-up", target, amount])
