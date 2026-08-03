import { CANISTER, arg, confirm, dfx, requireArg, step } from "../lib.ts"

// npm run ci cycles:topup <amount> [canister]
//
// Spends real cycles from the wallet of the current identity.
const amount = requireArg(0, "npm run ci cycles:topup <amount> [canister]")
const target = arg(1) ?? CANISTER

confirm(`send ${amount} cycles to ${target}`)

step("TOPUP")
dfx(["canister", "deposit-cycles", amount, target])
