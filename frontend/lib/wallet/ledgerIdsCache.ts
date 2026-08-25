import type { Identity } from "@icp-sdk/core/agent"
import { listLedgerIds } from "@/services/tokens"

const TTL_MS = 600_000
const cache = new Map<string, { ids: string[]; at: number }>()

export async function getCachedLedgerIds(identity?: Identity): Promise<string[]> {
  const principal = identity?.getPrincipal().toText() ?? "anonymous"
  const hit = cache.get(principal)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.ids
  const ids = await listLedgerIds(identity)
  cache.set(principal, { ids, at: Date.now() })
  return ids
}
