import type { Identity } from "@icp-sdk/core/agent"
import { query, unwrap } from "@/services/client"
import { ICP_LEDGER_ID } from "@/services/tokens"
import type { DashboardData } from "@/services/types"

// An update call: consensus plus an inter-canister call to the ledger, measured
// at ~6.6s. Callers cache it and refresh on explicit action rather than polling.
export function getDashboard(
  identity: Identity | undefined,
  ledgerId: string = ICP_LEDGER_ID
): Promise<DashboardData> {
  return query(identity, async (actor) => unwrap(await actor.getDashboard(ledgerId)))
}
