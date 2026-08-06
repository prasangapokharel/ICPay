// Moves accrued launch and username revenue to the treasury.
//
//   npm run ci backend:sweep
//
// Revenue sits in a subaccount only this canister can spend from until someone
// asks for it -- sweeping on every sale would put two ledger calls on the hot
// path to move funds that are in no hurry. The destination is Config.TREASURY
// and cannot be passed in, so a compromised call cannot redirect the money.
import { CANISTER, confirm, dfxOut, step } from "../lib.ts"

step("SWEEP")
confirm("move all accrued revenue to the treasury")

const out = dfxOut(["canister", "call", CANISTER, "sweepTokenRevenue", "--output", "json"])

if (out.includes('"err"')) {
  console.error(`\nSweep refused:\n${out}`)
  process.exit(1)
}

step("RESULT")
// The ok payload is the block index, which is what makes the transfer
// traceable on the ledger afterwards.
console.log(out)
