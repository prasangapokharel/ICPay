import type { Identity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { call, type Outcome } from "@/services/client"
import { isHexAccountId } from "@/lib/wallet-utils"
import type { TransferResult } from "@/services/types"

// Sends ICP out to an external wallet. A legacy account identifier cannot go
// through `withdraw`, which takes an ICRC-1 account, so it is routed by shape.
export function withdraw(
  identity: Identity | undefined,
  amount: bigint,
  destination: string
): Promise<Outcome<TransferResult>> {
  return call(identity, "Withdrawal failed", (actor) =>
    isHexAccountId(destination)
      ? actor.transferByAccountId(destination, amount, [])
      : actor.withdraw(amount, {
          owner: Principal.fromText(destination),
          subaccount: [],
        })
  )
}
