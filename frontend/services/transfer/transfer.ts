import type { Identity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { call, optional, type Outcome } from "@/services/client"
import { isHexAccountId } from "@/lib/wallet-utils"
import type { TransferResult } from "@/services/types"

// How the recipient field was interpreted by the form. A 64-char hex account
// identifier is recognised by shape and overrides this.
export type TransferMode = "username" | "principal" | "account"

// One entry point for all four transfer methods: the destination format decides
// which the canister gets, so no page has to branch on it.
export function transfer(
  identity: Identity | undefined,
  mode: TransferMode,
  to: string,
  amount: bigint,
  memo?: string
): Promise<Outcome<TransferResult>> {
  return call(identity, "Transfer failed", (actor) => {
    const arg = optional(memo)
    if (isHexAccountId(to)) return actor.transferByAccountId(to, amount, arg)
    switch (mode) {
      case "username":
        return actor.transferByUsername(to, amount, arg)
      case "principal":
        return actor.transferByPrincipal(Principal.fromText(to), amount, arg)
      case "account":
        return actor.transferByAccount(
          { owner: Principal.fromText(to), subaccount: [] },
          amount,
          arg
        )
    }
  })
}

// Tips are transfers to a handle. Named separately because the caller knows the
// recipient is a username and should not have to pick a mode.
export function tip(
  identity: Identity | undefined,
  username: string,
  amount: bigint,
  memo?: string
): Promise<Outcome<TransferResult>> {
  return call(identity, "Tip failed", (actor) =>
    actor.transferByUsername(username, amount, optional(memo))
  )
}
