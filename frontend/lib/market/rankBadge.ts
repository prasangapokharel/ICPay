export const MARKET_RANK_IMAGES = [
  "/images/pages/market/rank/1.png",
  "/images/pages/market/rank/2.png",
  "/images/pages/market/rank/3.png",
] as const

export function marketRankImage(rank: number): string | null {
  if (rank < 1 || rank > 3) return null
  return MARKET_RANK_IMAGES[rank - 1] ?? null
}
