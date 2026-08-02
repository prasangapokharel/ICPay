import type { Identity } from "@dfinity/agent"
import { call, query, type Outcome } from "@/services/client"
import type { Purchase } from "@/services/types"

// The canister charges the treasury transfer first and assigns the name only
// once the ledger confirms, so a rejected payment never yields a handle.
export function purchaseUsername(
  identity: Identity | undefined,
  name: string
): Promise<Outcome<Purchase>> {
  return call(identity, "Purchase failed", (actor) => actor.purchaseUsername(name))
}

// Authoritative price. lib/username mirrors this rule for per-keystroke display;
// this is the number the canister will actually charge.
export function getUsernamePrice(
  identity: Identity | undefined,
  name: string
): Promise<bigint> {
  return query(identity, (actor) => actor.getUsernamePrice(name))
}

// A query call, so it is safe to run while the buyer types. Availability is
// canister state and cannot be derived locally the way the price can.
export function checkUsername(
  identity: Identity | undefined,
  name: string
): Promise<boolean> {
  return query(identity, (actor) => actor.checkUsername(name))
}
