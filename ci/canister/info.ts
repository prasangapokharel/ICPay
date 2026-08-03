import { CANISTER, arg, dfx } from "../lib.ts"

// Module hash and controllers -- the two facts that say what is running and who
// can change it.
dfx(["canister", "info", arg(0) ?? CANISTER])
