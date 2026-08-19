import type { TokenHolding } from "@/services/tokens"

// A reload starts with an empty SWR cache, so /wallet and the token page both
// painted skeletons for the several seconds the ledger sweep takes -- a wallet
// that looks empty every time you refresh. Seeding from the last known holdings
// paints real numbers immediately and lets the live values replace them.
const KEY = "icpay:holdings:"

type Stored = Omit<TokenHolding, "balance" | "fee"> & { balance: string; fee: string }

export function readHoldings(principal: string): TokenHolding[] | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const raw = localStorage.getItem(KEY + principal)
    if (!raw) return undefined
    return (JSON.parse(raw) as Stored[]).map((h) => ({
      ...h,
      balance: BigInt(h.balance),
      fee: BigInt(h.fee),
    }))
  } catch {
    // An entry written by an older shape is not worth reasoning about; the
    // ledgers are already being read and will overwrite it.
    return undefined
  }
}

export function writeHoldings(principal: string, holdings: TokenHolding[]) {
  try {
    localStorage.setItem(
      KEY + principal,
      JSON.stringify(
        holdings.map((h) => ({ ...h, balance: h.balance.toString(), fee: h.fee.toString() }))
      )
    )
  } catch {
    // Private-browsing quota rejections must not break the wallet.
  }
}

/** Apply ledger deltas to the last cached holdings so /wallet updates before the sweep returns. */
export function patchHoldings(
  principal: string,
  updates: { ledgerId: string; delta: bigint }[]
): TokenHolding[] | undefined {
  const current = readHoldings(principal)
  if (!current?.length) return undefined
  const next = current.map((h) => {
    const hit = updates.find((u) => u.ledgerId === h.ledgerId)
    if (!hit) return h
    const balance = h.balance + hit.delta
    return { ...h, balance: balance > 0n ? balance : 0n }
  })
  writeHoldings(principal, next)
  return next
}
