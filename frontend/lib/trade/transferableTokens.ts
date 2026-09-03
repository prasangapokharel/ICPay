import type { TokenHolding } from "@/services/tokens"

export function tokensForInternalTransfer(
  holdings: TokenHolding[],
  tradeBalances: Map<string, bigint>,
  toWallet: boolean
): TokenHolding[] {
  return holdings.flatMap((holding) => {
    const trade = tradeBalances.get(holding.ledgerId) ?? 0n
    const source = toWallet ? trade : holding.balance
    if (source <= 0n) return []
    return [{ ...holding, balance: source }]
  })
}
