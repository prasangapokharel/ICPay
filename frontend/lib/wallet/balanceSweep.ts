import type { Identity } from "@icp-sdk/core/agent"
import type { Principal } from "@icp-sdk/core/principal"
import { fetchBalances, PINNED_LEDGER_IDS } from "@/services/tokens"
import { readHoldings } from "@/lib/wallet/holdingsCache"

const BATCH_SIZE = 5

export function tierALedgerIds(principal: string | undefined): string[] {
  const seen = new Set(PINNED_LEDGER_IDS)
  const ids = [...PINNED_LEDGER_IDS]
  if (principal) {
    for (const holding of readHoldings(principal) ?? []) {
      if (holding.balance > 0n && !seen.has(holding.ledgerId)) {
        seen.add(holding.ledgerId)
        ids.push(holding.ledgerId)
      }
    }
  }
  return ids
}

export async function fetchTokenBalancesTiered(
  allIds: string[],
  owner: Principal,
  subaccount: Uint8Array,
  identity: Identity | undefined,
  principal: string,
  onProgress: (map: Map<string, bigint>) => void
): Promise<Map<string, bigint>> {
  const tierA = tierALedgerIds(principal)
  const tierASet = new Set(tierA)
  const map = await fetchBalances(tierA, owner, subaccount, identity)

  const tierB = allIds.filter((id) => !tierASet.has(id))
  if (tierB.length > 0) {
    void sweepBatches(tierB, owner, subaccount, identity, map, onProgress)
  }

  return map
}

async function sweepBatches(
  ids: string[],
  owner: Principal,
  subaccount: Uint8Array,
  identity: Identity | undefined,
  map: Map<string, bigint>,
  onProgress: (map: Map<string, bigint>) => void
) {
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    await idleTick()
    const batch = ids.slice(i, i + BATCH_SIZE)
    const batchMap = await fetchBalances(batch, owner, subaccount, identity)
    for (const [id, balance] of batchMap) map.set(id, balance)
    onProgress(new Map(map))
  }
}

function idleTick(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => resolve())
    } else {
      setTimeout(resolve, 0)
    }
  })
}
