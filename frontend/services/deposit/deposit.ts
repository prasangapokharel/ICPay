import type { Identity } from "@icp-sdk/core/agent"
import { query } from "@/services/client"
import type { ICRC1Account } from "@/services/types"

export type DepositAddress = {
  address: ICRC1Account
  accountId: string
}

// Both forms of one destination: the ICRC-1 account ICP wallets take, and the
// legacy identifier exchanges ask for. Derived, so it never changes per user.
export function getDepositAddress(
  identity: Identity | undefined
): Promise<DepositAddress> {
  return query(identity, async (actor) => {
    const [address, accountId] = await Promise.all([
      actor.getDepositAddress(),
      actor.getDepositAccountIdentifier(),
    ])
    return { address, accountId }
  })
}
