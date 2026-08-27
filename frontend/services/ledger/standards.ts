import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc"
import { createAgent } from "@/services/icp"

export async function fetchLedgerStandards(
  identity: Identity | undefined,
  ledgerId: string
): Promise<string[]> {
  const agent = await createAgent(identity)
  const ledger = IcrcLedgerCanister.create({
    agent,
    canisterId: Principal.fromText(ledgerId),
  })
  const rows = await ledger.icrc1SupportedStandards({ certified: false })
  return rows.map((r) => r.name)
}
