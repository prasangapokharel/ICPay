import type { Identity } from "@dfinity/agent"
import { query, unwrap } from "@/services/client"
import type { DashboardData } from "@/services/types"

// An update call: consensus plus an inter-canister call to the ledger, measured
// at ~6.6s. Callers cache it and refresh on explicit action rather than polling.
export function getDashboard(
  identity: Identity | undefined
): Promise<DashboardData> {
  return query(identity, async (actor) => unwrap(await actor.getDashboard()))
}
