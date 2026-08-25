import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { IcManagementCanister } from "@icp-sdk/canisters/ic-management"
import { createAgent } from "@/services/icp"

export async function fetchCanisterStatus(
  canisterId: string,
  identity?: Identity,
  certified = false
) {
  const agent = await createAgent(identity)
  const management = IcManagementCanister.create({ agent })
  return management.canisterStatus({
    canisterId: Principal.fromText(canisterId),
    certified,
  })
}

export async function fetchCanisterLogs(canisterId: string, identity?: Identity) {
  const agent = await createAgent(identity)
  const management = IcManagementCanister.create({ agent })
  return management.fetchCanisterLogs(Principal.fromText(canisterId))
}
