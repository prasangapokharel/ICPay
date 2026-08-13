import type { Identity } from "@icp-sdk/core/agent"
import { getWalletActor, type WalletActor } from "@/services/wallet"

// Every canister method that can fail returns this shape.
export type Outcome<T> = { ok: T } | { err: string }

// Candid `opt text` is an array of zero or one element.
export const optional = (value?: string): [] | [string] => (value ? [value] : [])

// Wraps a fallible update call so pages branch one way -- check "err" -- instead
// of a try/catch plus an "err" in result test at every call site.
export async function call<T>(
  identity: Identity | undefined,
  fallback: string,
  fn: (actor: WalletActor) => Promise<Outcome<T>>
): Promise<Outcome<T>> {
  if (!identity) return { err: "Not authenticated" }
  try {
    return await fn(await getWalletActor(identity))
  } catch (e) {
    console.error(e)
    const msg = e instanceof Error ? e.message : String(e)
    if (
      msg.includes("too large") ||
      msg.includes("413") ||
      msg.includes("2097152") ||
      msg.includes("max allowed")
    ) {
      return { err: msg }
    }
    return { err: fallback }
  }
}

// Throwing is the right signal inside a SWR fetcher: it flips the hook's error
// state.
export async function query<T>(
  identity: Identity | undefined,
  fn: (actor: WalletActor) => Promise<T>
): Promise<T> {
  if (!identity) throw new Error("Not authenticated")
  return fn(await getWalletActor(identity))
}

// Lets an Outcome-returning method be read through SWR, which signals failure by
// rejection rather than by return value.
export function unwrap<T>(result: Outcome<T>): T {
  if ("err" in result) throw new Error(result.err)
  return result.ok
}
