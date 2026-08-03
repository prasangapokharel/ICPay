import { CANISTER, dfx, step } from "../lib.ts"

step("BUILD")
dfx(["build", CANISTER])
