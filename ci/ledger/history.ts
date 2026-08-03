import { CANISTER, ICP_INDEX, arg, dfx, dfxOut } from "../lib.ts"

// npm run ci ledger:history [principal] [count]
//
// Reads the NNS index canister rather than the ledger: the ledger only answers
// "what is the balance now", the index is what keeps the per-account log.
// Defaults to the backend canister's main account.
const owner = arg(0) ?? dfxOut(["canister", "id", CANISTER])
const count = arg(1) ?? "10"

const account = `record { owner = principal "${owner}"; subaccount = null }`

dfx([
  "canister",
  "call",
  ICP_INDEX,
  "get_account_transactions",
  `(record { account = ${account}; start = null; max_results = ${count} : nat })`,
  "--query",
])
