import { Actor, type Identity } from "@icp-sdk/core/agent"
import { createAgent, clearAgentCache, TRADE_CANISTER_ID } from "@/services/icp"
import type { TradeActor } from "@/services/trade/types"
import { tradeIdl } from "@/services/trade/idl"

let cachedActor: TradeActor | null = null
let cachedIdentity: Identity | null = null

export async function getTradeActor(identity?: Identity): Promise<TradeActor> {
  if (cachedActor && cachedIdentity === identity) {
    return cachedActor
  }

  const agent = await createAgent(identity)
  const actor = Actor.createActor<TradeActor>(tradeIdl, {
    agent,
    canisterId: TRADE_CANISTER_ID,
  })

  cachedActor = actor
  cachedIdentity = identity ?? null
  return actor
}

export function clearTradeActorCache(): void {
  cachedActor = null
  cachedIdentity = null
  clearAgentCache()
}
