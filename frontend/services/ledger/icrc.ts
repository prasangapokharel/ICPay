import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc"
import { createAgent } from "@/services/icp"

const feeCache = new Map<string, bigint>()

export function icrcLedger(identity: Identity | undefined, ledgerId: string) {
  return createAgent(identity).then((agent) =>
    IcrcLedgerCanister.create({
      agent,
      canisterId: Principal.fromText(ledgerId),
    })
  )
}

export async function icrcTransferFee(
  identity: Identity | undefined,
  ledgerId: string,
  knownFee?: bigint
): Promise<bigint> {
  if (knownFee !== undefined) return knownFee
  const cached = feeCache.get(ledgerId)
  if (cached !== undefined) return cached

  const agent = await createAgent(identity)
  const ledger = IcrcLedgerCanister.create({
    agent,
    canisterId: Principal.fromText(ledgerId),
  })
  const fee = await ledger.transactionFee({ certified: false })
  feeCache.set(ledgerId, fee)
  return fee
}
