import { SNS_BASE, assert, getJson } from "./client.js"

export async function run() {
  const body = await getJson(`${SNS_BASE}/snses?limit=5`)
  assert(Array.isArray(body.data) && body.data.length > 0, "sns list")
  assert(body.data[0].ledger_canister_id, "sns ledger")
  console.log("discovery ok")
}
