import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { IcrcIndexCanister } from "@icp-sdk/canisters/ledger/icrc"
import { createAgent } from "@/services/icp"

export function icrcIndex(identity: Identity | undefined, indexCanisterId: string) {
  return createAgent(identity).then((agent) =>
    IcrcIndexCanister.create({
      agent,
      canisterId: Principal.fromText(indexCanisterId),
    })
  )
}
