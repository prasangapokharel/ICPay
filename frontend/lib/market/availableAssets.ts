import type { TerminalPairRow } from "@/services/market/tradePairSnapshot"

export const AVAILABLE_ASSET_LIMIT = 12

export type PortfolioAssetRow = {
  ledgerId: string
  symbol: string
  name: string
  logoUrl: string | null
  decimals: number
  balance: bigint
  priceUsd: number | null
  change24h: number | null
  valueUsd: number | null
  pnl24hUsd: number | null
}

export function pickAvailableAssets(
  rows: TerminalPairRow[],
  limit = AVAILABLE_ASSET_LIMIT
): TerminalPairRow[] {
  return rows.filter((row) => row.hasPool).slice(0, Math.max(0, limit))
}

export function pickPortfolioAssets(
  rows: TerminalPairRow[],
  balances: Map<string, bigint>,
  limit = AVAILABLE_ASSET_LIMIT
): TerminalPairRow[] {
  return rows
    .filter((row) => (balances.get(row.baseLedgerId) ?? 0n) > 0n)
    .slice(0, Math.max(0, limit))
}

export function mergePositionBalances(
  wallet: { ledgerId: string; balance: bigint }[],
  trade: Map<string, bigint>
): Map<string, bigint> {
  const next = new Map<string, bigint>()
  for (const holding of wallet) {
    next.set(holding.ledgerId, holding.balance + (trade.get(holding.ledgerId) ?? 0n))
  }
  for (const [ledgerId, amount] of trade) {
    if (!next.has(ledgerId)) next.set(ledgerId, amount)
  }
  return next
}

export function tokenBalanceUsd(
  balance: bigint,
  decimals: number,
  priceUsd: number | null | undefined
): number | null {
  if (priceUsd == null || !Number.isFinite(priceUsd) || priceUsd < 0) return null
  const human = Number(balance) / 10 ** Math.max(0, decimals)
  if (!Number.isFinite(human)) return null
  return human * priceUsd
}

/** Approx 24h P&L on current holdings when cost basis is unknown. */
export function portfolioPnl24hUsd(
  valueUsd: number | null,
  change24hPct: number | null | undefined
): number | null {
  if (valueUsd == null || !Number.isFinite(valueUsd)) return null
  if (change24hPct == null || !Number.isFinite(change24hPct)) return null
  return valueUsd * (change24hPct / 100)
}

export function buildPortfolioAssetRows(
  rows: TerminalPairRow[],
  balances: Map<string, bigint>,
  limit = AVAILABLE_ASSET_LIMIT
): PortfolioAssetRow[] {
  return pickPortfolioAssets(rows, balances, limit).map((row) => {
    const balance = balances.get(row.baseLedgerId) ?? 0n
    const priceUsd = row.stats?.priceUsd ?? null
    const change24h = row.stats?.priceChange24h ?? null
    const valueUsd = tokenBalanceUsd(balance, row.base.decimals, priceUsd)
    return {
      ledgerId: row.baseLedgerId,
      symbol: row.base.symbol,
      name: row.base.name,
      logoUrl: row.base.logoUrl,
      decimals: row.base.decimals,
      balance,
      priceUsd,
      change24h,
      valueUsd,
      pnl24hUsd: portfolioPnl24hUsd(valueUsd, change24h),
    }
  })
}
