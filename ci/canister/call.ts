import { CANISTER, dfx, requireArg } from "../lib.ts"

// npm run ci canister:call <method> ['(args)']
//
// Defaults to a query so a typo cannot cost a consensus round or mutate state.
// Pass --update for methods that write.
const method = requireArg(0, "npm run ci canister:call <method> ['(candid args)'] [--update]")
const args = process.argv.slice(3).filter((a) => !a.startsWith("--"))[1] ?? "()"
const mode = process.argv.includes("--update") ? [] : ["--query"]

dfx(["canister", "call", CANISTER, method, args, ...mode])
