// Allowlists every already-launched token ledger.
//
//   npm run ci backend:register
//
// Only needed for tokens launched before the launch path registered its own
// ledger; new launches do it themselves. The endpoint takes no argument -- the
// ids come from the canister's own token rows -- so this cannot point the
// custodian at a canister it did not create.
import { CANISTER, confirm, dfxOut, step } from "../lib.ts"

step("REGISTER")
confirm("allowlist every launched token ledger")

const out = dfxOut(["canister", "call", CANISTER, "registerLaunchedLedgers", "--output", "json"])

if (out.includes('"err"')) {
  console.error(`\nRegistration refused:\n${out}`)
  process.exit(1)
}

step("RESULT")
// The ok payload is how many were newly added; zero means they were already
// allowlisted, which is the expected result on a second run.
console.log(out)
