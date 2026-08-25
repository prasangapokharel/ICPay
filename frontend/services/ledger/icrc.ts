import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc"
import { createAgent } from "@/services/icp"

export function icrcLedger(identity: Identity | undefined, ledgerId: string) {
  return createAgent(identity).then((agent) =>
    IcrcLedgerCanister.create({
      agent,
      canisterId: Principal.fromText(ledgerId),
    })
  )
}
