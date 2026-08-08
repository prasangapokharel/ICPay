import type { Identity } from "@icp-sdk/core/agent"
import { call, query, type Outcome } from "@/services/client"
import type { ICRC1Account, TransactionPublic } from "@/services/types"

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

// Credits whatever landed on-ledger since the last sync. "No new deposits
// found" is the normal answer, not a failure -- callers should render it as a
// neutral note rather than an error state.
export function syncDeposits(
  identity: Identity | undefined,
  ledgerId: string
): Promise<Outcome<TransactionPublic>> {
  return call(identity, "Failed to sync deposits", (actor) => actor.syncDeposits(ledgerId))
}
