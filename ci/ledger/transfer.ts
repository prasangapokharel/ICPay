import { confirm, dfx, requireArg, step } from "../lib.ts"

// npm run ci ledger:transfer <account-id> <e8s>
//
// Moves real ICP out of the current identity's own account. User funds are never
// reachable this way -- those live in canister subaccounts and only the owning
// principal can move them.
const to = requireArg(0, "npm run ci ledger:transfer <account-id> <e8s>")
const e8s = requireArg(1, "npm run ci ledger:transfer <account-id> <e8s>")

confirm(`transfer ${e8s} e8s to ${to}`)

step("TRANSFER")
dfx(["ledger", "transfer", to, "--e8s", e8s, "--memo", "0"])
