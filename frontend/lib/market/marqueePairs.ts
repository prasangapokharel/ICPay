import type { TerminalPairRow } from "@/services/market/tradePairSnapshot"

export const MARQUEE_PAIR_LIMIT = 24

export function pickMarqueePairs(
  rows: TerminalPairRow[],
  limit = MARQUEE_PAIR_LIMIT
): TerminalPairRow[] {
  return rows
    .filter((row) => row.hasPool && row.stats && row.stats.priceUsd > 0)
    .slice(0, Math.max(0, limit))
}
