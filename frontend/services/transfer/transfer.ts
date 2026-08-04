import type { Identity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { call, optional, type Outcome } from "@/services/client"
import { isHexAccountId } from "@/lib/wallet-utils"
import { ICP_LEDGER_ID } from "@/services/tokens"
import type { TransferResult } from "@/services/types"

// How the recipient field was interpreted by the form. A 64-char hex account
// identifier is recognised by shape and overrides this.
export type TransferMode = "username" | "principal" | "account"

// One entry point for all four transfer methods: the destination format decides
// which the canister gets, so no page has to branch on it.
export function transfer(
  identity: Identity | undefined,
  ledgerId: string,
  mode: TransferMode,
  to: string,
  amount: bigint,
  memo?: string,
  subaccount?: Uint8Array
): Promise<Outcome<TransferResult>> {
  return call(identity, "Transfer failed", (actor) => {
    const arg = optional(memo)
    // Account identifiers are an ICP-ledger concept and no other ICRC-1 ledger
    // implements the legacy transfer method, so this path stays ICP-only and
    // takes no ledgerId.
    if (isHexAccountId(to)) return actor.transferByAccountId(to, amount, arg)
    // A subaccount outranks the tab: transferByPrincipal has nowhere to put one,
    // so honouring the mode here would pay the owner's default account instead
    // of the account the address named, and report success.
    if (subaccount) {
      return actor.transferByAccount(
        ledgerId,
        { owner: Principal.fromText(to), subaccount: [subaccount] },
        amount,
        arg
      )
    }
    switch (mode) {
      case "username":
        return actor.transferByUsername(ledgerId, to, amount, arg)
      case "principal":
        return actor.transferByPrincipal(ledgerId, Principal.fromText(to), amount, arg)
      case "account":
        return actor.transferByAccount(
          ledgerId,
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
  memo?: string,
  ledgerId: string = ICP_LEDGER_ID
): Promise<Outcome<TransferResult>> {
  return call(identity, "Tip failed", (actor) =>
    actor.transferByUsername(ledgerId, username, amount, optional(memo))
  )
}
