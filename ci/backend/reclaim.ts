// Reclaims cycles from a canister a failed launch left behind.
//
//   npm run ci backend:reclaim <canister-id>
//
// A launch that dies between create and install leaves an empty canister
// holding the ~2 ICP of cycles the fee bought. ICPay controls it, not this
// identity, so recovery is two steps: ICPay signs it over, then we delete it.
//
// ICPay does not delete it itself on purpose -- Management.mo declares no
// delete_canister, so no future bug in the launch path can destroy a live
// token. Recovering cycles is not worth giving that up.
import { CANISTER, capture, confirm, dfx, dfxOut, requireArg, step } from "../lib.ts"

const target = requireArg(0, "npm run ci backend:reclaim <canister-id>")

step("INSPECT")
const info = dfxOut(["canister", "info", target])
console.log(info)

// A live ledger holds real balances. An installed module is what distinguishes
// it from the empty shell of a failed launch, and the canister-side check
// refuses on status too -- this one is here so we stop before prompting.
if (!/Module hash: None/.test(info)) {
  console.error("\nThis canister has a module installed -- it is not an empty shell.")
  console.error("Refusing: a live ledger holds real balances.")
  process.exit(1)
}

const me = capture("dfx", ["identity", "get-principal"]).trim()
console.log(`\nWill be signed over to: ${me}`)

confirm(`take control of ${target} from ICPay and delete it`)

// ICPay verifies the id belongs to a #failed launch before signing anything
// over, so a mistyped argument cannot hand away a live token.
step("RELEASE")
const released = dfxOut([
  "canister", "call", CANISTER, "releaseFailedCanister",
  `("${target}", principal "${me}")`, "--output", "json",
])
if (released.includes('"err"') || !released.includes('"ok"')) {
  console.error(`\nICPay refused to release it:\n${released}`)
  process.exit(1)
}
console.log("ICPay signed it over.")

step("STOP")
dfx(["canister", "stop", target])

step("DELETE")
dfx(["canister", "delete", target, "--yes"])

step("RESULT")
console.log(`${target} deleted; its cycles are back with this identity.`)
console.log(`Cycles ledger holds: ${dfxOut(["cycles", "balance"])}`)
console.log(`\nSend them on to the canister with:\n  npm run ci cycles:topup <cycles>`)
