import { ICRC_BASE, assert, getJson } from "./client.js"

export async function run() {
  const list = await getJson(
    `${ICRC_BASE}/ledgers?limit=5&network=mainnet&has_transactions=true`
  )
  assert(Array.isArray(list.data) && list.data.length > 0, "ledgers list")

  const first = list.data[0]
  assert(first.ledger_canister_id, "ledger id")
  assert(first.icrc1_metadata?.icrc1_symbol, "symbol")

  const detail = await getJson(`${ICRC_BASE}/ledgers/${first.ledger_canister_id}`)
  const row = detail.data ?? detail
  assert(row.ledger_canister_id === first.ledger_canister_id, "detail id")

  console.log("tokens ok")
}
