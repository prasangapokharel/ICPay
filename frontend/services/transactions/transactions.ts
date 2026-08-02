import type { Identity } from "@dfinity/agent"
import { query, unwrap } from "@/services/client"
import type { TransactionPublic } from "@/services/types"

export type TransactionPage = {
  items: TransactionPublic[]
  total: bigint
  page: bigint
  pageSize: bigint
}

export function getTransactions(
  identity: Identity | undefined,
  page: number,
  pageSize: number
): Promise<TransactionPage> {
  return query(identity, async (actor) =>
    unwrap(await actor.getTransactions(BigInt(page), BigInt(pageSize)))
  )
}
