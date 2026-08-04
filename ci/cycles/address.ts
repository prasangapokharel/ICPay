import { dfxOut } from "../lib.ts"

// npm run ci cycles:address
//
// Where to send ICP that is destined to become cycles. This is the operator
// identity's own ledger account -- not a user's custodial account and not the
// canister, neither of which can receive ICP that cycles:convert could spend.
console.log(`Principal   ${dfxOut(["identity", "get-principal"])}`)
console.log(`Account ID  ${dfxOut(["ledger", "account-id"])}`)
console.log(`ICP balance ${dfxOut(["ledger", "balance"])}`)
console.log(`\nSend ICP to the account ID, then: npm run ci cycles:convert <icp>`)
