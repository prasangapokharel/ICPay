import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { IcrcIndexCanister, IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc"
import { createAgent } from "@/services/icp"
import { ICP_LEDGER_ID } from "@/services/tokens"

export async function fetchIcrcSubaccounts(
  identity: Identity | undefined,
  ledgerId: string,
  owner: Principal
): Promise<Uint8Array[]> {
  const agent = await createAgent(identity)
  const ledger = IcrcLedgerCanister.create({
    agent,
    canisterId: Principal.fromText(ledgerId),
  })

  let indexId: Principal
  try {
    indexId = await ledger.getIndexPrincipal({ certified: false })
  } catch {
    return []
  }

  const index = IcrcIndexCanister.create({ agent, canisterId: indexId })
  return index.listSubaccounts({ certified: false, owner })
}

export async function fetchIcpCustodialSubaccounts(
  identity: Identity | undefined,
  owner: Principal
): Promise<Uint8Array[]> {
  return fetchIcrcSubaccounts(identity, ICP_LEDGER_ID, owner)
}
