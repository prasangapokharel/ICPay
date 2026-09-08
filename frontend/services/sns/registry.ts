import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { SnsWasmCanister } from "@icp-sdk/canisters/nns"
import { createAgent } from "@/services/icp"
import { SNS_WASM_CANISTER_ID } from "@/lib/sns/constants"

export type SnsRegistryRow = {
  ledgerId: string
  rootCanisterId?: string
  swapCanisterId?: string
  governanceCanisterId?: string
}

let inflight: Promise<SnsRegistryRow[]> | null = null

async function loadSnsRegistry(identity?: Identity): Promise<SnsRegistryRow[]> {
  const agent = await createAgent(identity)
  const wasm = SnsWasmCanister.create({
    agent,
    canisterId: Principal.fromText(SNS_WASM_CANISTER_ID),
  })
  const instances = await wasm.listSnses({ certified: false })
  return instances.flatMap((row) => {
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
}

/** Query SNS-W for every deployed SNS. Concurrent callers share one in-flight request. */
export async function fetchSnsRegistryList(identity?: Identity): Promise<SnsRegistryRow[]> {
  if (!inflight) {
    inflight = loadSnsRegistry(identity).finally(() => {
      inflight = null
    })
  }
  return inflight
}

export function findSnsRegistryRow(
  rows: SnsRegistryRow[],
  ledgerId: string
): SnsRegistryRow | undefined {
  return rows.find((row) => row.ledgerId === ledgerId)
}

export function snsRootPrincipal(
  rows: SnsRegistryRow[],
  ledgerId: string
): Principal | null {
  const hit = findSnsRegistryRow(rows, ledgerId)
  return hit?.rootCanisterId ? Principal.fromText(hit.rootCanisterId) : null
}
