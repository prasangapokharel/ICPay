import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { IcrcIndexCanister, IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc"
import { createAgent } from "@/services/icp"

export type IcrcTxRow = {
  id: bigint
  timestamp: bigint
  kind: string
  amount: bigint
  counterparty?: string
}

export type IcrcHistoryPage = {
  rows: IcrcTxRow[]
  oldestId?: bigint
  hasMore: boolean
}

export async function fetchIcrcTransactions(
  identity: Identity | undefined,
  ledgerId: string,
  owner: Principal,
  subaccount?: Uint8Array,
  maxResults = 10n,
  start?: bigint
): Promise<IcrcHistoryPage> {
  const agent = await createAgent(identity)
  const ledger = IcrcLedgerCanister.create({
    agent,
    canisterId: Principal.fromText(ledgerId),
  })

  let indexId: Principal
  try {
    indexId = await ledger.getIndexPrincipal({ certified: false })
  } catch {
    return { rows: [], hasMore: false }
  }

  const index = IcrcIndexCanister.create({ agent, canisterId: indexId })
  const page = await index.getTransactions({
    certified: false,
    account: subaccount ? { owner, subaccount } : { owner },
    max_results: maxResults,
    start,
  })

  const rows = page.transactions.flatMap((row) => {
    const tx = row.transaction
    if (!tx || tx.kind.toLowerCase() !== "transfer") return []
    const transfer = tx.transfer[0]
    if (!transfer) return []

    const incoming =
      transfer.to.owner.toText() === owner.toText() &&
      bytesEqual(transfer.to.subaccount[0], subaccount)

    return [
      {
        id: row.id,
        timestamp: tx.timestamp,
        kind: incoming ? "receive" : "send",
        amount: transfer.amount,
        counterparty: incoming
          ? transfer.from.owner.toText()
          : transfer.to.owner.toText(),
      },
    ]
  })

  const oldest = page.oldest_tx_id[0]
  return {
    rows,
    oldestId: oldest,
    hasMore: oldest !== undefined && rows.length > 0,
  }
}

function bytesEqual(a?: Uint8Array, b?: Uint8Array): boolean {
  const left = a ?? new Uint8Array(0)
  const right = b ?? new Uint8Array(0)
  if (left.length !== right.length) return false
  return left.every((v, i) => v === right[i])
}
