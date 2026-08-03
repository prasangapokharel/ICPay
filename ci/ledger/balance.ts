import { arg, dfx } from "../lib.ts"

// npm run ci ledger:balance [account-id]
//
// Defaults to the current dfx identity's main account. This is the operator's
// own ICP, not a user's custodial balance -- for those use canister:call.
dfx(["ledger", "balance", ...(arg(0) ? [arg(0)!] : [])])
