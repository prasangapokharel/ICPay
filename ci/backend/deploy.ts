import { BACKEND, CANISTER, confirm, dfx, moduleHash, run, step } from "../lib.ts"

// Upgrade, never reinstall: reinstall wipes every user, balance record and
// transaction. There is deliberately no flag for it here -- if it is ever truly
// needed it should be typed by hand, with the consequence in front of you.

step("TESTS")
run("bash", ["scripts/run-tests.sh"], BACKEND)

step("BUILD")
dfx(["build", CANISTER])

const before = moduleHash()
console.log(`\nCurrent module hash: ${before}`)

confirm("upgrade the mainnet canister holding live user funds")

step("DEPLOY")
dfx(["deploy", CANISTER, "--yes"])

step("RESULT")
const after = moduleHash()
console.log(`before: ${before}`)
console.log(`after:  ${after}`)
if (before === after) {
  console.log("\nModule hash unchanged -- nothing was deployed.")
} else {
  console.log(`\nRollback with:\n  npm run ci backend:rollback <previous-commit> ${before}`)
}
