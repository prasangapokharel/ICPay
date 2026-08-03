import { CANISTER, arg, dfx } from "../lib.ts"

// Cycles, memory, controllers, module hash. Defaults to the backend canister.
dfx(["canister", "status", arg(0) ?? CANISTER])
