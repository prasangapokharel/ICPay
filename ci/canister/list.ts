import { OWNED_CANISTERS, canisterIds } from "../lib.ts"

// npm run ci canister:list
//
// The three canisters ICPay owns on mainnet. Ledger and II in dfx.json are
// external — pulled only for local replica runs.
const ids = canisterIds()

for (const { name, label } of OWNED_CANISTERS) {
  const id = ids[name]?.ic ?? "(not deployed)"
  console.log(`${label.padEnd(14)} ${name.padEnd(22)} ${id}`)
}
