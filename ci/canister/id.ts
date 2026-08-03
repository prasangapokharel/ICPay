import { CANISTER, arg, dfx } from "../lib.ts"

dfx(["canister", "id", arg(0) ?? CANISTER])
