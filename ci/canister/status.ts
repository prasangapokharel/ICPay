import { CANISTER, arg, dfx, resolveOwnedCanister } from "../lib.ts"

// npm run ci canister:status [backend|frontend|blob]
const targetArg = arg(0)
const target = targetArg ? (resolveOwnedCanister(targetArg) ?? targetArg) : CANISTER
dfx(["canister", "status", target])
