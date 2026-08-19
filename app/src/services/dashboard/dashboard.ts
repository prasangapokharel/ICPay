import type { Identity } from "@icp-sdk/core/agent"
import { query, unwrap } from "@/services/client"
import { ICP_LEDGER_ID } from "@/services/tokens"
import type { DashboardData } from "@/services/types"

// A query, though a heavy one: it walks the ledger. Callers cache it and
// refresh on explicit action rather than polling.
export function getDashboard(
  identity: Identity | undefined,
  ledgerId: string = ICP_LEDGER_ID
): Promise<DashboardData> {
  return query(identity, async (actor) => unwrap(await actor.getDashboard(ledgerId)))
}
