import { CANISTER, arg, confirm, dfx, dfxOut, requireArg, step } from "../lib.ts"

// npm run ci cycles:topup <cycles> [canister]
//
// Sends cycles from this identity's cycles-ledger account to the canister.
// Deliberately not `dfx canister deposit-cycles`: that needs a cycles wallet
// canister and this project has none -- the cycles ledger is the wallet-free
// path. Run cycles:convert first if the ledger account is empty.
const amount = requireArg(0, "npm run ci cycles:topup <cycles> [canister]")
const target = arg(1) ?? CANISTER

console.log(`Cycles ledger holds: ${dfxOut(["cycles", "balance"])}`)

confirm(`send ${amount} cycles to ${target}`)

step("TOPUP")
dfx(["cycles", "top-up", target, amount])
