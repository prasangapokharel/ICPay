import { CANISTER, dfxOut } from "../lib.ts"
import { spawnSync } from "node:child_process"
import { BACKEND, network } from "../lib.ts"

// npm run ci users:count
//
// One free query (`getUsernameCount`). Counts claimed @handles only — accounts
// that logged in but never picked a username are not included.
//
// Cycle cost: 0 (query). The old searchUsers alphabet sweep fired 37–1,369
// queries per run; queries are also free on the IC but hammered the boundary
// node and took minutes. Do not restore that loop here.

const env = { ...process.env, DFX_WARNING: "-mainnet_plaintext_identity" }
const res = spawnSync(
  "dfx",
  ["canister", "call", CANISTER, "getUsernameCount", "--query", "--network", network()],
  { cwd: BACKEND, env, encoding: "utf8" },
)

if (res.status !== 0) {
  const err = res.stderr?.trim() || res.stdout?.trim() || "query failed"
  if (err.includes("getUsernameCount")) {
    console.error("getUsernameCount is not on the live canister yet.")
    console.error("Deploy backend first: npm run ci backend:deploy")
  } else {
    console.error(err)
  }
  process.exit(1)
}

const out = res.stdout?.trim() ?? ""
const n = Number(out.replace(/[^\d]/g, "") || "0")
console.log(`Usernames: ${n.toLocaleString("en-US")}`)
