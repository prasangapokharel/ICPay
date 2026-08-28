import { Actor, type Identity } from "@icp-sdk/core/agent"
import { createAgent, clearAgentCache, WALLET_CANISTER_ID } from "@/services/icp"
import type { WalletActor } from "@/services/wallet/types"
import { walletIdl } from "@/services/wallet/idl"

let cachedActor: WalletActor | null = null
let cachedIdentity: Identity | null = null

export async function getWalletActor(identity?: Identity): Promise<WalletActor> {
  if (cachedActor && cachedIdentity === identity) {
    return cachedActor
  }

  const agent = await createAgent(identity)
  const actor = Actor.createActor<WalletActor>(walletIdl, {
    agent,
    canisterId: WALLET_CANISTER_ID,
  })

  cachedActor = actor
  cachedIdentity = identity ?? null
  return actor
}

export function clearActorCache(): void {
  cachedActor = null
  cachedIdentity = null
  clearAgentCache()
}
