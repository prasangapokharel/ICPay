import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { SnsWasmCanister } from "@icp-sdk/canisters/nns"
import { createAgent } from "@/services/icp"

const SNS_WASM_ID = "qaa6y-5yaaa-aaaaa-aaafa-cai"
const TTL_MS = 1_800_000

export type SnsRegistryRow = {
  ledgerId: string
  rootCanisterId?: string
  swapCanisterId?: string
  governanceCanisterId?: string
}

let cache: { at: number; rows: SnsRegistryRow[] } | null = null
let inflight: Promise<SnsRegistryRow[]> | null = null

export async function fetchSnsRegistryList(identity?: Identity): Promise<SnsRegistryRow[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows
  if (inflight) return inflight

  inflight = (async () => {
    const agent = await createAgent(identity)
    const wasm = SnsWasmCanister.create({
      agent,
      canisterId: Principal.fromText(SNS_WASM_ID),
    })
    const instances = await wasm.listSnses({ certified: false })
    const rows = instances.flatMap((row) => {
      const ledgerId = row.ledger_canister_id[0]?.toText()
      if (!ledgerId) return []
      return [
        {
          ledgerId,
          rootCanisterId: row.root_canister_id[0]?.toText(),
          swapCanisterId: row.swap_canister_id[0]?.toText(),
          governanceCanisterId: row.governance_canister_id[0]?.toText(),
        },
      ]
    })
    cache = { at: Date.now(), rows }
    return rows
  })()
    .catch(() => cache?.rows ?? [])
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function findSnsRegistryRow(
  rows: SnsRegistryRow[],
  ledgerId: string
): SnsRegistryRow | undefined {
  return rows.find((row) => row.ledgerId === ledgerId)
}
