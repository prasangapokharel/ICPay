import { BACKEND } from "../lib.ts"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// Only the two canisters this project owns. The others in dfx.json (ledger,
// internet_identity) are external dependencies pulled in for local replica runs,
// and asking mainnet for their id would just echo a well-known constant.
const OWNED = ["icp_wallet_backend", "icp_wallet_frontend"]

const ids = JSON.parse(readFileSync(join(BACKEND, "canister_ids.json"), "utf8"))

for (const name of OWNED) {
  console.log(`${name.padEnd(22)} ${ids[name]?.ic ?? "(not deployed)"}`)
}
