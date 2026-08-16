import { ICPAY_LEDGER_ID } from "@/services/icpay/icpay"
import { ICP_LEDGER_ID, PINNED_LEDGER_IDS, type TokenHolding } from "@/services/tokens"

/** ICPAY has no ICPSwap liquidity — keep it out of the swap picker. */
export function isSwapToken(ledgerId: string): boolean {
  return ledgerId !== ICPAY_LEDGER_ID
}

export function filterSwapTokens(holdings: TokenHolding[]): TokenHolding[] {
  return holdings.filter((t) => isSwapToken(t.ledgerId))
}

function pinRank(ledgerId: string): number {
  const i = PINNED_LEDGER_IDS.indexOf(ledgerId)
  return i === -1 ? PINNED_LEDGER_IDS.length : i
}

/** Pinned tokens first, then by balance, then symbol. */
export function sortSwapTokens(tokens: TokenHolding[]): TokenHolding[] {
  return [...tokens].sort((a, b) => {
    const pr = pinRank(a.ledgerId) - pinRank(b.ledgerId)
    if (pr !== 0) return pr
    if (a.balance !== b.balance) return a.balance > b.balance ? -1 : 1
    return a.symbol.localeCompare(b.symbol)
  })
}

export function defaultSwapPair(tokens: TokenHolding[]): { tokenIn: TokenHolding; tokenOut: TokenHolding } | null {
  const list = sortSwapTokens(filterSwapTokens(tokens))
  if (list.length < 2) return null
  const icp = list.find((t) => t.ledgerId === ICP_LEDGER_ID)
  const ck = list.find((t) => t.ledgerId !== ICP_LEDGER_ID && t.balance > 0n)
  if (icp && ck && ck.ledgerId !== icp.ledgerId) {
    return ck.balance > icp.balance ? { tokenIn: ck, tokenOut: icp } : { tokenIn: icp, tokenOut: ck }
  }
  return { tokenIn: list[0], tokenOut: list[1] }
}
