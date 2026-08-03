import { CANISTER, dfx } from "../lib.ts"

dfx(["canister", "logs", CANISTER])
